/**
 * Protocol package — DTOs, graph contracts, and diff contracts.
 */

/** Unique identifier for a graph node or edge. */
export type NodeId = string;
export type EdgeId = string;

/** A node in the dataflow graph. */
export interface GraphNode {
  readonly id: NodeId;
  readonly label: string;
  readonly kind: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** A directed edge between two nodes. */
export interface GraphEdge {
  readonly id: EdgeId;
  readonly sourceId: NodeId;
  readonly targetId: NodeId;
  readonly label?: string;
}

/** A complete graph snapshot. */
export interface GraphSnapshot {
  readonly version: number;
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
}

/** Supported diff operation types. */
export type DiffOperationType = "add" | "remove" | "update";

export interface NodeDiffOperation {
  readonly type: DiffOperationType;
  readonly node: GraphNode;
}

export interface EdgeDiffOperation {
  readonly type: DiffOperationType;
  readonly edge: GraphEdge;
}

/** An incremental diff between two graph versions. */
export interface GraphDiff {
  readonly fromVersion: number;
  readonly toVersion: number;
  readonly nodeOperations: readonly NodeDiffOperation[];
  readonly edgeOperations: readonly EdgeDiffOperation[];
}
