/**
 * Runtime package — reconciliation engine, graph state runtime, store, and event bus.
 */

import type {
  GraphSnapshot,
  GraphDiff,
  NodeId,
  GroupId,
  GraphNode,
  GraphEdge,
  GraphGroup,
  NodeOverlay,
  EdgeOverlay,
} from "@dataflow-visualizer/protocol";

export type { GraphSnapshot, GraphDiff, NodeOverlay, EdgeOverlay };

// ---------------------------------------------------------------------------
// Core graph state
// ---------------------------------------------------------------------------

/** Mutable runtime state for the graph (backward-compatible). */
export interface GraphState {
  readonly version: number;
  readonly nodes: ReadonlyMap<NodeId, GraphNode>;
  readonly edges: ReadonlyMap<string, GraphEdge>;
  readonly groups: ReadonlyMap<string, GraphGroup>;
}

/** Creates an initial empty graph state. */
export function createEmptyState(): GraphState {
  return {
    version: 0,
    nodes: new Map(),
    edges: new Map(),
    groups: new Map(),
  };
}

/** Applies a snapshot to produce a new state. */
export function applySnapshot(snapshot: GraphSnapshot): GraphState {
  return {
    version: snapshot.version,
    nodes: new Map(snapshot.nodes.map((n) => [n.id, n])),
    edges: new Map(snapshot.edges.map((e) => [e.id, e])),
    groups: new Map((snapshot.groups ?? []).map((g) => [g.id, g])),
  };
}

/** Applies a diff to an existing state. */
export function applyDiff(state: GraphState, diff: GraphDiff): GraphState {
  const nodes = new Map(state.nodes);
  const edges = new Map(state.edges);
  const groups = new Map(state.groups);

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

  for (const op of diff.groupOperations ?? []) {
    if (op.type === "remove") {
      groups.delete(op.group.id);
    } else {
      groups.set(op.group.id, op.group);
    }
  }

  return { version: diff.toVersion, nodes, edges, groups };
}

// ---------------------------------------------------------------------------
// State slices
// ---------------------------------------------------------------------------

/** The authoritative data slice for nodes, edges, and groups. */
export interface GraphDataState {
  readonly version: number;
  readonly nodes: ReadonlyMap<NodeId, GraphNode>;
  readonly edges: ReadonlyMap<string, GraphEdge>;
  readonly groups: ReadonlyMap<GroupId, GraphGroup>;
}

/** Selection and hover state managed by the browser runtime. */
export interface InteractionState {
  readonly selectedNodeIds: ReadonlySet<NodeId>;
  readonly hoveredNodeId: NodeId | null;
}

/** Keyboard / structural focus and navigation history. */
export interface FocusState {
  readonly focusedNodeId: NodeId | null;
  readonly focusedGroupId: GroupId | null;
  readonly navigationHistory: readonly NodeId[];
}

/** Text search state. */
export interface SearchState {
  readonly query: string;
  readonly matchedNodeIds: ReadonlySet<NodeId>;
}

/** Per-node and per-edge overlay decorations. */
export interface OverlayState {
  readonly nodeOverlays: ReadonlyMap<NodeId, NodeOverlay>;
  readonly edgeOverlays: ReadonlyMap<string, EdgeOverlay>;
}

/** Controls when and how layout is recomputed. */
export type LayoutPolicy = "Never" | "Incremental" | "Full" | "GroupLocal" | "Manual";

/** Layout policy and group expansion state. */
export interface LayoutState {
  readonly policy: LayoutPolicy;
  readonly expandedGroupIds: ReadonlySet<GroupId>;
}

// ---------------------------------------------------------------------------
// Event bus
// ---------------------------------------------------------------------------

/** All events emitted by the runtime event bus. */
export type RuntimeEventMap = {
  SelectionChanged: { readonly selectedNodeIds: ReadonlySet<NodeId> };
  FocusChanged: { readonly focusedNodeId: NodeId | null; readonly focusedGroupId: GroupId | null };
  GroupCollapsed: { readonly groupId: GroupId };
  GroupExpanded: { readonly groupId: GroupId };
  SearchApplied: { readonly query: string; readonly matchedNodeIds: ReadonlySet<NodeId> };
  ViewportChanged: Record<string, never>;
};

export type RuntimeEventName = keyof RuntimeEventMap;

type EventHandler<K extends RuntimeEventName> = (payload: RuntimeEventMap[K]) => void;

/** Simple typed event bus for runtime state mutations. */
export class GraphRuntimeEventBus {
  private readonly handlers = new Map<RuntimeEventName, Set<EventHandler<RuntimeEventName>>>();

  on<K extends RuntimeEventName>(event: K, handler: EventHandler<K>): void {
    let bucket = this.handlers.get(event);
    if (bucket == null) {
      bucket = new Set();
      this.handlers.set(event, bucket);
    }
    bucket.add(handler as EventHandler<RuntimeEventName>);
  }

  off<K extends RuntimeEventName>(event: K, handler: EventHandler<K>): void {
    this.handlers.get(event)?.delete(handler as EventHandler<RuntimeEventName>);
  }

  emit<K extends RuntimeEventName>(event: K, payload: RuntimeEventMap[K]): void {
    const bucket = this.handlers.get(event);
    if (bucket == null) return;
    for (const handler of bucket) {
      handler(payload);
    }
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

/** Complete snapshot of all runtime state slices. */
export interface RuntimeSnapshot {
  readonly data: GraphDataState;
  readonly interaction: InteractionState;
  readonly focus: FocusState;
  readonly search: SearchState;
  readonly overlays: OverlayState;
  readonly layout: LayoutState;
}

/** Listener invoked whenever any store slice is updated. */
export type StoreListener = (snapshot: RuntimeSnapshot) => void;

/** Central store holding all runtime state slices. */
export class GraphRuntimeStore {
  private data: GraphDataState = {
    version: 0,
    nodes: new Map(),
    edges: new Map(),
    groups: new Map(),
  };

  private interaction: InteractionState = {
    selectedNodeIds: new Set(),
    hoveredNodeId: null,
  };

  private focus: FocusState = {
    focusedNodeId: null,
    focusedGroupId: null,
    navigationHistory: [],
  };

  private search: SearchState = {
    query: "",
    matchedNodeIds: new Set(),
  };

  private overlays: OverlayState = {
    nodeOverlays: new Map(),
    edgeOverlays: new Map(),
  };

  private layout: LayoutState = {
    policy: "Incremental",
    expandedGroupIds: new Set(),
  };

  private readonly listeners: Set<StoreListener> = new Set();
  readonly eventBus: GraphRuntimeEventBus = new GraphRuntimeEventBus();

  /** Replaces the data slice (nodes, edges, groups, version). */
  setData(data: GraphDataState): void {
    this.data = data;
    this.notify();
  }

  /** Updates selection state and fires SelectionChanged. */
  setSelection(selectedNodeIds: ReadonlySet<NodeId>): void {
    this.interaction = { ...this.interaction, selectedNodeIds };
    this.eventBus.emit("SelectionChanged", { selectedNodeIds });
    this.notify();
  }

  /** Updates the hovered node. */
  setHover(hoveredNodeId: NodeId | null): void {
    this.interaction = { ...this.interaction, hoveredNodeId };
    this.notify();
  }

  /** Updates focus state and fires FocusChanged. */
  setFocus(update: Partial<Pick<FocusState, "focusedNodeId" | "focusedGroupId">>): void {
    const focusedNodeId = update.focusedNodeId !== undefined ? update.focusedNodeId : this.focus.focusedNodeId;
    const focusedGroupId = update.focusedGroupId !== undefined ? update.focusedGroupId : this.focus.focusedGroupId;
    const navigationHistory =
      focusedNodeId !== null && focusedNodeId !== this.focus.focusedNodeId
        ? [...this.focus.navigationHistory, focusedNodeId]
        : this.focus.navigationHistory;
    this.focus = { focusedNodeId, focusedGroupId, navigationHistory };
    this.eventBus.emit("FocusChanged", { focusedNodeId, focusedGroupId });
    this.notify();
  }

  /** Updates search state and fires SearchApplied. */
  setSearch(query: string, matchedNodeIds: ReadonlySet<NodeId>): void {
    this.search = { query, matchedNodeIds };
    this.eventBus.emit("SearchApplied", { query, matchedNodeIds });
    this.notify();
  }

  /** Replaces the overlay state. */
  setOverlays(overlays: OverlayState): void {
    this.overlays = overlays;
    this.notify();
  }

  /** Updates layout policy. */
  setLayout(update: Partial<LayoutState>): void {
    this.layout = { ...this.layout, ...update };
    this.notify();
  }

  /** Toggles a group's expanded/collapsed state and fires the corresponding event. */
  toggleGroup(groupId: GroupId): void {
    const expanded = new Set(this.layout.expandedGroupIds);
    if (expanded.has(groupId)) {
      expanded.delete(groupId);
      this.layout = { ...this.layout, expandedGroupIds: expanded };
      this.eventBus.emit("GroupCollapsed", { groupId });
    } else {
      expanded.add(groupId);
      this.layout = { ...this.layout, expandedGroupIds: expanded };
      this.eventBus.emit("GroupExpanded", { groupId });
    }
    this.notify();
  }

  /** Returns a snapshot of the current state. */
  getSnapshot(): RuntimeSnapshot {
    return {
      data: this.data,
      interaction: this.interaction,
      focus: this.focus,
      search: this.search,
      overlays: this.overlays,
      layout: this.layout,
    };
  }

  /** Subscribes to all store mutations. Returns an unsubscribe function. */
  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}

// ---------------------------------------------------------------------------
// Search index
// ---------------------------------------------------------------------------

/** Query object for the search index. */
export interface SearchQuery {
  readonly text?: string;
  readonly nodeKinds?: readonly string[];
  readonly metadataFilters?: Readonly<Record<string, unknown>>;
}

/** A compiled index over node labels, kinds, and metadata for fast querying. */
export interface SearchIndex {
  search(query: SearchQuery): ReadonlySet<NodeId>;
}

/** Builds a search index from a GraphDataState or GraphState. */
export function buildSearchIndex(data: GraphDataState | GraphState): SearchIndex {
  return {
    search(query: SearchQuery): ReadonlySet<NodeId> {
      const text = query.text?.toLowerCase();
      const kinds = query.nodeKinds;
      const filters = query.metadataFilters;
      const result = new Set<NodeId>();

      for (const node of data.nodes.values()) {
        if (text != null && text.length > 0) {
          if (
            !node.label.toLowerCase().includes(text) &&
            !node.id.toLowerCase().includes(text)
          ) {
            continue;
          }
        }

        if (kinds != null && kinds.length > 0) {
          if (!kinds.includes(node.kind)) continue;
        }

        if (filters != null) {
          const meta = node.metadata ?? {};
          const allMatch = Object.entries(filters).every(
            ([k, v]) => meta[k] === v
          );
          if (!allMatch) continue;
        }

        result.add(node.id);
      }

      return result;
    },
  };
}
