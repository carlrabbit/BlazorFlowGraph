/**
 * Protocol package — DTOs, graph contracts, and diff contracts.
 */

/** Unique identifier for a graph node or edge. */
export type NodeId = string;
export type EdgeId = string;

/** Unique identifier for a graph group. */
export type GroupId = string;

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

/** A logical grouping of nodes in the graph. */
export interface GraphGroup {
  readonly id: GroupId;
  readonly label: string;
  readonly kind: string;
  readonly childNodeIds: readonly NodeId[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** A complete graph snapshot. */
export interface GraphSnapshot {
  readonly version: number;
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
  readonly groups?: readonly GraphGroup[];
  readonly protocolVersion?: number;
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

/** A diff operation targeting a group. */
export interface GroupDiffOperation {
  readonly type: DiffOperationType;
  readonly group: GraphGroup;
}

/** An incremental diff between two graph versions. */
export interface GraphDiff {
  readonly fromVersion: number;
  readonly toVersion: number;
  readonly nodeOperations: readonly NodeDiffOperation[];
  readonly edgeOperations: readonly EdgeDiffOperation[];
  readonly groupOperations?: readonly GroupDiffOperation[];
}

/** A runtime overlay applied to a specific node, e.g. for highlighting or annotation. */
export interface NodeOverlay {
  readonly nodeId: NodeId;
  readonly kind: string;
  readonly data?: Readonly<Record<string, unknown>>;
}

/** A runtime overlay applied to a specific edge. */
export interface EdgeOverlay {
  readonly edgeId: EdgeId;
  readonly kind: string;
  readonly data?: Readonly<Record<string, unknown>>;
}
