import { describe, expect, it } from "bun:test";
import type { GraphSnapshot } from "@dataflow-visualizer/protocol";
import {
  buildTopologyIndex,
  extractSubgraph,
  findConnected,
  findDownstream,
  findGroupBoundaryEdges,
  findGroupMembers,
  findNeighbors,
  findPathBetween,
  findUpstream,
  resolvePathHighlightVisualState,
} from "@dataflow-visualizer/query";
import { applySnapshot } from "@dataflow-visualizer/runtime";

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

/**
 * Builds a simple linear graph:  n1 -> n2 -> n3
 * With an additional branch:      n2 -> n4
 */
function makeLinearSnapshot(): GraphSnapshot {
  return {
    version: 1,
    nodes: [
      { id: "n1", label: "N1", kind: "default" },
      { id: "n2", label: "N2", kind: "default" },
      { id: "n3", label: "N3", kind: "default" },
      { id: "n4", label: "N4", kind: "default" },
    ],
    edges: [
      { id: "e1", sourceId: "n1", targetId: "n2" },
      { id: "e2", sourceId: "n2", targetId: "n3" },
      { id: "e3", sourceId: "n2", targetId: "n4" },
    ],
    groups: [{ id: "g1", label: "Group 1", kind: "module", childNodeIds: ["n1", "n2"] }],
  };
}

function makeState(snapshot: GraphSnapshot = makeLinearSnapshot()) {
  return applySnapshot(snapshot);
}

// ---------------------------------------------------------------------------
// buildTopologyIndex
// ---------------------------------------------------------------------------

describe("buildTopologyIndex", () => {
  it("builds correct incoming edges", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const incoming = index.incomingEdgesByNodeId.get("n2");
    expect(incoming).toBeDefined();
    expect(incoming?.length).toBe(1);
    expect(incoming?.[0]?.id).toBe("e1");
  });

  it("builds correct outgoing edges", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const outgoing = index.outgoingEdgesByNodeId.get("n2");
    expect(outgoing).toBeDefined();
    expect(outgoing?.length).toBe(2);
    const ids = outgoing?.map((e) => e.id).sort();
    expect(ids).toEqual(["e2", "e3"]);
  });

  it("builds group children index", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const children = index.groupChildrenById.get("g1");
    expect(children).toEqual(["n1", "n2"]);
  });

  it("builds node group membership", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    expect(index.nodeGroupMembership.get("n1")).toBe("g1");
    expect(index.nodeGroupMembership.get("n2")).toBe("g1");
    expect(index.nodeGroupMembership.has("n3")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// findUpstream
// ---------------------------------------------------------------------------

describe("findUpstream", () => {
  it("traverses upstream correctly", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const upstream = findUpstream("n3", index);
    expect(upstream.has("n2")).toBe(true);
    expect(upstream.has("n1")).toBe(true);
    expect(upstream.has("n3")).toBe(false);
  });

  it("respects maxDepth = 1", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const upstream = findUpstream("n3", index, { maxDepth: 1 });
    expect(upstream.has("n2")).toBe(true);
    expect(upstream.has("n1")).toBe(false);
  });

  it("returns empty set for root node", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const upstream = findUpstream("n1", index);
    expect(upstream.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// findDownstream
// ---------------------------------------------------------------------------

describe("findDownstream", () => {
  it("traverses downstream correctly", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const downstream = findDownstream("n1", index);
    expect(downstream.has("n2")).toBe(true);
    expect(downstream.has("n3")).toBe(true);
    expect(downstream.has("n4")).toBe(true);
    expect(downstream.has("n1")).toBe(false);
  });

  it("respects maxDepth = 1", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const downstream = findDownstream("n1", index, { maxDepth: 1 });
    expect(downstream.has("n2")).toBe(true);
    expect(downstream.has("n3")).toBe(false);
    expect(downstream.has("n4")).toBe(false);
  });

  it("returns empty set for leaf node", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const downstream = findDownstream("n3", index);
    expect(downstream.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// findConnected
// ---------------------------------------------------------------------------

describe("findConnected", () => {
  it("finds all connected nodes bidirectionally", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const connected = findConnected("n2", index);
    expect(connected.has("n1")).toBe(true);
    expect(connected.has("n3")).toBe(true);
    expect(connected.has("n4")).toBe(true);
    expect(connected.has("n2")).toBe(false);
  });

  it("respects maxDepth", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const connected = findConnected("n2", index, { maxDepth: 1 });
    expect(connected.has("n1")).toBe(true);
    expect(connected.has("n3")).toBe(true);
    expect(connected.has("n4")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// findNeighbors
// ---------------------------------------------------------------------------

describe("findNeighbors", () => {
  it("returns only direct neighbors", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const neighbors = findNeighbors("n2", index);
    expect(neighbors.has("n1")).toBe(true);
    expect(neighbors.has("n3")).toBe(true);
    expect(neighbors.has("n4")).toBe(true);
    expect(neighbors.has("n2")).toBe(false);
  });

  it("returns empty set for isolated node", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [{ id: "isolated", label: "Isolated", kind: "default" }],
      edges: [],
    });
    const index = buildTopologyIndex(state);
    expect(findNeighbors("isolated", index).size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// findGroupMembers
// ---------------------------------------------------------------------------

describe("findGroupMembers", () => {
  it("returns group members", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const members = findGroupMembers("g1", index);
    expect(members.has("n1")).toBe(true);
    expect(members.has("n2")).toBe(true);
    expect(members.has("n3")).toBe(false);
  });

  it("returns empty set for unknown group", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    expect(findGroupMembers("unknown", index).size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// findGroupBoundaryEdges
// ---------------------------------------------------------------------------

describe("findGroupBoundaryEdges", () => {
  it("returns edges that cross the group boundary", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    // g1 contains n1 and n2; boundary edges are those with one endpoint inside
    // e1: n1->n2 both inside — not boundary
    // e2: n2->n3 n2 inside, n3 outside — boundary
    // e3: n2->n4 n2 inside, n4 outside — boundary
    const boundary = findGroupBoundaryEdges("g1", index, state);
    const ids = boundary.map((e) => e.id).sort();
    expect(ids).toEqual(["e2", "e3"]);
  });

  it("returns empty array for group with no boundary edges", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [
        { id: "a", label: "A", kind: "default" },
        { id: "b", label: "B", kind: "default" },
      ],
      edges: [{ id: "ab", sourceId: "a", targetId: "b" }],
      groups: [{ id: "g", label: "G", kind: "module", childNodeIds: ["a", "b"] }],
    });
    const index = buildTopologyIndex(state);
    const boundary = findGroupBoundaryEdges("g", index, state);
    expect(boundary.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// extractSubgraph
// ---------------------------------------------------------------------------

describe("extractSubgraph", () => {
  it("returns correct node and edge IDs for a seed node", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const subgraph = extractSubgraph(["n2"], index, state);
    expect(subgraph.nodeIds.has("n1")).toBe(true);
    expect(subgraph.nodeIds.has("n2")).toBe(true);
    expect(subgraph.nodeIds.has("n3")).toBe(true);
    expect(subgraph.nodeIds.has("n4")).toBe(true);
    expect(subgraph.edgeIds.has("e1")).toBe(true);
    expect(subgraph.edgeIds.has("e2")).toBe(true);
    expect(subgraph.edgeIds.has("e3")).toBe(true);
  });

  it("limits to downstream when includeUpstream = false", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const subgraph = extractSubgraph(["n2"], index, state, { includeUpstream: false });
    expect(subgraph.nodeIds.has("n1")).toBe(false);
    expect(subgraph.nodeIds.has("n2")).toBe(true);
    expect(subgraph.nodeIds.has("n3")).toBe(true);
    expect(subgraph.nodeIds.has("n4")).toBe(true);
  });

  it("limits to upstream when includeDownstream = false", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const subgraph = extractSubgraph(["n2"], index, state, { includeDownstream: false });
    expect(subgraph.nodeIds.has("n1")).toBe(true);
    expect(subgraph.nodeIds.has("n2")).toBe(true);
    expect(subgraph.nodeIds.has("n3")).toBe(false);
    expect(subgraph.nodeIds.has("n4")).toBe(false);
  });

  it("only includes edges where both endpoints are in the subgraph", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const subgraph = extractSubgraph(["n1"], index, state, {
      includeUpstream: false,
      includeDownstream: false,
    });
    expect(subgraph.nodeIds.size).toBe(1);
    expect(subgraph.edgeIds.size).toBe(0);
  });
});

describe("findPathBetween", () => {
  it("returns deterministic path between two connected nodes", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [
        { id: "a", label: "A", kind: "default" },
        { id: "b", label: "B", kind: "default" },
        { id: "c", label: "C", kind: "default" },
        { id: "d", label: "D", kind: "default" },
      ],
      edges: [
        { id: "e1", sourceId: "a", targetId: "b" },
        { id: "e2", sourceId: "a", targetId: "c" },
        { id: "e3", sourceId: "b", targetId: "d" },
        { id: "e4", sourceId: "c", targetId: "d" },
      ],
    });
    const index = buildTopologyIndex(state);
    expect(findPathBetween("a", "d", index)).toEqual(["a", "b", "d"]);
  });

  it("returns empty path for disconnected nodes", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [
        { id: "a", label: "A", kind: "default" },
        { id: "b", label: "B", kind: "default" },
      ],
      edges: [],
    });
    const index = buildTopologyIndex(state);
    expect(findPathBetween("a", "b", index)).toEqual([]);
  });
});

describe("resolvePathHighlightVisualState", () => {
  it("resolves upstream highlights and dims unrelated nodes", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const visual = resolvePathHighlightVisualState(
      { mode: "upstream", sourceNodeId: "n3" },
      index,
      {
        allNodeIds: state.nodes.keys(),
        dimUnrelated: true,
      },
    );

    expect(visual.upstreamHighlightedNodeIds.has("n3")).toBe(true);
    expect(visual.upstreamHighlightedNodeIds.has("n2")).toBe(true);
    expect(visual.upstreamHighlightedNodeIds.has("n1")).toBe(true);
    expect(visual.dimmedNodeIds.has("n4")).toBe(true);
  });

  it("resolves between highlights with edges", () => {
    const state = makeState();
    const index = buildTopologyIndex(state);
    const visual = resolvePathHighlightVisualState(
      { mode: "between", sourceNodeId: "n1", targetNodeId: "n3" },
      index,
    );
    expect(visual.highlightedNodeIds.has("n1")).toBe(true);
    expect(visual.highlightedNodeIds.has("n2")).toBe(true);
    expect(visual.highlightedNodeIds.has("n3")).toBe(true);
    expect(visual.highlightedEdgeIds.has("e1")).toBe(true);
    expect(visual.highlightedEdgeIds.has("e2")).toBe(true);
  });
});
