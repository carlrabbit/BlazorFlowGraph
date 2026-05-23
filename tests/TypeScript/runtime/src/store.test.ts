import { GraphRuntimeEventBus, GraphRuntimeStore } from "@dataflow-visualizer/runtime";
import { describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// GraphRuntimeStore — initial state
// ---------------------------------------------------------------------------

describe("GraphRuntimeStore initial state", () => {
  it("starts with empty data slice", () => {
    const store = new GraphRuntimeStore();
    const snap = store.getSnapshot();
    expect(snap.data.version).toBe(0);
    expect(snap.data.nodes.size).toBe(0);
    expect(snap.data.edges.size).toBe(0);
    expect(snap.data.groups.size).toBe(0);
  });

  it("starts with empty selection", () => {
    const store = new GraphRuntimeStore();
    const snap = store.getSnapshot();
    expect(snap.interaction.selectedNodeIds.size).toBe(0);
    expect(snap.interaction.hoveredNodeId).toBeNull();
  });

  it("starts with null focus", () => {
    const store = new GraphRuntimeStore();
    const snap = store.getSnapshot();
    expect(snap.focus.focusedNodeId).toBeNull();
    expect(snap.focus.focusedGroupId).toBeNull();
    expect(snap.focus.navigationHistory.length).toBe(0);
  });

  it("starts with empty search", () => {
    const store = new GraphRuntimeStore();
    const snap = store.getSnapshot();
    expect(snap.search.query).toBe("");
    expect(snap.search.matchedNodeIds.size).toBe(0);
  });

  it("starts with Incremental layout policy", () => {
    const store = new GraphRuntimeStore();
    const snap = store.getSnapshot();
    expect(snap.layout.policy).toBe("Incremental");
    expect(snap.layout.expandedGroupIds.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Selection updates
// ---------------------------------------------------------------------------

describe("Selection updates", () => {
  it("setSelection updates selectedNodeIds", () => {
    const store = new GraphRuntimeStore();
    store.setSelection(new Set(["n1", "n2"]));
    const snap = store.getSnapshot();
    expect(snap.interaction.selectedNodeIds.has("n1")).toBe(true);
    expect(snap.interaction.selectedNodeIds.has("n2")).toBe(true);
  });

  it("setSelection fires SelectionChanged event", () => {
    const store = new GraphRuntimeStore();
    const handler = vi.fn();
    store.eventBus.on("SelectionChanged", handler);
    store.setSelection(new Set(["n1"]));
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ selectedNodeIds: new Set(["n1"]) });
  });

  it("setSelection notifies store subscribers", () => {
    const store = new GraphRuntimeStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.setSelection(new Set(["n1"]));
    expect(listener).toHaveBeenCalledOnce();
  });

  it("setHover updates hoveredNodeId", () => {
    const store = new GraphRuntimeStore();
    store.setHover("n3");
    expect(store.getSnapshot().interaction.hoveredNodeId).toBe("n3");
  });

  it("setHover accepts null", () => {
    const store = new GraphRuntimeStore();
    store.setHover("n3");
    store.setHover(null);
    expect(store.getSnapshot().interaction.hoveredNodeId).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Focus updates
// ---------------------------------------------------------------------------

describe("Focus updates", () => {
  it("setFocus updates focusedNodeId", () => {
    const store = new GraphRuntimeStore();
    store.setFocus({ focusedNodeId: "n1" });
    expect(store.getSnapshot().focus.focusedNodeId).toBe("n1");
  });

  it("setFocus fires FocusChanged event", () => {
    const store = new GraphRuntimeStore();
    const handler = vi.fn();
    store.eventBus.on("FocusChanged", handler);
    store.setFocus({ focusedNodeId: "n1" });
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ focusedNodeId: "n1", focusedGroupId: null });
  });

  it("setFocus appends to navigationHistory when focusedNodeId changes", () => {
    const store = new GraphRuntimeStore();
    store.setFocus({ focusedNodeId: "n1" });
    store.setFocus({ focusedNodeId: "n2" });
    const history = store.getSnapshot().focus.navigationHistory;
    expect(history).toContain("n1");
    expect(history).toContain("n2");
  });

  it("setFocus does not duplicate history for same node", () => {
    const store = new GraphRuntimeStore();
    store.setFocus({ focusedNodeId: "n1" });
    store.setFocus({ focusedNodeId: "n1" });
    const history = store.getSnapshot().focus.navigationHistory;
    expect(history.filter((id) => id === "n1").length).toBe(1);
  });

  it("setFocus updates focusedGroupId independently", () => {
    const store = new GraphRuntimeStore();
    store.setFocus({ focusedGroupId: "g1" });
    expect(store.getSnapshot().focus.focusedGroupId).toBe("g1");
    expect(store.getSnapshot().focus.focusedNodeId).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Group expand / collapse
// ---------------------------------------------------------------------------

describe("Group expand/collapse", () => {
  it("toggleGroup expands a collapsed group", () => {
    const store = new GraphRuntimeStore();
    store.toggleGroup("g1");
    expect(store.getSnapshot().layout.expandedGroupIds.has("g1")).toBe(true);
  });

  it("toggleGroup collapses an expanded group", () => {
    const store = new GraphRuntimeStore();
    store.toggleGroup("g1");
    store.toggleGroup("g1");
    expect(store.getSnapshot().layout.expandedGroupIds.has("g1")).toBe(false);
  });

  it("toggleGroup fires GroupExpanded when expanding", () => {
    const store = new GraphRuntimeStore();
    const handler = vi.fn();
    store.eventBus.on("GroupExpanded", handler);
    store.toggleGroup("g1");
    expect(handler).toHaveBeenCalledWith({ groupId: "g1" });
  });

  it("toggleGroup fires GroupCollapsed when collapsing", () => {
    const store = new GraphRuntimeStore();
    const collapsedHandler = vi.fn();
    store.eventBus.on("GroupCollapsed", collapsedHandler);
    store.toggleGroup("g1");
    store.toggleGroup("g1");
    expect(collapsedHandler).toHaveBeenCalledWith({ groupId: "g1" });
  });
});

// ---------------------------------------------------------------------------
// Search state updates
// ---------------------------------------------------------------------------

describe("Search state updates", () => {
  it("setSearch updates query and matched nodes", () => {
    const store = new GraphRuntimeStore();
    store.setSearch("hello", new Set(["n1", "n2"]));
    const snap = store.getSnapshot();
    expect(snap.search.query).toBe("hello");
    expect(snap.search.matchedNodeIds.has("n1")).toBe(true);
    expect(snap.search.matchedNodeIds.has("n2")).toBe(true);
  });

  it("setSearch fires SearchApplied event", () => {
    const store = new GraphRuntimeStore();
    const handler = vi.fn();
    store.eventBus.on("SearchApplied", handler);
    store.setSearch("world", new Set(["n3"]));
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ query: "world", matchedNodeIds: new Set(["n3"]) });
  });
});

// ---------------------------------------------------------------------------
// GraphRuntimeEventBus
// ---------------------------------------------------------------------------

describe("GraphRuntimeEventBus", () => {
  it("on/off registers and deregisters handlers", () => {
    const bus = new GraphRuntimeEventBus();
    const handler = vi.fn();
    bus.on("ViewportChanged", handler);
    bus.emit("ViewportChanged", {});
    expect(handler).toHaveBeenCalledOnce();
    bus.off("ViewportChanged", handler);
    bus.emit("ViewportChanged", {});
    expect(handler).toHaveBeenCalledOnce();
  });

  it("does not throw when emitting event with no handlers", () => {
    const bus = new GraphRuntimeEventBus();
    expect(() => bus.emit("ViewportChanged", {})).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// subscribe / unsubscribe
// ---------------------------------------------------------------------------

describe("Store subscribe/unsubscribe", () => {
  it("unsubscribe prevents further notifications", () => {
    const store = new GraphRuntimeStore();
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    store.setHover("n1");
    expect(listener).toHaveBeenCalledOnce();
    unsub();
    store.setHover("n2");
    expect(listener).toHaveBeenCalledOnce();
  });
});
