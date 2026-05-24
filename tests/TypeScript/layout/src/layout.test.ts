/**
 * Layout package tests — Milestone 3:
 * LayoutProvider interface, LayoutGraph model, GridLayoutProvider.
 * Milestone 4: ElkLayoutProvider.
 */

import { describe, expect, it } from "bun:test";
import {
  ElkLayoutProvider,
  GridLayoutProvider,
  type LayoutGraph,
  type LayoutProvider,
  buildLayoutGraph,
  computeLayout,
} from "@dataflow-visualizer/layout";
import type { GraphSnapshot } from "@dataflow-visualizer/protocol";

// ---------------------------------------------------------------------------
// buildLayoutGraph
// ---------------------------------------------------------------------------

describe("buildLayoutGraph", () => {
  it("converts snapshot nodes to LayoutGraphNodes with default dimensions", () => {
    const snapshot: GraphSnapshot = {
      version: 1,
      nodes: [
        { id: "n1", label: "A", kind: "x" },
        { id: "n2", label: "B", kind: "x" },
      ],
      edges: [{ id: "e1", sourceId: "n1", targetId: "n2" }],
    };
    const graph = buildLayoutGraph(snapshot);
    expect(graph.nodes.length).toBe(2);
    expect(graph.nodes[0]?.id).toBe("n1");
    expect(graph.nodes[0]?.width).toBe(120);
    expect(graph.nodes[0]?.height).toBe(40);
  });

  it("applies custom nodeWidth and nodeHeight", () => {
    const snapshot: GraphSnapshot = {
      version: 1,
      nodes: [{ id: "n1", label: "A", kind: "x" }],
      edges: [],
    };
    const graph = buildLayoutGraph(snapshot, { nodeWidth: 200, nodeHeight: 60 });
    expect(graph.nodes[0]?.width).toBe(200);
    expect(graph.nodes[0]?.height).toBe(60);
  });

  it("converts snapshot edges to LayoutGraphEdges", () => {
    const snapshot: GraphSnapshot = {
      version: 1,
      nodes: [
        { id: "n1", label: "A", kind: "x" },
        { id: "n2", label: "B", kind: "x" },
      ],
      edges: [{ id: "e1", sourceId: "n1", targetId: "n2" }],
    };
    const graph = buildLayoutGraph(snapshot);
    expect(graph.edges.length).toBe(1);
    expect(graph.edges[0]?.id).toBe("e1");
    expect(graph.edges[0]?.sourceId).toBe("n1");
    expect(graph.edges[0]?.targetId).toBe("n2");
  });

  it("converts snapshot groups to LayoutGraphGroups", () => {
    const snapshot: GraphSnapshot = {
      version: 1,
      nodes: [{ id: "n1", label: "A", kind: "x" }],
      edges: [],
      groups: [{ id: "g1", label: "G", kind: "group", childNodeIds: ["n1"] }],
    };
    const graph = buildLayoutGraph(snapshot);
    expect(graph.groups.length).toBe(1);
    expect(graph.groups[0]?.id).toBe("g1");
    expect(graph.groups[0]?.childNodeIds).toContain("n1");
  });

  it("returns empty groups when snapshot has no groups", () => {
    const snapshot: GraphSnapshot = {
      version: 1,
      nodes: [{ id: "n1", label: "A", kind: "x" }],
      edges: [],
    };
    const graph = buildLayoutGraph(snapshot);
    expect(graph.groups.length).toBe(0);
  });

  it("returns empty nodes and edges for an empty snapshot", () => {
    const graph = buildLayoutGraph({ version: 0, nodes: [], edges: [] });
    expect(graph.nodes.length).toBe(0);
    expect(graph.edges.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// GridLayoutProvider
// ---------------------------------------------------------------------------

describe("GridLayoutProvider", () => {
  it("satisfies LayoutProvider interface", () => {
    const provider: LayoutProvider = new GridLayoutProvider();
    expect(typeof provider.computeLayout).toBe("function");
  });

  it("positions nodes in a grid", async () => {
    const graph: LayoutGraph = {
      nodes: [
        { id: "n1", width: 100, height: 40 },
        { id: "n2", width: 100, height: 40 },
        { id: "n3", width: 100, height: 40 },
        { id: "n4", width: 100, height: 40 },
      ],
      edges: [],
      groups: [],
    };
    const provider = new GridLayoutProvider();
    const result = await provider.computeLayout(graph);
    expect(result.nodes.size).toBe(4);
    // All nodes should have non-negative positions
    for (const node of result.nodes.values()) {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeGreaterThanOrEqual(0);
    }
  });

  it("returns edge sections connecting source and target", async () => {
    const graph: LayoutGraph = {
      nodes: [
        { id: "n1", width: 100, height: 40 },
        { id: "n2", width: 100, height: 40 },
      ],
      edges: [{ id: "e1", sourceId: "n1", targetId: "n2" }],
      groups: [],
    };
    const provider = new GridLayoutProvider();
    const result = await provider.computeLayout(graph);
    const edge = result.edges.get("e1");
    expect(edge).toBeDefined();
    expect(edge?.sections.length).toBeGreaterThan(0);
  });

  it("handles empty graph", async () => {
    const graph: LayoutGraph = { nodes: [], edges: [], groups: [] };
    const provider = new GridLayoutProvider();
    const result = await provider.computeLayout(graph);
    expect(result.nodes.size).toBe(0);
    expect(result.edges.size).toBe(0);
  });

  it("produces deterministic layout for the same input", async () => {
    const graph: LayoutGraph = {
      nodes: [
        { id: "n1", width: 120, height: 40 },
        { id: "n2", width: 120, height: 40 },
      ],
      edges: [],
      groups: [],
    };
    const provider = new GridLayoutProvider();
    const r1 = await provider.computeLayout(graph);
    const r2 = await provider.computeLayout(graph);
    const n1r1 = r1.nodes.get("n1");
    const n1r2 = r2.nodes.get("n1");
    expect(n1r1?.x).toBe(n1r2?.x);
    expect(n1r1?.y).toBe(n1r2?.y);
  });

  it("respects custom spacing option", async () => {
    const graph: LayoutGraph = {
      nodes: [
        { id: "n1", width: 100, height: 40 },
        { id: "n2", width: 100, height: 40 },
      ],
      edges: [],
      groups: [],
    };
    const provider = new GridLayoutProvider();
    const defaultResult = await provider.computeLayout(graph);
    const spacedResult = await provider.computeLayout(graph, { spacing: 100 });
    // With larger spacing, the total width should be larger
    expect(spacedResult.width).toBeGreaterThan(defaultResult.width);
  });
});

// ---------------------------------------------------------------------------
// computeLayout (backward-compatibility)
// ---------------------------------------------------------------------------

describe("computeLayout (backward-compat)", () => {
  it("still works without change", () => {
    const snapshot: GraphSnapshot = {
      version: 1,
      nodes: [{ id: "n1", label: "A", kind: "x" }],
      edges: [],
    };
    const result = computeLayout(snapshot);
    expect(result.nodes.has("n1")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// LayoutPolicy type expansion
// ---------------------------------------------------------------------------

describe("LayoutPolicy — expanded values", () => {
  it("Local is a valid LayoutPolicy", () => {
    const policy: import("@dataflow-visualizer/layout").LayoutPolicy = "Local";
    expect(policy).toBe("Local");
  });

  it("Frozen is a valid LayoutPolicy", () => {
    const policy: import("@dataflow-visualizer/layout").LayoutPolicy = "Frozen";
    expect(policy).toBe("Frozen");
  });
});

// ---------------------------------------------------------------------------
// ElkLayoutProvider (Milestone 4)
// ---------------------------------------------------------------------------

describe("ElkLayoutProvider", () => {
  it("satisfies LayoutProvider interface", () => {
    const provider: LayoutProvider = new ElkLayoutProvider();
    expect(typeof provider.computeLayout).toBe("function");
  });

  it("computes layout for a simple graph (falls back to grid when ELK fails in Node)", async () => {
    // ELK may fail in a Node test environment without a proper WASM worker.
    // The provider falls back to GridLayoutProvider in that case.
    const graph: LayoutGraph = {
      nodes: [
        { id: "n1", width: 120, height: 40 },
        { id: "n2", width: 120, height: 40 },
      ],
      edges: [{ id: "e1", sourceId: "n1", targetId: "n2" }],
      groups: [],
    };
    const provider = new ElkLayoutProvider({ algorithm: "layered" });
    const result = await provider.computeLayout(graph);
    expect(result.nodes.size).toBe(2);
    expect(result.edges.size).toBe(1);
    for (const node of result.nodes.values()) {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeGreaterThanOrEqual(0);
    }
  });

  it("accepts custom nodeWidth and nodeHeight options", async () => {
    const graph: LayoutGraph = {
      nodes: [{ id: "n1", width: 200, height: 60 }],
      edges: [],
      groups: [],
    };
    const provider = new ElkLayoutProvider();
    const result = await provider.computeLayout(graph, { nodeWidth: 200, nodeHeight: 60 });
    expect(result.nodes.size).toBe(1);
    const node = result.nodes.get("n1");
    expect(node).toBeDefined();
  });

  it("falls back to GridLayoutProvider when ELK throws", async () => {
    const graph: LayoutGraph = {
      nodes: [
        { id: "n1", width: 120, height: 40 },
        { id: "n2", width: 120, height: 40 },
      ],
      edges: [{ id: "e1", sourceId: "n1", targetId: "n2" }],
      groups: [],
    };

    const provider = new ElkLayoutProvider();
    (provider as unknown as { elkInstance: { layout: () => Promise<unknown> } }).elkInstance = {
      layout: async () => {
        throw new Error("simulated elk failure");
      },
    };

    const result = await provider.computeLayout(graph);
    expect(result.nodes.size).toBe(2);
    expect(result.edges.size).toBe(1);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it("handles empty graph without error", async () => {
    const graph: LayoutGraph = { nodes: [], edges: [], groups: [] };
    const provider = new ElkLayoutProvider();
    const result = await provider.computeLayout(graph);
    expect(result.nodes.size).toBe(0);
    expect(result.edges.size).toBe(0);
  });
});
