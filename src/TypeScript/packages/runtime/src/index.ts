/**
 * Runtime package — reconciliation engine and graph state runtime.
 */

import type {
  GraphSnapshot,
  GraphDiff,
  NodeId,
  GraphNode,
  GraphEdge,
} from "@dataflow-visualizer/protocol";

export type { GraphSnapshot, GraphDiff };

/** Mutable runtime state for the graph. */
export interface GraphState {
  readonly version: number;
  readonly nodes: ReadonlyMap<NodeId, GraphNode>;
  readonly edges: ReadonlyMap<string, GraphEdge>;
}

/** Creates an initial empty graph state. */
export function createEmptyState(): GraphState {
  return {
    version: 0,
    nodes: new Map(),
    edges: new Map(),
  };
}

/** Applies a snapshot to produce a new state. */
export function applySnapshot(snapshot: GraphSnapshot): GraphState {
  return {
    version: snapshot.version,
    nodes: new Map(snapshot.nodes.map((n) => [n.id, n])),
    edges: new Map(snapshot.edges.map((e) => [e.id, e])),
  };
}

/** Applies a diff to an existing state. */
export function applyDiff(state: GraphState, diff: GraphDiff): GraphState {
  const nodes = new Map(state.nodes);
  const edges = new Map(state.edges);

  for (const op of diff.nodeOperations) {
    if (op.type === "remove") {
      nodes.delete(op.node.id);
    } else {
      nodes.set(op.node.id, op.node);
    }
  }

  for (const op of diff.edgeOperations) {
    if (op.type === "remove") {
      edges.delete(op.edge.id);
    } else {
      edges.set(op.edge.id, op.edge);
    }
  }

  return { version: diff.toVersion, nodes, edges };
}
