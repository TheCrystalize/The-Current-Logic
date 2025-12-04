
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { TraceNode, TraceOperation, AutonomyMode } from '../../shared/types/core.types';
import { HashingUtil } from '../../shared/utils/hashing.util';
import { SuperNodeBuffer } from './super-node-buffer.class';
import { STORAGE_ADAPTER, StorageAdapter } from '../../services/persistence/storage-adapter.interface';

const REALM_ID = 'default_realm';

@Injectable({ providedIn: 'root' })
export class MerkleDagService {
  private hashingUtil = inject(HashingUtil);
  private storage = inject(STORAGE_ADAPTER);

  // State Signals
  readonly nodes = signal<TraceNode[]>([]);
  readonly headHash = signal<string | null>(null);
  readonly currentStress = signal<number>(0.5);
  readonly autonomyMode = signal<AutonomyMode>('GUIDED');
  readonly isInitialized = signal(false);

  // Buffer
  private superNodeBuffer: SuperNodeBuffer;

  // Computed Signals
  readonly clusterLimit = computed(() => this.determineClusterLimit());
  readonly bufferSize = computed(() => this.superNodeBuffer?.size || 0);
  readonly headNode = computed(() => {
    const hash = this.headHash();
    if (!hash) return null;
    return this.nodes().find(n => n.hash === hash) ?? null;
  });
  
  readonly sortedNodes = computed(() => {
    const nodeMap = new Map(this.nodes().map(n => [n.hash, n]));
    const sorted: TraceNode[] = [];
    let current = this.headNode();
    while (current) {
      sorted.unshift(current);
      current = current.prevHash ? nodeMap.get(current.prevHash) : null;
    }
    return sorted;
  });

  constructor() {
    this.superNodeBuffer = new SuperNodeBuffer(this.hashingUtil);
    this.initialize();

    // Effect to persist headHash whenever it changes
    effect(async () => {
      const hash = this.headHash();
      if (this.isInitialized()) { // Only save after initial load
        await this.storage.saveRealmState({ id: REALM_ID, headHash: hash });
      }
    });
  }

  private async initialize(): Promise<void> {
    const realmState = await this.storage.getRealmState(REALM_ID);
    const allNodes = await this.storage.getAllNodes();
    this.nodes.set(allNodes);
    if (realmState) {
      this.headHash.set(realmState.headHash);
    }
    this.isInitialized.set(true);
  }

  async addOperation(operation: Partial<TraceOperation>): Promise<void> {
    const fullOperation: TraceOperation = {
      timestamp: Date.now(),
      operation: operation.operation || 'generic_op',
      payload: operation.payload || {},
    };

    this.superNodeBuffer.addOperation(fullOperation);
    
    // This is a workaround for the signal not updating the view
    // A better approach would be to make buffer size a signal
    this.superNodeBuffer = this.superNodeBuffer; 


    if (this.superNodeBuffer.size >= this.clusterLimit()) {
      await this.freezeAndPersist();
    }
  }

  async forceFreeze(): Promise<void> {
    if (this.superNodeBuffer.size > 0) {
      await this.freezeAndPersist();
    }
  }

  private async freezeAndPersist(): Promise<void> {
    if (this.superNodeBuffer.size === 0) return;

    try {
      const newNode = await this.superNodeBuffer.freeze(this.headHash());
      await this.storage.saveNode(newNode);
      
      this.nodes.update(nodes => [...nodes, newNode]);
      this.headHash.set(newNode.hash);
      
      this.superNodeBuffer.clear();
      // This is a workaround for the signal not updating the view
      this.superNodeBuffer = this.superNodeBuffer;
    } catch (error) {
      console.error('Failed to freeze and persist node:', error);
    }
  }

  private determineClusterLimit(): number {
    const stress = this.currentStress();
    const mode = this.autonomyMode();
    
    if (stress > 0.8 || mode === 'STRICT') {
      return 1; // Granular, hash every step.
    }
    if (stress < 0.2 && mode === 'FULL') {
      return 50; // High performance batching.
    }
    // Medium Stress or Guided Mode
    return 10;
  }
}
