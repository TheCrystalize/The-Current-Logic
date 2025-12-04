
import { InjectionToken } from '@angular/core';
import { TraceNode } from '../../shared/types/core.types';

export interface RealmState {
  id: string;
  headHash: string | null;
}

export interface StorageAdapter {
  saveNode(node: TraceNode): Promise<void>;
  getNode(hash: string): Promise<TraceNode | undefined>;
  getAllNodes(): Promise<TraceNode[]>;
  saveRealmState(state: RealmState): Promise<void>;
  getRealmState(id: string): Promise<RealmState | undefined>;
}

export const STORAGE_ADAPTER = new InjectionToken<StorageAdapter>('StorageAdapter');
