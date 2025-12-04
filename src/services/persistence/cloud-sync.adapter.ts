
import { Injectable } from '@angular/core';
import { StorageAdapter, RealmState } from './storage-adapter.interface';
import { TraceNode } from '../../shared/types/core.types';

@Injectable()
export class CloudSyncAdapter implements StorageAdapter {
  saveNode(node: TraceNode): Promise<void> {
    console.log('CloudSyncAdapter: saveNode called (not implemented)', node);
    return Promise.resolve();
  }

  getNode(hash: string): Promise<TraceNode | undefined> {
    console.log('CloudSyncAdapter: getNode called (not implemented)', hash);
    return Promise.resolve(undefined);
  }

  getAllNodes(): Promise<TraceNode[]> {
    console.log('CloudSyncAdapter: getAllNodes called (not implemented)');
    return Promise.resolve([]);
  }

  saveRealmState(state: RealmState): Promise<void> {
    console.log('CloudSyncAdapter: saveRealmState called (not implemented)', state);
    return Promise.resolve();
  }

  getRealmState(id: string): Promise<RealmState | undefined> {
    console.log('CloudSyncAdapter: getRealmState called (not implemented)', id);
    return Promise.resolve(undefined);
  }
}
