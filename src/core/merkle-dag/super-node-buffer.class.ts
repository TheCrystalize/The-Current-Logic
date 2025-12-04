
import { HashingUtil } from '../../shared/utils/hashing.util';
import { TraceNode, TraceOperation } from '../../shared/types/core.types';

export class SuperNodeBuffer {
  private operations: TraceOperation[] = [];

  constructor(private hashingUtil: HashingUtil) {}

  addOperation(operation: TraceOperation): void {
    this.operations.push(operation);
  }

  get size(): number {
    return this.operations.length;
  }

  clear(): void {
    this.operations = [];
  }

  async freeze(prevHash: string | null): Promise<TraceNode> {
    if (this.size === 0) {
      throw new Error('Cannot freeze an empty buffer.');
    }

    const nodeContent = {
      prevHash,
      timestamp: Date.now(),
      operations: this.operations,
    };

    const hash = await this.hashingUtil.computeHash(nodeContent);

    const frozenNode: TraceNode = {
      hash,
      prevHash: nodeContent.prevHash,
      timestamp: nodeContent.timestamp,
      operations: this.operations,
      metadata: {
        operationCount: this.operations.length,
      },
    };

    return frozenNode;
  }
}
