/**
 * Query package — topology traversal engine for the dataflow visualizer.
 */

import type { GraphEdge, GroupId, NodeId } from "@dataflow-visualizer/protocol";
import type { GraphDataState, GraphState } from "@dataflow-visualizer/runtime";

export type { NodeId, GroupId, GraphEdge };

// ---------------------------------------------------------------------------
// Topology index
// ---------------------------------------------------------------------------

/** Pre-built index of graph connectivity for efficient traversal. */
export interface TopologyIndex {
  readonly incomingEdgesByNodeId: ReadonlyMap<NodeId, readonly GraphEdge[]>;
  readonly outgoingEdgesByNodeId: ReadonlyMap<NodeId, readonly GraphEdge[]>;
  readonly groupChildrenById: ReadonlyMap<GroupId, readonly NodeId[]>;
  readonly nodeGroupMembership: ReadonlyMap<NodeId, GroupId>;
}

/** Builds a topology index from a GraphDataState or GraphState. */
export function buildTopologyIndex(data: GraphDataState | GraphState): TopologyIndex {
  const incoming = new Map<NodeId, GraphEdge[]>();
  const outgoing = new Map<NodeId, GraphEdge[]>();
  const groupChildren = new Map<GroupId, NodeId[]>();
  const nodeGroupMembership = new Map<NodeId, GroupId>();

  for (const edge of data.edges.values()) {
    let out = outgoing.get(edge.sourceId);
    if (out == null) {
      out = [];
      outgoing.set(edge.sourceId, out);
    }
    out.push(edge);

    let inc = incoming.get(edge.targetId);
    if (inc == null) {
      inc = [];
      incoming.set(edge.targetId, inc);
    }
    inc.push(edge);
  }

  for (const group of data.groups.values()) {
    groupChildren.set(group.id, [...group.childNodeIds]);
    for (const nodeId of group.childNodeIds) {
      nodeGroupMembership.set(nodeId, group.id);
    }
  }

  return {
    incomingEdgesByNodeId: incoming,
    outgoingEdgesByNodeId: outgoing,
    groupChildrenById: groupChildren,
    nodeGroupMembership,
  };
}

// ---------------------------------------------------------------------------
// Traversal options
// ---------------------------------------------------------------------------

/** Options controlling graph traversal depth and filtering. */
export interface TraversalOptions {
  readonly maxDepth?: number;
  readonly includeGroupMembers?: boolean;
  readonly nodeFilter?: (nodeId: NodeId) => boolean;
  readonly edgeFilter?: (edge: GraphEdge) => boolean;
}

export type PathHighlightMode = "none" | "upstream" | "downstream" | "between";

export interface PathHighlightState {
  readonly mode: PathHighlightMode;
  readonly sourceNodeId?: NodeId;
  readonly targetNodeId?: NodeId;
}

export interface PathHighlightVisualState {
  readonly mode: PathHighlightMode;
  readonly highlightedNodeIds: ReadonlySet<NodeId>;
  readonly highlightedEdgeIds: ReadonlySet<string>;
  readonly dimmedNodeIds: ReadonlySet<NodeId>;
  readonly upstreamHighlightedNodeIds: ReadonlySet<NodeId>;
  readonly downstreamHighlightedNodeIds: ReadonlySet<NodeId>;
}

// ---------------------------------------------------------------------------
// Traversal functions
// ---------------------------------------------------------------------------

/**
 * Returns all nodes reachable upstream (via incoming edges) from the given node.
 * The seed node itself is not included.
 */
export function findUpstream(
  nodeId: NodeId,
  index: TopologyIndex,
  options?: TraversalOptions,
): ReadonlySet<NodeId> {
  return bfs(nodeId, index, "upstream", options);
}

/**
 * Returns all nodes reachable downstream (via outgoing edges) from the given node.
 * The seed node itself is not included.
 */
export function findDownstream(
  nodeId: NodeId,
  index: TopologyIndex,
  options?: TraversalOptions,
): ReadonlySet<NodeId> {
  return bfs(nodeId, index, "downstream", options);
}

/**
 * Returns all nodes reachable in either direction from the given node.
 * The seed node itself is not included.
 */
export function findConnected(
  nodeId: NodeId,
  index: TopologyIndex,
  options?: TraversalOptions,
): ReadonlySet<NodeId> {
  return bfs(nodeId, index, "both", options);
}

/** Returns the set of direct neighbors (one hop in either direction). */
export function findNeighbors(nodeId: NodeId, index: TopologyIndex): ReadonlySet<NodeId> {
  const result = new Set<NodeId>();
  for (const edge of index.outgoingEdgesByNodeId.get(nodeId) ?? []) {
    result.add(edge.targetId);
  }
  for (const edge of index.incomingEdgesByNodeId.get(nodeId) ?? []) {
    result.add(edge.sourceId);
  }
  return result;
}

/** Returns all node IDs that are members of the given group. */
export function findGroupMembers(groupId: GroupId, index: TopologyIndex): ReadonlySet<NodeId> {
  return new Set(index.groupChildrenById.get(groupId) ?? []);
}

/**
 * Returns all edges that cross the boundary of the group — i.e. edges where
 * exactly one endpoint belongs to the group.
 */
export function findGroupBoundaryEdges(
  groupId: GroupId,
  index: TopologyIndex,
  state: GraphDataState | GraphState,
): readonly GraphEdge[] {
  const memberIds = new Set(index.groupChildrenById.get(groupId) ?? []);
  const result: GraphEdge[] = [];
  for (const edge of state.edges.values()) {
    const srcInGroup = memberIds.has(edge.sourceId);
    const tgtInGroup = memberIds.has(edge.targetId);
    if (srcInGroup !== tgtInGroup) {
      result.push(edge);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Subgraph extraction
// ---------------------------------------------------------------------------

/** Options for subgraph extraction. */
export interface SubgraphOptions extends TraversalOptions {
  readonly includeUpstream?: boolean;
  readonly includeDownstream?: boolean;
}

/** A set of node and edge IDs forming a subgraph. */
export interface Subgraph {
  readonly nodeIds: ReadonlySet<NodeId>;
  readonly edgeIds: ReadonlySet<string>;
}

/**
 * Extracts a subgraph reachable from the given seed nodes.
 * By default includes both upstream and downstream nodes.
 */
export function extractSubgraph(
  seedNodeIds: readonly NodeId[],
  index: TopologyIndex,
  state: GraphDataState | GraphState,
  options?: SubgraphOptions,
): Subgraph {
  const includeUpstream = options?.includeUpstream ?? true;
  const includeDownstream = options?.includeDownstream ?? true;

  const nodeIds = new Set<NodeId>(seedNodeIds);

  for (const seed of seedNodeIds) {
    if (includeUpstream) {
      for (const id of findUpstream(seed, index, options)) {
        nodeIds.add(id);
      }
    }
    if (includeDownstream) {
      for (const id of findDownstream(seed, index, options)) {
        nodeIds.add(id);
      }
    }
  }

  const edgeIds = new Set<string>();
  for (const edge of state.edges.values()) {
    if (nodeIds.has(edge.sourceId) && nodeIds.has(edge.targetId)) {
      edgeIds.add(edge.id);
    }
  }

  return { nodeIds, edgeIds };
}

/** Finds a deterministic shortest directed path between two nodes using BFS. */
export function findPathBetween(
  sourceNodeId: NodeId,
  targetNodeId: NodeId,
  index: TopologyIndex,
): readonly NodeId[] {
  if (sourceNodeId === targetNodeId) {
    return [sourceNodeId];
  }

  const visited = new Set<NodeId>([sourceNodeId]);
  const queue: NodeId[] = [sourceNodeId];
  let cursor = 0;
  const previous = new Map<NodeId, NodeId>();

  while (cursor < queue.length) {
    const current = queue[cursor];
    cursor += 1;
    if (current == null) break;
    const outgoing = [...(index.outgoingEdgesByNodeId.get(current) ?? [])].sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    for (const edge of outgoing) {
      const next = edge.targetId;
      if (visited.has(next)) continue;
      visited.add(next);
      previous.set(next, current);
      if (next === targetNodeId) {
        return reconstructPath(sourceNodeId, targetNodeId, previous);
      }
      queue.push(next);
    }
  }

  return [];
}

/**
 * Resolves path highlighting state into concrete node/edge sets for rendering.
 */
export function resolvePathHighlightVisualState(
  highlight: PathHighlightState | undefined,
  index: TopologyIndex,
  options?: {
    readonly allNodeIds?: Iterable<NodeId>;
    readonly dimUnrelated?: boolean;
  },
): PathHighlightVisualState {
  const mode = highlight?.mode ?? "none";
  const sourceNodeId = highlight?.sourceNodeId;
  const targetNodeId = highlight?.targetNodeId;
  const highlightedNodeIds = new Set<NodeId>();
  const highlightedEdgeIds = new Set<string>();
  const upstreamHighlightedNodeIds = new Set<NodeId>();
  const downstreamHighlightedNodeIds = new Set<NodeId>();

  if (mode === "upstream" && sourceNodeId != null) {
    highlightedNodeIds.add(sourceNodeId);
    upstreamHighlightedNodeIds.add(sourceNodeId);
    for (const nodeId of findUpstream(sourceNodeId, index)) {
      highlightedNodeIds.add(nodeId);
      upstreamHighlightedNodeIds.add(nodeId);
    }
    for (const nodeId of highlightedNodeIds) {
      for (const edge of index.incomingEdgesByNodeId.get(nodeId) ?? []) {
        if (highlightedNodeIds.has(edge.sourceId)) {
          highlightedEdgeIds.add(edge.id);
        }
      }
    }
  } else if (mode === "downstream" && sourceNodeId != null) {
    highlightedNodeIds.add(sourceNodeId);
    downstreamHighlightedNodeIds.add(sourceNodeId);
    for (const nodeId of findDownstream(sourceNodeId, index)) {
      highlightedNodeIds.add(nodeId);
      downstreamHighlightedNodeIds.add(nodeId);
    }
    for (const nodeId of highlightedNodeIds) {
      for (const edge of index.outgoingEdgesByNodeId.get(nodeId) ?? []) {
        if (highlightedNodeIds.has(edge.targetId)) {
          highlightedEdgeIds.add(edge.id);
        }
      }
    }
  } else if (mode === "between" && sourceNodeId != null && targetNodeId != null) {
    const path = findPathBetween(sourceNodeId, targetNodeId, index);
    for (const nodeId of path) {
      highlightedNodeIds.add(nodeId);
    }
    for (let i = 0; i < path.length - 1; i += 1) {
      const source = path[i];
      const target = path[i + 1];
      if (source == null || target == null) continue;
      const edge = [...(index.outgoingEdgesByNodeId.get(source) ?? [])]
        .sort((a, b) => a.id.localeCompare(b.id))
        .find((candidate) => candidate.targetId === target);
      if (edge != null) {
        highlightedEdgeIds.add(edge.id);
      }
    }
  }

  const dimmedNodeIds = new Set<NodeId>();
  if (options?.dimUnrelated === true && options.allNodeIds != null && highlightedNodeIds.size > 0) {
    for (const nodeId of options.allNodeIds) {
      if (!highlightedNodeIds.has(nodeId)) {
        dimmedNodeIds.add(nodeId);
      }
    }
  }

  return {
    mode,
    highlightedNodeIds,
    highlightedEdgeIds,
    dimmedNodeIds,
    upstreamHighlightedNodeIds,
    downstreamHighlightedNodeIds,
  };
}

// ---------------------------------------------------------------------------
// BFS implementation
// ---------------------------------------------------------------------------

type TraversalDirection = "upstream" | "downstream" | "both";

function bfs(
  startId: NodeId,
  index: TopologyIndex,
  direction: TraversalDirection,
  options?: TraversalOptions,
): ReadonlySet<NodeId> {
  const maxDepth = options?.maxDepth ?? Number.POSITIVE_INFINITY;
  const nodeFilter = options?.nodeFilter;
  const edgeFilter = options?.edgeFilter;

  const visited = new Set<NodeId>();
  const queue: Array<{ id: NodeId; depth: number }> = [{ id: startId, depth: 0 }];

  while (queue.length > 0) {
    const item = queue.shift();
    if (item == null) break;
    const { id, depth } = item;

    if (depth >= maxDepth) continue;

    const nextEdges: GraphEdge[] = [];
    if (direction === "downstream" || direction === "both") {
      nextEdges.push(...(index.outgoingEdgesByNodeId.get(id) ?? []));
    }
    if (direction === "upstream" || direction === "both") {
      nextEdges.push(...(index.incomingEdgesByNodeId.get(id) ?? []));
    }

    for (const edge of nextEdges) {
      if (edgeFilter != null && !edgeFilter(edge)) continue;

      let neighborId: NodeId;
      if (direction === "upstream") {
        neighborId = edge.sourceId;
      } else if (direction === "downstream") {
        neighborId = edge.targetId;
      } else {
        neighborId = edge.sourceId === id ? edge.targetId : edge.sourceId;
      }

      if (neighborId === startId || visited.has(neighborId)) continue;
      if (nodeFilter != null && !nodeFilter(neighborId)) continue;

      visited.add(neighborId);
      queue.push({ id: neighborId, depth: depth + 1 });
    }
  }

  return visited;
}

function reconstructPath(
  sourceNodeId: NodeId,
  targetNodeId: NodeId,
  previous: ReadonlyMap<NodeId, NodeId>,
): readonly NodeId[] {
  const path: NodeId[] = [targetNodeId];
  let cursor = targetNodeId;
  while (cursor !== sourceNodeId) {
    const prior = previous.get(cursor);
    if (prior == null) {
      return [];
    }
    path.push(prior);
    cursor = prior;
  }
  path.reverse();
  return path;
}
