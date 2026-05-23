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
  readonly protocolVersion: number;
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

/** Options for snapshot validation. */
export interface SnapshotValidationOptions {
  /** Supported protocol versions in the current runtime (defaults to [1]). */
  readonly supportedProtocolVersions?: readonly number[];
}

/** Validates a GraphSnapshot against the public snapshot contract. */
export function validateGraphSnapshot(snapshot: GraphSnapshot, options?: SnapshotValidationOptions): readonly string[] {
  const errors: string[] = [];

  const supportedProtocolVersions = options?.supportedProtocolVersions ?? [1];
  const protocolVersion = snapshot.protocolVersion ?? 1;

  if (!Number.isInteger(snapshot.version) || snapshot.version < 0) {
    errors.push("snapshot.version must be an integer greater than or equal to zero");
  }

  if (!supportedProtocolVersions.includes(protocolVersion)) {
    errors.push(
      `snapshot.protocolVersion ${protocolVersion} is not supported; supported values: ${supportedProtocolVersions.join(", ")}`
    );
  }

  const nodeIds = new Set<string>();
  for (const node of snapshot.nodes) {
    if (nodeIds.has(node.id)) {
      errors.push(`duplicate node id: ${node.id}`);
      continue;
    }
    nodeIds.add(node.id);
  }

  const edgeIds = new Set<string>();
  for (const edge of snapshot.edges) {
    if (edgeIds.has(edge.id)) {
      errors.push(`duplicate edge id: ${edge.id}`);
    } else {
      edgeIds.add(edge.id);
    }
    if (!nodeIds.has(edge.sourceId)) {
      errors.push(`edge ${edge.id} has unknown sourceId: ${edge.sourceId}`);
    }
    if (!nodeIds.has(edge.targetId)) {
      errors.push(`edge ${edge.id} has unknown targetId: ${edge.targetId}`);
    }
  }

  const groupIds = new Set<string>();
  for (const group of snapshot.groups ?? []) {
    if (groupIds.has(group.id)) {
      errors.push(`duplicate group id: ${group.id}`);
      continue;
    }
    groupIds.add(group.id);

    for (const childNodeId of group.childNodeIds) {
      if (!nodeIds.has(childNodeId)) {
        errors.push(`group ${group.id} references unknown childNodeId: ${childNodeId}`);
      }
    }
  }

  return errors;
}
