/**
 * Milestone 3 — tests for new runtime abstractions:
 * SemanticCommand, ViewportContext, VisibleGraph, OverlayRegistry,
 * SpatialIndex, RuntimeDiagnostics, GraphRuntimeHost.
 */

import { describe, expect, it, vi } from "vitest";
import {
  // SemanticCommand types
  type FocusNodeCommand,
  type CollapseGroupCommand,
  type ExpandGroupCommand,
  type FitSelectionCommand,
  type FitGraphCommand,
  type ApplySearchCommand,
  type NavigateBackCommand,
  type NavigateForwardCommand,
  type FocusGroupCommand,
  type RevealElementCommand,
  type SemanticCommand,
  // ViewportContext
  createViewportContext,
  type ViewportContext,
  // VisibleGraph
  buildVisibleGraph,
  type VisibleGraph,
  // OverlayRegistry
  OverlayRegistry,
  // SpatialIndex
  buildSpatialIndex,
  buildSpatialIndexWithOptions,
  type BoundingBox,
  type SpatialEntry,
  // RuntimeDiagnostics
  RuntimeDiagnostics,
  // GraphRuntimeHost
  GraphRuntimeHost,
  MultiViewCoordinator,
  buildMinimapViewportRect,
  type OverlayProvider,
  // Store
  GraphRuntimeStore,
} from "@dataflow-visualizer/runtime";
import { applySnapshot } from "@dataflow-visualizer/runtime";
import type { GraphDataState } from "@dataflow-visualizer/runtime";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeData(
  nodes: Array<{ id: string; label: string; kind: string }>,
  edges: Array<{ id: string; sourceId: string; targetId: string }> = [],
  groups: Array<{ id: string; label: string; kind: string; childNodeIds: string[] }> = []
): GraphDataState {
  return {
    version: 1,
    nodes: new Map(nodes.map((n) => [n.id, n])),
    edges: new Map(edges.map((e) => [e.id, e])),
    groups: new Map(groups.map((g) => [g.id, g])),
  };
}

// ---------------------------------------------------------------------------
// SemanticCommand — type narrowing
// ---------------------------------------------------------------------------

describe("SemanticCommand — discriminated union", () => {
  it("FocusNode command has correct type literal", () => {
    const cmd: FocusNodeCommand = { type: "FocusNode", nodeId: "n1" };
    expect(cmd.type).toBe("FocusNode");
    expect(cmd.nodeId).toBe("n1");
  });

  it("CollapseGroup command has correct type literal", () => {
    const cmd: CollapseGroupCommand = { type: "CollapseGroup", groupId: "g1" };
    expect(cmd.type).toBe("CollapseGroup");
    expect(cmd.groupId).toBe("g1");
  });

  it("ExpandGroup command has correct type literal", () => {
    const cmd: ExpandGroupCommand = { type: "ExpandGroup", groupId: "g1" };
    expect(cmd.type).toBe("ExpandGroup");
    expect(cmd.groupId).toBe("g1");
  });

  it("FitSelection command has correct type literal", () => {
    const cmd: FitSelectionCommand = { type: "FitSelection" };
    expect(cmd.type).toBe("FitSelection");
  });

  it("FitGraph command has correct type literal", () => {
    const cmd: FitGraphCommand = { type: "FitGraph" };
    expect(cmd.type).toBe("FitGraph");
  });

  it("ApplySearch command carries query string", () => {
    const cmd: ApplySearchCommand = { type: "ApplySearch", query: "hello" };
    expect(cmd.type).toBe("ApplySearch");
    expect(cmd.query).toBe("hello");
  });

  it("NavigateBack command has correct type literal", () => {
    const cmd: NavigateBackCommand = { type: "NavigateBack" };
    expect(cmd.type).toBe("NavigateBack");
  });

  it("NavigateForward command has correct type literal", () => {
    const cmd: NavigateForwardCommand = { type: "NavigateForward" };
    expect(cmd.type).toBe("NavigateForward");
  });

  it("FocusGroup command has correct type literal", () => {
    const cmd: FocusGroupCommand = { type: "FocusGroup", groupId: "g1" };
    expect(cmd.type).toBe("FocusGroup");
    expect(cmd.groupId).toBe("g1");
  });

  it("RevealElement command supports semantic targets", () => {
    const cmd: RevealElementCommand = { type: "RevealElement", elementId: "n1", elementKind: "node" };
    expect(cmd.type).toBe("RevealElement");
    expect(cmd.elementId).toBe("n1");
    expect(cmd.elementKind).toBe("node");
  });

  it("SemanticCommand union narrowing works in switch", () => {
    const dispatch = (cmd: SemanticCommand): string => {
      switch (cmd.type) {
        case "FocusNode": return `focus:${cmd.nodeId}`;
        case "CollapseGroup": return `collapse:${cmd.groupId}`;
        case "ExpandGroup": return `expand:${cmd.groupId}`;
        case "FocusGroup": return `focus-group:${cmd.groupId}`;
        case "FitSelection": return "fit";
        case "FitGraph": return "fit-graph";
        case "RevealElement": return `reveal:${cmd.elementId}`;
        case "ApplySearch": return `search:${cmd.query}`;
        case "NavigateBack": return "back";
        case "NavigateForward": return "forward";
      }
    };
    expect(dispatch({ type: "FocusNode", nodeId: "n1" })).toBe("focus:n1");
    expect(dispatch({ type: "NavigateBack" })).toBe("back");
    expect(dispatch({ type: "NavigateForward" })).toBe("forward");
    expect(dispatch({ type: "FitSelection" })).toBe("fit");
  });
});

// ---------------------------------------------------------------------------
// ViewportContext
// ---------------------------------------------------------------------------

describe("createViewportContext", () => {
  it("preserves pan and scale values", () => {
    const ctx: ViewportContext = createViewportContext(10, 20, 2, 800, 600);
    expect(ctx.panX).toBe(10);
    expect(ctx.panY).toBe(20);
    expect(ctx.scale).toBe(2);
  });

  it("computes visibleBounds correctly", () => {
    const ctx = createViewportContext(0, 0, 2, 800, 600);
    expect(ctx.visibleBounds.x).toBeCloseTo(0);
    expect(ctx.visibleBounds.y).toBeCloseTo(0);
    expect(ctx.visibleBounds.width).toBe(400);
    expect(ctx.visibleBounds.height).toBe(300);
  });

  it("computes visibleBounds with pan offset", () => {
    const ctx = createViewportContext(-100, -50, 1, 800, 600);
    expect(ctx.visibleBounds.x).toBe(100);
    expect(ctx.visibleBounds.y).toBe(50);
    expect(ctx.visibleBounds.width).toBe(800);
    expect(ctx.visibleBounds.height).toBe(600);
  });

  it("clamps non-positive scale to 1", () => {
    const ctx = createViewportContext(0, 0, 0, 800, 600);
    expect(ctx.scale).toBe(1);
  });

  it("stores screen dimensions", () => {
    const ctx = createViewportContext(0, 0, 1, 1024, 768);
    expect(ctx.screenWidth).toBe(1024);
    expect(ctx.screenHeight).toBe(768);
  });
});

// ---------------------------------------------------------------------------
// VisibleGraph
// ---------------------------------------------------------------------------

describe("buildVisibleGraph — no policy (all visible)", () => {
  it("includes all nodes when no policy given", () => {
    const data = makeData(
      [{ id: "n1", label: "A", kind: "x" }, { id: "n2", label: "B", kind: "x" }],
      [{ id: "e1", sourceId: "n1", targetId: "n2" }]
    );
    const vg: VisibleGraph = buildVisibleGraph(data);
    expect(vg.visibleNodeIds.has("n1")).toBe(true);
    expect(vg.visibleNodeIds.has("n2")).toBe(true);
    expect(vg.visibleEdgeIds.has("e1")).toBe(true);
  });

  it("includes no groups when no groups exist", () => {
    const data = makeData([{ id: "n1", label: "A", kind: "x" }]);
    const vg = buildVisibleGraph(data);
    expect(vg.visibleGroupIds.size).toBe(0);
  });
});

describe("buildVisibleGraph — search filter", () => {
  it("hides nodes not in searchMatchedIds", () => {
    const data = makeData([
      { id: "n1", label: "A", kind: "x" },
      { id: "n2", label: "B", kind: "x" },
    ], [{ id: "e1", sourceId: "n1", targetId: "n2" }]);
    const vg = buildVisibleGraph(data, { searchMatchedIds: new Set(["n1"]) });
    expect(vg.visibleNodeIds.has("n1")).toBe(true);
    expect(vg.visibleNodeIds.has("n2")).toBe(false);
    // Edge e1 has n2 hidden, so it should be hidden too
    expect(vg.visibleEdgeIds.has("e1")).toBe(false);
  });

  it("shows all nodes when searchMatchedIds is empty set", () => {
    const data = makeData([
      { id: "n1", label: "A", kind: "x" },
      { id: "n2", label: "B", kind: "x" },
    ]);
    const vg = buildVisibleGraph(data, { searchMatchedIds: new Set() });
    expect(vg.visibleNodeIds.size).toBe(2);
  });

  it("highlight mode preserves full topology visibility", () => {
    const data = makeData(
      [
        { id: "n1", label: "A", kind: "x" },
        { id: "n2", label: "B", kind: "x" },
      ],
      [{ id: "e1", sourceId: "n1", targetId: "n2" }]
    );
    const vg = buildVisibleGraph(data, {
      searchMatchedIds: new Set(["n1"]),
      searchVisibilityBehavior: "highlight",
    });
    expect(vg.visibleNodeIds.has("n1")).toBe(true);
    expect(vg.visibleNodeIds.has("n2")).toBe(true);
    expect(vg.visibleEdgeIds.has("e1")).toBe(true);
  });

  it("isolate mode includes matched nodes and their immediate neighbors", () => {
    const data = makeData(
      [
        { id: "n1", label: "A", kind: "x" },
        { id: "n2", label: "B", kind: "x" },
        { id: "n3", label: "C", kind: "x" },
      ],
      [
        { id: "e1", sourceId: "n1", targetId: "n2" },
        { id: "e2", sourceId: "n2", targetId: "n3" },
      ]
    );
    const vg = buildVisibleGraph(data, {
      searchMatchedIds: new Set(["n2"]),
      searchVisibilityBehavior: "isolate",
    });
    expect(vg.visibleNodeIds.has("n1")).toBe(true);
    expect(vg.visibleNodeIds.has("n2")).toBe(true);
    expect(vg.visibleNodeIds.has("n3")).toBe(true);
  });
});

describe("buildVisibleGraph — collapsed groups", () => {
  it("hides child nodes of collapsed groups", () => {
    const data = makeData(
      [
        { id: "n1", label: "A", kind: "x" },
        { id: "n2", label: "B", kind: "x" },
      ],
      [],
      [{ id: "g1", label: "G", kind: "group", childNodeIds: ["n2"] }]
    );
    const vg = buildVisibleGraph(data, { collapsedGroupIds: new Set(["g1"]) });
    expect(vg.visibleNodeIds.has("n1")).toBe(true);
    expect(vg.visibleNodeIds.has("n2")).toBe(false);
  });

  it("hides group itself when collapsed", () => {
    const data = makeData(
      [{ id: "n1", label: "A", kind: "x" }],
      [],
      [{ id: "g1", label: "G", kind: "group", childNodeIds: ["n1"] }]
    );
    const vg = buildVisibleGraph(data, { collapsedGroupIds: new Set(["g1"]) });
    expect(vg.visibleGroupIds.has("g1")).toBe(false);
  });

  it("reports reason-coded diagnostics for hidden nodes", () => {
    const data = makeData(
      [
        { id: "n1", label: "A", kind: "x" },
        { id: "n2", label: "B", kind: "x" },
      ],
      [],
      [{ id: "g1", label: "G", kind: "group", childNodeIds: ["n2"] }]
    );
    const vg = buildVisibleGraph(data, { collapsedGroupIds: new Set(["g1"]) });
    expect(vg.diagnostics?.culledNodeCount).toBe(1);
    expect(vg.diagnostics?.hiddenNodeReasonById.get("n2")).toBe("hidden-collapsed-group");
  });
});

describe("buildVisibleGraph — focus filter", () => {
  it("restricts visibility to focused node and immediate neighbors", () => {
    const data = makeData(
      [
        { id: "n1", label: "A", kind: "x" },
        { id: "n2", label: "B", kind: "x" },
        { id: "n3", label: "C", kind: "x" },
      ],
      [
        { id: "e1", sourceId: "n1", targetId: "n2" },
        { id: "e2", sourceId: "n2", targetId: "n3" },
      ]
    );
    const vg = buildVisibleGraph(data, { focusedNodeId: "n2" });
    expect(vg.visibleNodeIds.has("n1")).toBe(true);
    expect(vg.visibleNodeIds.has("n2")).toBe(true);
    expect(vg.visibleNodeIds.has("n3")).toBe(true);
  });

  it("hides unconnected nodes when focus is set", () => {
    const data = makeData(
      [
        { id: "n1", label: "A", kind: "x" },
        { id: "n2", label: "B", kind: "x" },
        { id: "n3", label: "C", kind: "x" },
      ],
      [{ id: "e1", sourceId: "n1", targetId: "n2" }]
    );
    const vg = buildVisibleGraph(data, { focusedNodeId: "n1" });
    expect(vg.visibleNodeIds.has("n1")).toBe(true);
    expect(vg.visibleNodeIds.has("n2")).toBe(true);
    expect(vg.visibleNodeIds.has("n3")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// OverlayRegistry
// ---------------------------------------------------------------------------

describe("OverlayRegistry", () => {
  it("registers an overlay descriptor", () => {
    const reg = new OverlayRegistry();
    reg.register({ kind: "health", displayName: "Health", zOrder: 10 });
    const desc = reg.get("health");
    expect(desc).toBeDefined();
    expect(desc?.displayName).toBe("Health");
    expect(desc?.visible).toBe(true);
  });

  it("respects initial visible: false", () => {
    const reg = new OverlayRegistry();
    reg.register({ kind: "trace", displayName: "Trace", zOrder: 5, visible: false });
    expect(reg.get("trace")?.visible).toBe(false);
  });

  it("setVisible changes visibility", () => {
    const reg = new OverlayRegistry();
    reg.register({ kind: "health", displayName: "Health", zOrder: 10 });
    reg.setVisible("health", false);
    expect(reg.get("health")?.visible).toBe(false);
    reg.setVisible("health", true);
    expect(reg.get("health")?.visible).toBe(true);
  });

  it("getVisible returns only visible overlays in z-order", () => {
    const reg = new OverlayRegistry();
    reg.register({ kind: "b", displayName: "B", zOrder: 20 });
    reg.register({ kind: "a", displayName: "A", zOrder: 10 });
    reg.register({ kind: "c", displayName: "C", zOrder: 30, visible: false });
    const visible = reg.getVisible();
    expect(visible.length).toBe(2);
    expect(visible[0]?.kind).toBe("a");
    expect(visible[1]?.kind).toBe("b");
  });

  it("getAll returns all overlays regardless of visibility", () => {
    const reg = new OverlayRegistry();
    reg.register({ kind: "a", displayName: "A", zOrder: 10, visible: false });
    reg.register({ kind: "b", displayName: "B", zOrder: 20 });
    expect(reg.getAll().length).toBe(2);
  });

  it("unregister removes an overlay", () => {
    const reg = new OverlayRegistry();
    reg.register({ kind: "health", displayName: "Health", zOrder: 10 });
    reg.unregister("health");
    expect(reg.get("health")).toBeUndefined();
  });

  it("replaces existing descriptor on re-registration", () => {
    const reg = new OverlayRegistry();
    reg.register({ kind: "health", displayName: "Health v1", zOrder: 10 });
    reg.register({ kind: "health", displayName: "Health v2", zOrder: 20 });
    expect(reg.get("health")?.displayName).toBe("Health v2");
    expect(reg.get("health")?.zOrder).toBe(20);
  });

  it("stores optional description and legend metadata", () => {
    const reg = new OverlayRegistry();
    reg.register({
      kind: "health",
      displayName: "Health",
      zOrder: 10,
      description: "Runtime health",
      legend: {
        items: [{ value: "warning", label: "Warning", color: "#f59e0b" }],
      },
    });
    const desc = reg.get("health");
    expect(desc?.description).toBe("Runtime health");
    expect(desc?.legend?.items[0]?.value).toBe("warning");
  });
});

// ---------------------------------------------------------------------------
// SpatialIndex
// ---------------------------------------------------------------------------

describe("buildSpatialIndex", () => {
  const entries: SpatialEntry[] = [
    { id: "n1", kind: "node", bounds: { x: 0, y: 0, width: 100, height: 40 } },
    { id: "n2", kind: "node", bounds: { x: 200, y: 100, width: 100, height: 40 } },
    { id: "e1", kind: "edge", bounds: { x: 100, y: 20, width: 100, height: 80 } },
  ];

  it("query returns entries intersecting the region", () => {
    const index = buildSpatialIndex(entries);
    const results = index.query({ x: 0, y: 0, width: 150, height: 50 });
    const ids = results.map((r) => r.id);
    expect(ids).toContain("n1");
    expect(ids).toContain("e1");
    expect(ids).not.toContain("n2");
  });

  it("query returns empty array for non-overlapping region", () => {
    const index = buildSpatialIndex(entries);
    const results = index.query({ x: 500, y: 500, width: 10, height: 10 });
    expect(results.length).toBe(0);
  });

  it("hitTest returns the entry containing the point", () => {
    const index = buildSpatialIndex(entries);
    const hit = index.hitTest(50, 20);
    expect(hit?.id).toBe("n1");
  });

  it("hitTest returns null for a point outside all entries", () => {
    const index = buildSpatialIndex(entries);
    const hit = index.hitTest(1000, 1000);
    expect(hit).toBeNull();
  });

  it("hitTest with overlapping entries returns the last one (topmost)", () => {
    const overlapping: SpatialEntry[] = [
      { id: "bottom", kind: "node", bounds: { x: 0, y: 0, width: 100, height: 100 } },
      { id: "top", kind: "node", bounds: { x: 10, y: 10, width: 80, height: 80 } },
    ];
    const index = buildSpatialIndex(overlapping);
    const hit = index.hitTest(50, 50);
    expect(hit?.id).toBe("top");
  });

  it("query on empty index returns empty array", () => {
    const index = buildSpatialIndex([]);
    expect(index.query({ x: 0, y: 0, width: 100, height: 100 }).length).toBe(0);
  });

  it("uniform-grid implementation is compatible with linear semantics", () => {
    const linear = buildSpatialIndex(entries);
    const grid = buildSpatialIndexWithOptions(entries, { implementation: "uniform-grid", cellSize: 64 });
    const region: BoundingBox = { x: 0, y: 0, width: 250, height: 130 };
    expect(grid.query(region).map((e) => e.id).sort()).toEqual(linear.query(region).map((e) => e.id).sort());
    expect(grid.hitTest(50, 20)?.id).toBe(linear.hitTest(50, 20)?.id);
  });
});

// ---------------------------------------------------------------------------
// RuntimeDiagnostics
// ---------------------------------------------------------------------------

describe("RuntimeDiagnostics", () => {
  it("starts with zero counts", () => {
    const diag = new RuntimeDiagnostics();
    expect(diag.visibleNodeCount).toBe(0);
    expect(diag.visibleEdgeCount).toBe(0);
    expect(diag.totalDiffApplications).toBe(0);
  });

  it("record stores samples", () => {
    const diag = new RuntimeDiagnostics();
    diag.record("render", 12);
    diag.record("layout", 5);
    const samples = diag.getRecentSamples();
    expect(samples.length).toBe(2);
    expect(samples[0]?.label).toBe("render");
    expect(samples[1]?.label).toBe("layout");
  });

  it("getRecentSamples respects limit", () => {
    const diag = new RuntimeDiagnostics();
    for (let i = 0; i < 10; i++) diag.record("x", i);
    expect(diag.getRecentSamples(3).length).toBe(3);
  });

  it("setVisibleCounts updates counts", () => {
    const diag = new RuntimeDiagnostics();
    diag.setGraphCounts(100, 20, 5);
    diag.setVisibleCounts(42, 7, 3);
    expect(diag.visibleNodeCount).toBe(42);
    expect(diag.visibleEdgeCount).toBe(7);
    expect(diag.visibleGroupCount).toBe(3);
    expect(diag.culledNodeCount).toBe(58);
    expect(diag.culledEdgeCount).toBe(13);
  });

  it("recordDiffApplication increments counter", () => {
    const diag = new RuntimeDiagnostics();
    diag.recordDiffApplication();
    diag.recordDiffApplication();
    expect(diag.totalDiffApplications).toBe(2);
  });

  it("getSummary returns all counts", () => {
    const diag = new RuntimeDiagnostics();
    diag.setGraphCounts(12, 4, 2);
    diag.setVisibleCounts(10, 3, 1);
    diag.recordDiffApplication();
    diag.recordDiffFailure();
    diag.record("r", 1);
    const summary = diag.getSummary();
    expect(summary.graphNodeCount).toBe(12);
    expect(summary.visibleNodeCount).toBe(10);
    expect(summary.visibleEdgeCount).toBe(3);
    expect(summary.totalDiffApplications).toBe(1);
    expect(summary.failedDiffApplications).toBe(1);
    expect(summary.recentSampleCount).toBe(1);
  });

  it("clear removes all samples", () => {
    const diag = new RuntimeDiagnostics();
    diag.record("x", 1);
    diag.record("y", 2);
    diag.clear();
    expect(diag.getRecentSamples().length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// GraphRuntimeHost
// ---------------------------------------------------------------------------

describe("GraphRuntimeHost — initialization", () => {
  it("creates default subsystems if none provided", () => {
    const host = new GraphRuntimeHost();
    expect(host.store).toBeInstanceOf(GraphRuntimeStore);
    expect(host.overlayRegistry).toBeInstanceOf(OverlayRegistry);
    expect(host.diagnostics).toBeInstanceOf(RuntimeDiagnostics);
  });

  it("accepts custom subsystems", () => {
    const store = new GraphRuntimeStore();
    const registry = new OverlayRegistry();
    const diag = new RuntimeDiagnostics();
    const host = new GraphRuntimeHost({ store, overlayRegistry: registry, diagnostics: diag });
    expect(host.store).toBe(store);
    expect(host.overlayRegistry).toBe(registry);
    expect(host.diagnostics).toBe(diag);
  });
});

describe("GraphRuntimeHost — FocusNode command", () => {
  it("dispatch FocusNode updates store focusedNodeId", () => {
    const host = new GraphRuntimeHost();
    host.dispatch({ type: "FocusNode", nodeId: "n1" });
    expect(host.store.getSnapshot().focus.focusedNodeId).toBe("n1");
  });
});

describe("GraphRuntimeHost — FocusGroup command", () => {
  it("dispatch FocusGroup updates store focusedGroupId", () => {
    const host = new GraphRuntimeHost();
    host.dispatch({ type: "FocusGroup", groupId: "g1" });
    expect(host.store.getSnapshot().focus.focusedGroupId).toBe("g1");
  });
});

describe("GraphRuntimeHost — CollapseGroup command", () => {
  it("dispatch CollapseGroup collapses an expanded group", () => {
    const host = new GraphRuntimeHost();
    // First expand g1
    host.store.toggleGroup("g1");
    expect(host.store.getSnapshot().layout.expandedGroupIds.has("g1")).toBe(true);
    // Now collapse via command
    host.dispatch({ type: "CollapseGroup", groupId: "g1" });
    expect(host.store.getSnapshot().layout.expandedGroupIds.has("g1")).toBe(false);
  });

  it("dispatch CollapseGroup on already-collapsed group is a no-op", () => {
    const host = new GraphRuntimeHost();
    host.dispatch({ type: "CollapseGroup", groupId: "g1" });
    expect(host.store.getSnapshot().layout.expandedGroupIds.has("g1")).toBe(false);
  });
});

describe("GraphRuntimeHost — ExpandGroup command", () => {
  it("dispatch ExpandGroup expands a collapsed group", () => {
    const host = new GraphRuntimeHost();
    host.dispatch({ type: "ExpandGroup", groupId: "g1" });
    expect(host.store.getSnapshot().layout.expandedGroupIds.has("g1")).toBe(true);
  });

  it("dispatch ExpandGroup on already-expanded group is a no-op", () => {
    const host = new GraphRuntimeHost();
    host.store.toggleGroup("g1"); // expand
    host.dispatch({ type: "ExpandGroup", groupId: "g1" });
    expect(host.store.getSnapshot().layout.expandedGroupIds.has("g1")).toBe(true);
  });
});

describe("GraphRuntimeHost — ApplySearch command", () => {
  it("dispatch ApplySearch updates store search query", () => {
    const host = new GraphRuntimeHost();
    host.dispatch({ type: "ApplySearch", query: "my-search" });
    expect(host.store.getSnapshot().search.query).toBe("my-search");
  });
});

describe("GraphRuntimeHost — NavigateBack command", () => {
  it("dispatch NavigateBack moves to previous node in history", () => {
    const host = new GraphRuntimeHost();
    host.dispatch({ type: "FocusNode", nodeId: "n1" });
    host.dispatch({ type: "FocusNode", nodeId: "n2" });
    host.dispatch({ type: "NavigateBack" });
    // After navigating back, focusedNodeId should be n1
    expect(host.store.getSnapshot().focus.focusedNodeId).toBe("n1");
  });

  it("dispatch NavigateBack with empty history is a no-op", () => {
    const host = new GraphRuntimeHost();
    expect(() => host.dispatch({ type: "NavigateBack" })).not.toThrow();
  });
});

describe("GraphRuntimeHost — NavigateForward command", () => {
  it("dispatch NavigateForward moves to next node in history", () => {
    const host = new GraphRuntimeHost();
    host.dispatch({ type: "FocusNode", nodeId: "n1" });
    host.dispatch({ type: "FocusNode", nodeId: "n2" });
    host.dispatch({ type: "NavigateBack" });
    host.dispatch({ type: "NavigateForward" });
    expect(host.store.getSnapshot().focus.focusedNodeId).toBe("n2");
  });
});

describe("GraphRuntimeHost — RevealElement command", () => {
  it("reveal can focus hidden nodes that are outside the current visible subset", () => {
    const host = new GraphRuntimeHost();
    const data = makeData(
      [
        { id: "n1", label: "A", kind: "service" },
        { id: "n2", label: "B", kind: "service" },
      ],
      [{ id: "e1", sourceId: "n1", targetId: "n2" }]
    );
    host.store.setData(data);
    const visible = buildVisibleGraph(data, { searchMatchedIds: new Set(["n1"]) });
    expect(visible.visibleNodeIds.has("n2")).toBe(false);
    host.dispatch({ type: "RevealElement", elementId: "n2", elementKind: "node" });
    expect(host.store.getSnapshot().focus.focusedNodeId).toBe("n2");
  });
});

describe("GraphRuntimeHost — custom command handlers", () => {
  it("addCommandHandler receives dispatched commands", () => {
    const host = new GraphRuntimeHost();
    const handler = vi.fn();
    host.addCommandHandler(handler);
    host.dispatch({ type: "FitSelection" });
    expect(handler).toHaveBeenCalledWith({ type: "FitSelection" });
  });

  it("unsubscribing removes the handler", () => {
    const host = new GraphRuntimeHost();
    const handler = vi.fn();
    const unsub = host.addCommandHandler(handler);
    unsub();
    host.dispatch({ type: "FitSelection" });
    expect(handler).not.toHaveBeenCalled();
  });

  it("multiple handlers all receive the command", () => {
    const host = new GraphRuntimeHost();
    const h1 = vi.fn();
    const h2 = vi.fn();
    host.addCommandHandler(h1);
    host.addCommandHandler(h2);
    host.dispatch({ type: "FitSelection" });
    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();
  });
});

describe("GraphRuntimeHost — diagnostics integration", () => {
  it("records failed diff applications", () => {
    const host = new GraphRuntimeHost();
    host.receiveSnapshot({
      version: 1,
      nodes: [{ id: "n1", label: "A", kind: "service" }],
      edges: [],
    });
    expect(() =>
      host.receiveDiff({
        fromVersion: 999,
        toVersion: 1000,
        nodeOperations: [],
        edgeOperations: [],
      })
    ).toThrow();
    expect(host.diagnostics.failedDiffApplications).toBe(1);
  });
});

describe("GraphRuntimeHost — overlay providers", () => {
  it("registers providers and recomputes overlay state", () => {
    const host = new GraphRuntimeHost();
    host.store.setData(
      makeData([{ id: "n1", label: "A", kind: "service" }])
    );
    const compute = vi.fn(() => ({
      nodeOverlays: new Map([["n1", { nodeId: "n1", kind: "health", data: { badge: "!" } }]]),
    }));

    const provider: OverlayProvider = {
      kind: "health",
      descriptor: { kind: "health", displayName: "Health", zOrder: 10 },
      compute,
    };

    host.registerOverlayProvider(provider);
    const overlay = host.store.getSnapshot().overlays.nodeOverlays.get("n1");
    expect(compute).toHaveBeenCalled();
    expect(host.overlayRegistry.get("health")).toBeDefined();
    expect(overlay?.kind).toBe("health");
  });

  it("isolates provider failures without throwing", () => {
    const host = new GraphRuntimeHost();
    host.store.setData(makeData([{ id: "n1", label: "A", kind: "service" }]));
    const provider: OverlayProvider = {
      kind: "unstable",
      descriptor: { kind: "unstable", displayName: "Unstable", zOrder: 10 },
      compute: () => {
        throw new Error("boom");
      },
    };

    expect(() => host.registerOverlayProvider(provider)).not.toThrow();
    expect(host.overlayRegistry.get("unstable")?.visible).toBe(false);
    expect(host.getOverlayProviderDiagnostics().get("unstable")).toEqual(["boom"]);
  });

  it("recomputes providers after snapshot updates", () => {
    const host = new GraphRuntimeHost();
    const provider: OverlayProvider = {
      kind: "ownership",
      descriptor: { kind: "ownership", displayName: "Ownership", zOrder: 10 },
      compute: ({ data }) => ({
        nodeOverlays: new Map(
          [...data.nodes.keys()].map((id) => [id, { nodeId: id, kind: "ownership" }])
        ),
      }),
    };
    host.registerOverlayProvider(provider);
    host.receiveSnapshot({
      version: 1,
      nodes: [{ id: "n1", label: "A", kind: "service" }],
      edges: [],
    });
    expect(host.store.getSnapshot().overlays.nodeOverlays.has("n1")).toBe(true);
  });
});

describe("GraphRuntimeHost — inspection events", () => {
  it("emits NodeInspected with target metadata", () => {
    const host = new GraphRuntimeHost();
    host.store.setData(makeData([{ id: "n1", label: "Node A", kind: "service" }]));
    const handler = vi.fn();
    host.store.eventBus.on("NodeInspected", handler);
    host.inspectNode("n1");
    expect(handler).toHaveBeenCalled();
    expect(handler.mock.calls[0]?.[0]?.targetType).toBe("node");
    expect(handler.mock.calls[0]?.[0]?.targetIds).toEqual(["n1"]);
  });

  it("emits OverlayInspected for overlay target context", () => {
    const host = new GraphRuntimeHost();
    const handler = vi.fn();
    host.store.eventBus.on("OverlayInspected", handler);
    host.inspectOverlay("health", "node", "n1");
    expect(handler).toHaveBeenCalledWith({
      targetType: "overlay",
      targetIds: ["n1"],
      kind: "health",
      topologyScope: "node",
    });
  });
});

// ---------------------------------------------------------------------------
// Runtime event bus — new events
// ---------------------------------------------------------------------------

describe("RuntimeEventMap — new Milestone 3 events", () => {
  it("store.eventBus supports CommandDispatched event", () => {
    const store = new GraphRuntimeStore();
    const handler = vi.fn();
    store.eventBus.on("CommandDispatched", handler);
    const cmd: SemanticCommand = { type: "FocusNode", nodeId: "n1" };
    store.eventBus.emit("CommandDispatched", { command: cmd });
    expect(handler).toHaveBeenCalledWith({ command: cmd });
  });

  it("store.eventBus supports OverlayRegistryChanged event", () => {
    const store = new GraphRuntimeStore();
    const handler = vi.fn();
    store.eventBus.on("OverlayRegistryChanged", handler);
    store.eventBus.emit("OverlayRegistryChanged", { kind: "health" });
    expect(handler).toHaveBeenCalledWith({ kind: "health" });
  });

  it("store.eventBus supports LayoutCompleted event", () => {
    const store = new GraphRuntimeStore();
    const handler = vi.fn();
    store.eventBus.on("LayoutCompleted", handler);
    store.eventBus.emit("LayoutCompleted", { durationMs: 42 });
    expect(handler).toHaveBeenCalledWith({ durationMs: 42 });
  });

  it("store.eventBus supports NodeInspected event", () => {
    const store = new GraphRuntimeStore();
    const handler = vi.fn();
    store.eventBus.on("NodeInspected", handler);
    store.eventBus.emit("NodeInspected", { targetType: "node", targetIds: ["n1"] });
    expect(handler).toHaveBeenCalledWith({ targetType: "node", targetIds: ["n1"] });
  });
});

// ---------------------------------------------------------------------------
// Multi-view coordination and minimap helpers
// ---------------------------------------------------------------------------

describe("MultiViewCoordinator", () => {
  it("synchronizes linked target viewports explicitly", () => {
    const coordinator = new MultiViewCoordinator();
    const main = createViewportContext(0, 0, 1, 800, 600);
    const mini = createViewportContext(0, 0, 1, 200, 150);
    coordinator.registerView({ viewId: "main", viewport: main });
    coordinator.registerView({ viewId: "mini", viewport: mini });
    coordinator.linkViews("main", ["mini"]);

    const next = createViewportContext(-120, -60, 2, 800, 600);
    coordinator.updateViewport("main", next);
    expect(coordinator.getView("mini")?.viewport.panX).toBe(-120);
    expect(coordinator.getView("mini")?.viewport.scale).toBe(2);
  });
});

describe("buildMinimapViewportRect", () => {
  it("projects main viewport bounds into normalized minimap coordinates", () => {
    const viewport = createViewportContext(-200, -100, 2, 400, 200);
    const rect = buildMinimapViewportRect({ x: 0, y: 0, width: 1000, height: 500 }, viewport);
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.y).toBeGreaterThanOrEqual(0);
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
  });
});
