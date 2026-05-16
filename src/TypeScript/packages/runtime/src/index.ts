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
export type { NodeId, GroupId, GraphNode, GraphEdge, GraphGroup };

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
  if (diff.fromVersion !== state.version) {
    throw new Error(
      `diff fromVersion ${diff.fromVersion} does not match current state version ${state.version}`
    );
  }

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
  /** Fired when a semantic command is dispatched through GraphRuntimeHost. */
  CommandDispatched: { readonly command: SemanticCommand };
  /** Fired when an overlay kind is registered or its visibility changes. */
  OverlayRegistryChanged: { readonly kind: string };
  /** Fired after a layout computation completes. */
  LayoutCompleted: { readonly durationMs: number };
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

// ---------------------------------------------------------------------------
// Semantic commands (Phase 6)
// ---------------------------------------------------------------------------

/** Focus a specific node, bringing it into view and making it the active element. */
export interface FocusNodeCommand {
  readonly type: "FocusNode";
  readonly nodeId: NodeId;
}

/** Collapse a group into a compact representation. */
export interface CollapseGroupCommand {
  readonly type: "CollapseGroup";
  readonly groupId: GroupId;
}

/** Expand a previously collapsed group. */
export interface ExpandGroupCommand {
  readonly type: "ExpandGroup";
  readonly groupId: GroupId;
}

/** Fit the viewport around the current selection, or the full graph if nothing is selected. */
export interface FitSelectionCommand {
  readonly type: "FitSelection";
}

/** Apply a search query and update the search state. */
export interface ApplySearchCommand {
  readonly type: "ApplySearch";
  readonly query: string;
}

/** Navigate back in the focus navigation history. */
export interface NavigateBackCommand {
  readonly type: "NavigateBack";
}

/** Discriminated union of all semantic runtime commands. */
export type SemanticCommand =
  | FocusNodeCommand
  | CollapseGroupCommand
  | ExpandGroupCommand
  | FitSelectionCommand
  | ApplySearchCommand
  | NavigateBackCommand;

// ---------------------------------------------------------------------------
// Viewport context (Phase 8)
// ---------------------------------------------------------------------------

/** Axis-aligned bounding rectangle in graph-space coordinates. */
export interface GraphBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Contextual information about the current viewport state.
 * Enables viewport-aware rendering decisions such as visibility culling.
 */
export interface ViewportContext {
  /** Pan offset in screen pixels. */
  readonly panX: number;
  readonly panY: number;
  /** Zoom scale factor (1.0 = 100%). */
  readonly scale: number;
  /** Visible area in graph-space coordinates, derived from pan and scale. */
  readonly visibleBounds: GraphBounds;
  /** Screen dimensions of the render surface. */
  readonly screenWidth: number;
  readonly screenHeight: number;
}

/**
 * Creates a viewport context from raw pan/zoom and screen dimensions.
 * `visibleBounds` is computed automatically.
 */
export function createViewportContext(
  panX: number,
  panY: number,
  scale: number,
  screenWidth: number,
  screenHeight: number
): ViewportContext {
  const safeScale = scale > 0 ? scale : 1;
  return {
    panX,
    panY,
    scale: safeScale,
    screenWidth,
    screenHeight,
    visibleBounds: {
      x: -panX / safeScale,
      y: -panY / safeScale,
      width: screenWidth / safeScale,
      height: screenHeight / safeScale,
    },
  };
}

// ---------------------------------------------------------------------------
// Visible graph (Phase 3)
// ---------------------------------------------------------------------------

/**
 * A filtered subset of the runtime graph that represents what is currently
 * visible given active viewport, search, and focus policies.
 * This is distinct from both the semantic graph and the full runtime graph.
 */
export interface VisibleGraph {
  readonly visibleNodeIds: ReadonlySet<NodeId>;
  readonly visibleEdgeIds: ReadonlySet<string>;
  readonly visibleGroupIds: ReadonlySet<GroupId>;
}

/** Policies that control which elements appear in the VisibleGraph. */
export interface VisibilityPolicy {
  /** IDs of nodes matched by active search. Empty set means no search filter. */
  readonly searchMatchedIds?: ReadonlySet<NodeId>;
  /** When non-null, only the focused node and its immediate neighbors are visible. */
  readonly focusedNodeId?: NodeId | null;
  /** Groups that are currently collapsed — their child nodes are hidden. */
  readonly collapsedGroupIds?: ReadonlySet<GroupId>;
}

/**
 * Builds a `VisibleGraph` from the runtime data and optional visibility policies.
 * All nodes are visible by default; policies progressively restrict visibility.
 */
export function buildVisibleGraph(
  data: GraphDataState | GraphState,
  policy?: VisibilityPolicy
): VisibleGraph {
  const searchFilter = policy?.searchMatchedIds;
  const focusedNode = policy?.focusedNodeId;
  const collapsedGroups = policy?.collapsedGroupIds ?? new Set<GroupId>();

  // Build set of hidden node IDs from collapsed groups
  const hiddenByGroup = new Set<NodeId>();
  for (const group of data.groups.values()) {
    if (collapsedGroups.has(group.id)) {
      for (const childId of group.childNodeIds) {
        hiddenByGroup.add(childId);
      }
    }
  }

  // Determine candidate visible nodes
  const visibleNodeIds = new Set<NodeId>();
  for (const nodeId of data.nodes.keys()) {
    if (hiddenByGroup.has(nodeId)) continue;
    if (searchFilter != null && searchFilter.size > 0 && !searchFilter.has(nodeId)) continue;
    visibleNodeIds.add(nodeId);
  }

  // Focus filter: restrict to focused node and neighbors (one hop)
  if (focusedNode != null && data.nodes.has(focusedNode)) {
    const focusVisible = new Set<NodeId>([focusedNode]);
    for (const edge of data.edges.values()) {
      if (edge.sourceId === focusedNode && visibleNodeIds.has(edge.targetId)) {
        focusVisible.add(edge.targetId);
      }
      if (edge.targetId === focusedNode && visibleNodeIds.has(edge.sourceId)) {
        focusVisible.add(edge.sourceId);
      }
    }
    for (const id of [...visibleNodeIds]) {
      if (!focusVisible.has(id)) visibleNodeIds.delete(id);
    }
  }

  // Only include edges where both endpoints are visible
  const visibleEdgeIds = new Set<string>();
  for (const edge of data.edges.values()) {
    if (visibleNodeIds.has(edge.sourceId) && visibleNodeIds.has(edge.targetId)) {
      visibleEdgeIds.add(edge.id);
    }
  }

  // Include non-collapsed groups that have at least one visible member
  const visibleGroupIds = new Set<GroupId>();
  for (const group of data.groups.values()) {
    if (collapsedGroups.has(group.id)) continue;
    if (group.childNodeIds.some((id) => visibleNodeIds.has(id))) {
      visibleGroupIds.add(group.id);
    }
  }

  return { visibleNodeIds, visibleEdgeIds, visibleGroupIds };
}

// ---------------------------------------------------------------------------
// Overlay registry (Phase 4)
// ---------------------------------------------------------------------------

/** Describes a named overlay type that can be registered with the OverlayRegistry. */
export interface OverlayDescriptor {
  /** Unique identifier for this overlay type. */
  readonly kind: string;
  /** Human-readable name for display in tooling and diagnostics. */
  readonly displayName: string;
  /** Controls z-order when multiple overlays are composed. Higher = rendered last (on top). */
  readonly zOrder: number;
  /** When false the overlay is registered but not shown. Defaults to true. */
  readonly visible?: boolean;
}

/** The OverlayRegistry manages structured overlay registration and visibility. */
export class OverlayRegistry {
  private readonly descriptors = new Map<string, OverlayDescriptor & { visible: boolean }>();

  /** Registers an overlay type. Replaces any existing registration with the same kind. */
  register(descriptor: OverlayDescriptor): void {
    this.descriptors.set(descriptor.kind, {
      ...descriptor,
      visible: descriptor.visible ?? true,
    });
  }

  /** Unregisters an overlay type by kind. */
  unregister(kind: string): void {
    this.descriptors.delete(kind);
  }

  /** Returns the descriptor for the given kind, or undefined if not registered. */
  get(kind: string): Readonly<OverlayDescriptor & { visible: boolean }> | undefined {
    return this.descriptors.get(kind);
  }

  /** Sets the visibility of a registered overlay kind. */
  setVisible(kind: string, visible: boolean): void {
    const existing = this.descriptors.get(kind);
    if (existing != null) {
      this.descriptors.set(kind, { ...existing, visible });
    }
  }

  /** Returns all registered overlay kinds in ascending z-order. */
  getVisible(): readonly OverlayDescriptor[] {
    return [...this.descriptors.values()]
      .filter((d) => d.visible)
      .sort((a, b) => a.zOrder - b.zOrder);
  }

  /** Returns all registered overlay kinds regardless of visibility. */
  getAll(): readonly (OverlayDescriptor & { visible: boolean })[] {
    return [...this.descriptors.values()].sort((a, b) => a.zOrder - b.zOrder);
  }
}

// ---------------------------------------------------------------------------
// Spatial index (Phase 9)
// ---------------------------------------------------------------------------

/** An axis-aligned bounding box used for spatial queries. */
export interface BoundingBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Entry in the spatial index representing a positioned graph element. */
export interface SpatialEntry {
  readonly id: string;
  readonly kind: "node" | "edge" | "group";
  readonly bounds: BoundingBox;
}

/**
 * SpatialIndex supports efficient spatial queries for hit testing,
 * visibility culling, and future virtualization.
 */
export interface SpatialIndex {
  /** Returns all entries whose bounds intersect the given region. */
  query(region: BoundingBox): readonly SpatialEntry[];
  /** Returns the entry containing the given point, or null if none. */
  hitTest(x: number, y: number): SpatialEntry | null;
}

/**
 * Builds a SpatialIndex from a map of node bounding boxes.
 * This is a simple linear-scan implementation suitable for moderate graph sizes.
 * Replace with a quadtree or R-tree for large graphs.
 */
export function buildSpatialIndex(entries: readonly SpatialEntry[]): SpatialIndex {
  return {
    query(region: BoundingBox): readonly SpatialEntry[] {
      return entries.filter((e) => boxesIntersect(e.bounds, region));
    },
    hitTest(x: number, y: number): SpatialEntry | null {
      // Iterate in reverse so topmost (last-rendered) elements are checked first
      for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i];
        if (entry == null) continue;
        const b = entry.bounds;
        if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
          return entry;
        }
      }
      return null;
    },
  };
}

function boxesIntersect(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// ---------------------------------------------------------------------------
// Runtime diagnostics (Phase 11)
// ---------------------------------------------------------------------------

/** Timing sample with a label and duration. */
export interface DiagnosticsSample {
  readonly label: string;
  readonly durationMs: number;
  readonly timestamp: number;
}

/**
 * Runtime diagnostics collector.
 * Records timing and count metrics for render, layout, and diff operations.
 */
export class RuntimeDiagnostics {
  private readonly samples: DiagnosticsSample[] = [];
  private _visibleNodeCount = 0;
  private _visibleEdgeCount = 0;
  private _totalDiffApplications = 0;

  /** Records a timing sample under the given label. */
  record(label: string, durationMs: number): void {
    this.samples.push({ label, durationMs, timestamp: Date.now() });
  }

  /** Updates the current visible node/edge counts. */
  setVisibleCounts(nodeCount: number, edgeCount: number): void {
    this._visibleNodeCount = nodeCount;
    this._visibleEdgeCount = edgeCount;
  }

  /** Increments the diff application counter. */
  recordDiffApplication(): void {
    this._totalDiffApplications++;
  }

  /** Returns the most recent samples up to `limit` entries (default 100). */
  getRecentSamples(limit = 100): readonly DiagnosticsSample[] {
    return this.samples.slice(-limit);
  }

  get visibleNodeCount(): number { return this._visibleNodeCount; }
  get visibleEdgeCount(): number { return this._visibleEdgeCount; }
  get totalDiffApplications(): number { return this._totalDiffApplications; }

  /** Returns a summary snapshot of current diagnostic state. */
  getSummary(): {
    readonly visibleNodeCount: number;
    readonly visibleEdgeCount: number;
    readonly totalDiffApplications: number;
    readonly recentSampleCount: number;
  } {
    return {
      visibleNodeCount: this._visibleNodeCount,
      visibleEdgeCount: this._visibleEdgeCount,
      totalDiffApplications: this._totalDiffApplications,
      recentSampleCount: this.samples.length,
    };
  }

  /** Clears all recorded samples. */
  clear(): void {
    this.samples.length = 0;
  }
}

// ---------------------------------------------------------------------------
// GraphRuntimeHost — composition root (Phase 1)
// ---------------------------------------------------------------------------

/**
 * GraphRuntimeHost wires together the runtime subsystems.
 * It acts as the composition root, providing a single point of initialization
 * and a unified dispatch surface for semantic commands.
 *
 * Responsibilities:
 * - subsystem initialization
 * - dependency wiring
 * - command dispatch
 * - lifecycle coordination
 */
export class GraphRuntimeHost {
  readonly store: GraphRuntimeStore;
  readonly overlayRegistry: OverlayRegistry;
  readonly diagnostics: RuntimeDiagnostics;

  private _commandHandlers: Array<(cmd: SemanticCommand) => void> = [];

  constructor(options?: {
    store?: GraphRuntimeStore;
    overlayRegistry?: OverlayRegistry;
    diagnostics?: RuntimeDiagnostics;
  }) {
    this.store = options?.store ?? new GraphRuntimeStore();
    this.overlayRegistry = options?.overlayRegistry ?? new OverlayRegistry();
    this.diagnostics = options?.diagnostics ?? new RuntimeDiagnostics();
  }

  /**
   * Dispatches a semantic command through the host.
   * Built-in commands (FocusNode, CollapseGroup, ExpandGroup, ApplySearch, NavigateBack)
   * are handled automatically. Additional handlers can be registered via `addCommandHandler`.
   */
  dispatch(command: SemanticCommand): void {
    this._handleBuiltIn(command);
    for (const handler of this._commandHandlers) {
      handler(command);
    }
  }

  /** Registers an additional command handler invoked after built-in handling. */
  addCommandHandler(handler: (cmd: SemanticCommand) => void): () => void {
    this._commandHandlers.push(handler);
    return () => {
      const idx = this._commandHandlers.indexOf(handler);
      if (idx >= 0) this._commandHandlers.splice(idx, 1);
    };
  }

  private _handleBuiltIn(command: SemanticCommand): void {
    switch (command.type) {
      case "FocusNode":
        this.store.setFocus({ focusedNodeId: command.nodeId });
        break;
      case "CollapseGroup": {
        const expanded = this.store.getSnapshot().layout.expandedGroupIds;
        if (expanded.has(command.groupId)) {
          this.store.toggleGroup(command.groupId);
        }
        break;
      }
      case "ExpandGroup": {
        const expanded = this.store.getSnapshot().layout.expandedGroupIds;
        if (!expanded.has(command.groupId)) {
          this.store.toggleGroup(command.groupId);
        }
        break;
      }
      case "ApplySearch":
        // Callers are responsible for providing matched IDs (requires query engine).
        this.store.setSearch(command.query, new Set());
        break;
      case "NavigateBack": {
        const history = this.store.getSnapshot().focus.navigationHistory;
        if (history.length >= 2) {
          const previous = history[history.length - 2];
          if (previous != null) {
            this.store.setFocus({ focusedNodeId: previous });
          }
        }
        break;
      }
      case "FitSelection":
        // FitSelection is a viewport command — implementation lives in the host rendering layer.
        break;
    }
  }
}
