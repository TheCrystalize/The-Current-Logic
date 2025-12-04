
import { Injectable } from '@angular/core';
import { StorageAdapter, RealmState } from './storage-adapter.interface';
import { TraceNode } from '../../shared/types/core.types';

const DB_NAME = 'TheCurrentLogicDB';
const DB_VERSION = 1;
const NODES_STORE = 'nodes';
const REALM_STATE_STORE = 'realmState';

@Injectable()
export class IndexedDbAdapter implements StorageAdapter {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(NODES_STORE)) {
          db.createObjectStore(NODES_STORE, { keyPath: 'hash' });
        }
        if (!db.objectStoreNames.contains(REALM_STATE_STORE)) {
          db.createObjectStore(REALM_STATE_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.dbPromise;
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  async saveNode(node: TraceNode): Promise<void> {
    const store = await this.getStore(NODES_STORE, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(node);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getNode(hash: string): Promise<TraceNode | undefined> {
    const store = await this.getStore(NODES_STORE, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(hash);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getAllNodes(): Promise<TraceNode[]> {
    const store = await this.getStore(NODES_STORE, 'readonly');
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
  }

  async saveRealmState(state: RealmState): Promise<void> {
    const store = await this.getStore(REALM_STATE_STORE, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(state);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getRealmState(id: string): Promise<RealmState | undefined> {
    const store = await this.getStore(REALM_STATE_STORE, 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
