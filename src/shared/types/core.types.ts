
export interface OriginScalar {
  class: 1 | 2 | 3;
  timestamp: number;
  id: string;
  confidence: number;
}

export interface Locus {
  origin: OriginScalar;
  payload: any;
}

export interface TraceOperation {
  timestamp: number;
  operation: string;
  payload: any;
}

export interface TraceNode {
  hash: string;
  prevHash: string | null;
  timestamp: number;
  operations: TraceOperation[];
  metadata: any;
}

export type AutonomyMode = 'STRICT' | 'GUIDED' | 'FULL';
