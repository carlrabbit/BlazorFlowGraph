/**
 * Runtime package — reconciliation engine, graph state runtime, store, and event bus.
 */

import type {
  EdgeOverlay,
  GraphDiff,
  GraphEdge,
  GraphGroup,
  GraphNode,
  GraphSnapshot,
  GroupId,
  NodeId,
  NodeOverlay,
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
    throw new Error(`diff fromVersion ${diff.fromVersion} does not match current state version ${state.version}`);
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
  readonly navigationIndex: number;
}

/** Text search state. */
export type SearchVisibilityBehavior = "highlight" | "filter" | "isolate";

/** A structured filter token applied alongside free-text search. */
export interface SearchFilter {
  readonly key: string;
  readonly value: unknown;
}

/** Text search state. */
export interface SearchState {
  readonly query: string;
  readonly matchedNodeIds: ReadonlySet<NodeId>;
  readonly activeFilters: readonly SearchFilter[];
  readonly activeResultIndex: number;
  readonly visibilityBehavior: SearchVisibilityBehavior;
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

/** Semantic inspection target type. */
export type InspectionTargetType = "node" | "edge" | "group" | "selection" | "overlay";

/** Runtime inspection payload emitted through semantic inspection events. */
export interface InspectionPayload {
  readonly targetType: InspectionTargetType;
  readonly targetIds: readonly string[];
  readonly label?: string;
  readonly kind?: string;
  readonly metadataSummary?: Readonly<Record<string, unknown>>;
  readonly activeOverlayKinds?: readonly string[];
  readonly topologyScope?: string;
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
  /** Fired when a node inspection payload is requested. */
  NodeInspected: InspectionPayload;
  /** Fired when an edge inspection payload is requested. */
  EdgeInspected: InspectionPayload;
  /** Fired when a group inspection payload is requested. */
  GroupInspected: InspectionPayload;
  /** Fired when a selection inspection payload is requested. */
  SelectionInspected: InspectionPayload;
  /** Fired when an overlay inspection payload is requested. */
  OverlayInspected: InspectionPayload;
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
    navigationIndex: -1,
  };

  private search: SearchState = {
    query: "",
    matchedNodeIds: new Set(),
    activeFilters: [],
    activeResultIndex: -1,
    visibilityBehavior: "filter",
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
  setFocus(
    update: Partial<Pick<FocusState, "focusedNodeId" | "focusedGroupId">>,
    options?: { readonly recordHistory?: boolean }
  ): void {
    const focusedNodeId = update.focusedNodeId !== undefined ? update.focusedNodeId : this.focus.focusedNodeId;
    const focusedGroupId = update.focusedGroupId !== undefined ? update.focusedGroupId : this.focus.focusedGroupId;
    const recordInHistory = options?.recordHistory ?? true;

    let navigationHistory = this.focus.navigationHistory;
    let navigationIndex = this.focus.navigationIndex;
    const nodeChanged = focusedNodeId !== this.focus.focusedNodeId;

    if (nodeChanged && focusedNodeId !== null && recordInHistory) {
      const truncatedHistory = this.focus.navigationHistory.slice(0, this.focus.navigationIndex + 1);
      truncatedHistory.push(focusedNodeId);
      navigationHistory = truncatedHistory;
      navigationIndex = truncatedHistory.length - 1;
    } else if (nodeChanged && focusedNodeId !== null && !recordInHistory) {
      const existingIndex = this.focus.navigationHistory.lastIndexOf(focusedNodeId);
      if (existingIndex >= 0) {
        navigationIndex = existingIndex;
      }
    }

    this.focus = { focusedNodeId, focusedGroupId, navigationHistory, navigationIndex };
    this.eventBus.emit("FocusChanged", { focusedNodeId, focusedGroupId });
    this.notify();
  }

  /** Updates search state and fires SearchApplied. */
  setSearch(
    query: string,
    matchedNodeIds: ReadonlySet<NodeId>,
    options?: {
      readonly activeFilters?: readonly SearchFilter[];
      readonly activeResultIndex?: number;
      readonly visibilityBehavior?: SearchVisibilityBehavior;
    }
  ): void {
    this.search = {
      query,
      matchedNodeIds,
      activeFilters: options?.activeFilters ?? [],
      activeResultIndex: options?.activeResultIndex ?? -1,
      visibilityBehavior: options?.visibilityBehavior ?? "filter",
    };
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
          if (!node.label.toLowerCase().includes(text) && !node.id.toLowerCase().includes(text)) {
            continue;
          }
        }

        if (kinds != null && kinds.length > 0) {
          if (!kinds.includes(node.kind)) continue;
        }

        if (filters != null) {
          const meta = node.metadata ?? {};
          const allMatch = Object.entries(filters).every(([k, v]) => meta[k] === v);
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

/** Fit the viewport to the full graph extent. */
export interface FitGraphCommand {
  readonly type: "FitGraph";
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

/** Navigate forward in the focus navigation history. */
export interface NavigateForwardCommand {
  readonly type: "NavigateForward";
}

/** Focus a specific group, bringing it into view and making it active. */
export interface FocusGroupCommand {
  readonly type: "FocusGroup";
  readonly groupId: GroupId;
}

/** Reveal a semantic element, even if currently hidden by visibility policies. */
export interface RevealElementCommand {
  readonly type: "RevealElement";
  readonly elementId: string;
  readonly elementKind?: "node" | "edge" | "group";
}

/** Discriminated union of all semantic runtime commands. */
export type SemanticCommand =
  | FocusNodeCommand
  | FocusGroupCommand
  | CollapseGroupCommand
  | ExpandGroupCommand
  | FitGraphCommand
  | FitSelectionCommand
  | RevealElementCommand
  | ApplySearchCommand
  | NavigateBackCommand
  | NavigateForwardCommand;

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
  readonly diagnostics?: VisibilityDiagnostics;
}

/** Structured reason codes for why an element was excluded from the visible graph. */
export type VisibilityReasonCode =
  | "hidden-collapsed-group"
  | "hidden-search-filter"
  | "hidden-search-isolate"
  | "hidden-focus-filter";

/** Optional visibility diagnostics for large-graph tooling and stress samples. */
export interface VisibilityDiagnostics {
  readonly totalNodeCount: number;
  readonly visibleNodeCount: number;
  readonly culledNodeCount: number;
  readonly totalEdgeCount: number;
  readonly visibleEdgeCount: number;
  readonly culledEdgeCount: number;
  readonly totalGroupCount: number;
  readonly visibleGroupCount: number;
  readonly culledGroupCount: number;
  readonly hiddenNodeReasonById: ReadonlyMap<NodeId, VisibilityReasonCode>;
}

/** Policies that control which elements appear in the VisibleGraph. */
export interface VisibilityPolicy {
  /** IDs of nodes matched by active search. Empty set means no search filter. */
  readonly searchMatchedIds?: ReadonlySet<NodeId>;
  /** Explicit visibility behavior when search matches exist. */
  readonly searchVisibilityBehavior?: SearchVisibilityBehavior;
  /** When non-null, only the focused node and its immediate neighbors are visible. */
  readonly focusedNodeId?: NodeId | null;
  /** Groups that are currently collapsed — their child nodes are hidden. */
  readonly collapsedGroupIds?: ReadonlySet<GroupId>;
}

/**
 * Builds a `VisibleGraph` from the runtime data and optional visibility policies.
 * All nodes are visible by default; policies progressively restrict visibility.
 */
export function buildVisibleGraph(data: GraphDataState | GraphState, policy?: VisibilityPolicy): VisibleGraph {
  const searchFilter = policy?.searchMatchedIds;
  const searchVisibilityBehavior = policy?.searchVisibilityBehavior ?? "filter";
  const focusedNode = policy?.focusedNodeId;
  const collapsedGroups = policy?.collapsedGroupIds ?? new Set<GroupId>();

  // Build set of hidden node IDs from collapsed groups
  const hiddenByGroup = new Set<NodeId>();
  const hiddenNodeReasonById = new Map<NodeId, VisibilityReasonCode>();
  for (const group of data.groups.values()) {
    if (collapsedGroups.has(group.id)) {
      for (const childId of group.childNodeIds) {
        hiddenByGroup.add(childId);
        hiddenNodeReasonById.set(childId, "hidden-collapsed-group");
      }
    }
  }

  // Determine candidate visible nodes
  const visibleNodeIds = new Set<NodeId>();
  for (const nodeId of data.nodes.keys()) {
    if (hiddenByGroup.has(nodeId)) continue;
    if (
      searchFilter != null &&
      searchFilter.size > 0 &&
      searchVisibilityBehavior === "filter" &&
      !searchFilter.has(nodeId)
    ) {
      hiddenNodeReasonById.set(nodeId, "hidden-search-filter");
      continue;
    }
    visibleNodeIds.add(nodeId);
  }

  if (searchFilter != null && searchFilter.size > 0 && searchVisibilityBehavior === "isolate") {
    const isolated = new Set<NodeId>();
    for (const matchedId of searchFilter) {
      if (!visibleNodeIds.has(matchedId)) continue;
      isolated.add(matchedId);
      for (const edge of data.edges.values()) {
        if (edge.sourceId === matchedId && visibleNodeIds.has(edge.targetId)) isolated.add(edge.targetId);
        if (edge.targetId === matchedId && visibleNodeIds.has(edge.sourceId)) isolated.add(edge.sourceId);
      }
    }
    for (const nodeId of [...visibleNodeIds]) {
      if (!isolated.has(nodeId)) {
        visibleNodeIds.delete(nodeId);
        hiddenNodeReasonById.set(nodeId, "hidden-search-isolate");
      }
    }
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
      if (!focusVisible.has(id)) {
        visibleNodeIds.delete(id);
        hiddenNodeReasonById.set(id, "hidden-focus-filter");
      }
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

  const diagnostics: VisibilityDiagnostics = {
    totalNodeCount: data.nodes.size,
    visibleNodeCount: visibleNodeIds.size,
    culledNodeCount: data.nodes.size - visibleNodeIds.size,
    totalEdgeCount: data.edges.size,
    visibleEdgeCount: visibleEdgeIds.size,
    culledEdgeCount: data.edges.size - visibleEdgeIds.size,
    totalGroupCount: data.groups.size,
    visibleGroupCount: visibleGroupIds.size,
    culledGroupCount: data.groups.size - visibleGroupIds.size,
    hiddenNodeReasonById,
  };

  return { visibleNodeIds, visibleEdgeIds, visibleGroupIds, diagnostics };
}

// ---------------------------------------------------------------------------
// Overlay registry (Phase 4)
// ---------------------------------------------------------------------------

/** Describes a named overlay type that can be registered with the OverlayRegistry. */
export interface OverlayLegendItem {
  readonly value: string;
  readonly label: string;
  readonly color?: string;
  readonly description?: string;
}

/** Optional legend metadata exposed for a registered overlay kind. */
export interface OverlayLegendMetadata {
  readonly items: readonly OverlayLegendItem[];
}

/** Describes a named overlay type that can be registered with the OverlayRegistry. */
export interface OverlayDescriptor {
  /** Unique identifier for this overlay type. */
  readonly kind: string;
  /** Human-readable name for display in tooling and diagnostics. */
  readonly displayName: string;
  /** Controls z-order when multiple overlays are composed. Higher = rendered last (on top). */
  readonly zOrder: number;
  /** Optional overlay description surfaced in UI controls and diagnostics. */
  readonly description?: string;
  /** Optional legend metadata surfaced in overlay controls. */
  readonly legend?: OverlayLegendMetadata;
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
    return [...this.descriptors.values()].filter((d) => d.visible).sort((a, b) => a.zOrder - b.zOrder);
  }

  /** Returns all registered overlay kinds regardless of visibility. */
  getAll(): readonly (OverlayDescriptor & { visible: boolean })[] {
    return [...this.descriptors.values()].sort((a, b) => a.zOrder - b.zOrder);
  }
}

/** Overlay record for group targets. */
export interface GroupOverlay {
  readonly groupId: GroupId;
  readonly kind: string;
  readonly data?: Readonly<Record<string, unknown>>;
}

/** Snapshot input passed to overlay providers when recomputing overlays. */
export interface OverlayProviderInput {
  readonly data: GraphDataState;
  readonly runtime: RuntimeSnapshot;
  readonly configuration?: Readonly<Record<string, unknown>>;
}

/** Overlay values returned from a provider recomputation. */
export interface OverlayProviderResult {
  readonly nodeOverlays?: ReadonlyMap<NodeId, NodeOverlay>;
  readonly edgeOverlays?: ReadonlyMap<string, EdgeOverlay>;
  readonly groupOverlays?: ReadonlyMap<GroupId, GroupOverlay>;
  readonly legend?: OverlayLegendMetadata;
  readonly diagnostics?: readonly string[];
}

/** Contract implemented by semantic overlay providers. */
export interface OverlayProvider {
  readonly kind: string;
  readonly descriptor: OverlayDescriptor;
  compute(input: OverlayProviderInput): OverlayProviderResult;
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
  readonly kind: "node" | "edge" | "group" | "overlay";
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

/** Built-in spatial index implementations. */
export type SpatialIndexImplementation = "linear" | "uniform-grid";

/** Build options for choosing a spatial-index strategy. */
export interface SpatialIndexBuildOptions {
  readonly implementation?: SpatialIndexImplementation;
  readonly cellSize?: number;
}

const DEFAULT_SPATIAL_GRID_CELL_SIZE = 256;

/**
 * Builds a SpatialIndex from a map of node bounding boxes.
 * This is a simple linear-scan implementation suitable for moderate graph sizes.
 * Replace with a quadtree or R-tree for large graphs.
 */
export function buildSpatialIndex(entries: readonly SpatialEntry[]): SpatialIndex {
  return buildSpatialIndexWithOptions(entries, {});
}

/** Builds a SpatialIndex from positioned entries using a selectable implementation. */
export function buildSpatialIndexWithOptions(
  entries: readonly SpatialEntry[],
  options: SpatialIndexBuildOptions
): SpatialIndex {
  if ((options.implementation ?? "linear") === "uniform-grid") {
    return buildUniformGridSpatialIndex(entries, options.cellSize ?? DEFAULT_SPATIAL_GRID_CELL_SIZE);
  }
  return buildLinearSpatialIndex(entries);
}

function buildLinearSpatialIndex(entries: readonly SpatialEntry[]): SpatialIndex {
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

function buildUniformGridSpatialIndex(entries: readonly SpatialEntry[], cellSize: number): SpatialIndex {
  const safeCell = Number.isFinite(cellSize) && cellSize > 0 ? cellSize : 256;
  const cellMap = new Map<string, SpatialEntry[]>();

  for (const entry of entries) {
    const minX = Math.floor(entry.bounds.x / safeCell);
    const minY = Math.floor(entry.bounds.y / safeCell);
    const maxX = Math.floor((entry.bounds.x + entry.bounds.width) / safeCell);
    const maxY = Math.floor((entry.bounds.y + entry.bounds.height) / safeCell);
    for (let gx = minX; gx <= maxX; gx++) {
      for (let gy = minY; gy <= maxY; gy++) {
        const key = `${gx},${gy}`;
        const bucket = cellMap.get(key) ?? [];
        bucket.push(entry);
        cellMap.set(key, bucket);
      }
    }
  }

  return {
    query(region: BoundingBox): readonly SpatialEntry[] {
      const minX = Math.floor(region.x / safeCell);
      const minY = Math.floor(region.y / safeCell);
      const maxX = Math.floor((region.x + region.width) / safeCell);
      const maxY = Math.floor((region.y + region.height) / safeCell);
      const results = new Map<string, SpatialEntry>();
      for (let gx = minX; gx <= maxX; gx++) {
        for (let gy = minY; gy <= maxY; gy++) {
          const bucket = cellMap.get(`${gx},${gy}`);
          if (bucket == null) continue;
          for (const entry of bucket) {
            if (boxesIntersect(entry.bounds, region)) {
              results.set(entry.id, entry);
            }
          }
        }
      }
      return [...results.values()];
    },
    hitTest(x: number, y: number): SpatialEntry | null {
      const gx = Math.floor(x / safeCell);
      const gy = Math.floor(y / safeCell);
      const bucket = cellMap.get(`${gx},${gy}`);
      if (bucket == null) return null;
      for (let i = bucket.length - 1; i >= 0; i--) {
        // biome-ignore lint/style/noNonNullAssertion: i is a valid index within bucket.length - 1
        const entry = bucket[i]!;
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
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
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
  private _graphNodeCount = 0;
  private _graphEdgeCount = 0;
  private _graphGroupCount = 0;
  private _visibleNodeCount = 0;
  private _visibleEdgeCount = 0;
  private _visibleGroupCount = 0;
  private _culledNodeCount = 0;
  private _culledEdgeCount = 0;
  private _culledGroupCount = 0;
  private _totalDiffApplications = 0;
  private _failedDiffApplications = 0;

  /** Records a timing sample under the given label. */
  record(label: string, durationMs: number): void {
    this.samples.push({ label, durationMs, timestamp: Date.now() });
  }

  /** Updates the current visible node/edge counts. */
  setVisibleCounts(nodeCount: number, edgeCount: number, groupCount = 0): void {
    this._visibleNodeCount = nodeCount;
    this._visibleEdgeCount = edgeCount;
    this._visibleGroupCount = groupCount;
    this.updateCulledCounts();
  }

  /** Updates total graph element counts used to derive culling totals. */
  setGraphCounts(nodeCount: number, edgeCount: number, groupCount = 0): void {
    this._graphNodeCount = nodeCount;
    this._graphEdgeCount = edgeCount;
    this._graphGroupCount = groupCount;
    this.updateCulledCounts();
  }

  /** Increments the diff application counter. */
  recordDiffApplication(): void {
    this._totalDiffApplications++;
  }

  /** Increments the failed diff application counter. */
  recordDiffFailure(): void {
    this._failedDiffApplications++;
  }

  /** Returns the most recent samples up to `limit` entries (default 100). */
  getRecentSamples(limit = 100): readonly DiagnosticsSample[] {
    return this.samples.slice(-limit);
  }

  get visibleNodeCount(): number {
    return this._visibleNodeCount;
  }
  get visibleEdgeCount(): number {
    return this._visibleEdgeCount;
  }
  get visibleGroupCount(): number {
    return this._visibleGroupCount;
  }
  get graphNodeCount(): number {
    return this._graphNodeCount;
  }
  get graphEdgeCount(): number {
    return this._graphEdgeCount;
  }
  get graphGroupCount(): number {
    return this._graphGroupCount;
  }
  get culledNodeCount(): number {
    return this._culledNodeCount;
  }
  get culledEdgeCount(): number {
    return this._culledEdgeCount;
  }
  get culledGroupCount(): number {
    return this._culledGroupCount;
  }
  get totalDiffApplications(): number {
    return this._totalDiffApplications;
  }
  get failedDiffApplications(): number {
    return this._failedDiffApplications;
  }

  /** Returns a summary snapshot of current diagnostic state. */
  getSummary(): {
    readonly graphNodeCount: number;
    readonly graphEdgeCount: number;
    readonly graphGroupCount: number;
    readonly visibleNodeCount: number;
    readonly visibleEdgeCount: number;
    readonly visibleGroupCount: number;
    readonly culledNodeCount: number;
    readonly culledEdgeCount: number;
    readonly culledGroupCount: number;
    readonly totalDiffApplications: number;
    readonly failedDiffApplications: number;
    readonly recentSampleCount: number;
  } {
    return {
      graphNodeCount: this._graphNodeCount,
      graphEdgeCount: this._graphEdgeCount,
      graphGroupCount: this._graphGroupCount,
      visibleNodeCount: this._visibleNodeCount,
      visibleEdgeCount: this._visibleEdgeCount,
      visibleGroupCount: this._visibleGroupCount,
      culledNodeCount: this._culledNodeCount,
      culledEdgeCount: this._culledEdgeCount,
      culledGroupCount: this._culledGroupCount,
      totalDiffApplications: this._totalDiffApplications,
      failedDiffApplications: this._failedDiffApplications,
      recentSampleCount: this.samples.length,
    };
  }

  /** Clears all recorded samples. */
  clear(): void {
    this.samples.length = 0;
  }

  private updateCulledCounts(): void {
    this._culledNodeCount = Math.max(0, this._graphNodeCount - this._visibleNodeCount);
    this._culledEdgeCount = Math.max(0, this._graphEdgeCount - this._visibleEdgeCount);
    this._culledGroupCount = Math.max(0, this._graphGroupCount - this._visibleGroupCount);
  }
}

// ---------------------------------------------------------------------------
// Multi-view coordination and minimap helpers
// ---------------------------------------------------------------------------

/** Per-view runtime state for coordinated multi-view graph navigation. */
export interface RuntimeGraphView {
  readonly viewId: string;
  readonly viewport: ViewportContext;
  readonly renderBudget?: {
    readonly maxNodes?: number;
    readonly maxEdges?: number;
  };
}

/** Change payload emitted when a view viewport changes. */
export interface ViewportSyncEvent {
  readonly sourceViewId: string;
  readonly targetViewId: string;
  readonly viewport: ViewportContext;
}

/** Explicit coordinator for synchronizing selected viewports over shared graph state. */
export class MultiViewCoordinator {
  private readonly views = new Map<string, RuntimeGraphView>();
  private readonly syncLinks = new Map<string, Set<string>>();
  private readonly listeners = new Set<(event: ViewportSyncEvent) => void>();

  registerView(view: RuntimeGraphView): void {
    this.views.set(view.viewId, view);
  }

  unregisterView(viewId: string): void {
    this.views.delete(viewId);
    this.syncLinks.delete(viewId);
    for (const targets of this.syncLinks.values()) {
      targets.delete(viewId);
    }
  }

  getView(viewId: string): RuntimeGraphView | undefined {
    return this.views.get(viewId);
  }

  getViews(): readonly RuntimeGraphView[] {
    return [...this.views.values()];
  }

  /** Links source view updates to one or more explicit target views. */
  linkViews(sourceViewId: string, targetViewIds: readonly string[]): void {
    this.syncLinks.set(sourceViewId, new Set(targetViewIds));
  }

  onViewportSynchronized(listener: (event: ViewportSyncEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  updateViewport(viewId: string, viewport: ViewportContext): void {
    const current = this.views.get(viewId);
    if (current == null) return;
    this.views.set(viewId, { ...current, viewport });
    const targets = this.syncLinks.get(viewId);
    if (targets == null) return;
    for (const targetViewId of targets) {
      const target = this.views.get(targetViewId);
      if (target == null) continue;
      this.views.set(targetViewId, { ...target, viewport });
      const event: ViewportSyncEvent = { sourceViewId: viewId, targetViewId, viewport };
      for (const listener of this.listeners) {
        listener(event);
      }
    }
  }
}

/** Minimap overview rectangle (normalized 0..1 coordinates over graph extent). */
export interface MinimapViewportRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Builds a normalized minimap viewport rectangle from graph and viewport bounds. */
export function buildMinimapViewportRect(graphBounds: GraphBounds, viewport: ViewportContext): MinimapViewportRect {
  if (graphBounds.width <= 0 || graphBounds.height <= 0) {
    return { x: 0, y: 0, width: 1, height: 1 };
  }
  const vx = (viewport.visibleBounds.x - graphBounds.x) / graphBounds.width;
  const vy = (viewport.visibleBounds.y - graphBounds.y) / graphBounds.height;
  const vw = viewport.visibleBounds.width / graphBounds.width;
  const vh = viewport.visibleBounds.height / graphBounds.height;
  return {
    x: clamp01(vx),
    y: clamp01(vy),
    width: clamp01(vw),
    height: clamp01(vh),
  };
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
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
  private readonly _overlayProviders = new Map<string, OverlayProvider>();
  private readonly _overlayProviderDiagnostics = new Map<string, readonly string[]>();

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
    this.store.eventBus.emit("CommandDispatched", { command });
    if (command.type !== "FitSelection") {
      this.recomputeOverlayProviders();
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

  /** Registers an overlay provider and recomputes overlays immediately. */
  registerOverlayProvider(provider: OverlayProvider): () => void {
    this._overlayProviders.set(provider.kind, provider);
    this.overlayRegistry.register(provider.descriptor);
    this.store.eventBus.emit("OverlayRegistryChanged", { kind: provider.kind });
    this.recomputeOverlayProviders();
    return () => {
      this.unregisterOverlayProvider(provider.kind);
    };
  }

  /** Unregisters an overlay provider by kind and recomputes overlays. */
  unregisterOverlayProvider(kind: string): void {
    this._overlayProviders.delete(kind);
    this._overlayProviderDiagnostics.delete(kind);
    this.overlayRegistry.unregister(kind);
    this.store.eventBus.emit("OverlayRegistryChanged", { kind });
    this.recomputeOverlayProviders();
  }

  /** Applies a full graph snapshot and recomputes provider overlays. */
  receiveSnapshot(snapshot: GraphSnapshot): void {
    this.store.setData(applySnapshot(snapshot));
    this.diagnostics.setGraphCounts(snapshot.nodes.length, snapshot.edges.length, snapshot.groups?.length ?? 0);
    this.diagnostics.setVisibleCounts(snapshot.nodes.length, snapshot.edges.length, snapshot.groups?.length ?? 0);
    this.pruneOverlayTargets();
    this.recomputeOverlayProviders();
  }

  /** Applies an incremental diff and recomputes provider overlays. */
  receiveDiff(diff: GraphDiff): void {
    try {
      const currentState = this.toGraphState(this.store.getSnapshot().data);
      const nextState = applyDiff(currentState, diff);
      this.store.setData(nextState);
      this.diagnostics.recordDiffApplication();
      this.diagnostics.setGraphCounts(nextState.nodes.size, nextState.edges.size, nextState.groups.size);
      this.diagnostics.setVisibleCounts(nextState.nodes.size, nextState.edges.size, nextState.groups.size);
      this.pruneOverlayTargets();
      this.recomputeOverlayProviders();
    } catch (error) {
      this.diagnostics.recordDiffFailure();
      throw error;
    }
  }

  /** Returns provider diagnostics keyed by overlay kind. */
  getOverlayProviderDiagnostics(): ReadonlyMap<string, readonly string[]> {
    return this._overlayProviderDiagnostics;
  }

  /** Recomputes overlays from all registered providers with failure isolation. */
  recomputeOverlayProviders(): void {
    const snapshot = this.store.getSnapshot();
    const nodeOverlays = new Map<NodeId, NodeOverlay>();
    const edgeOverlays = new Map<string, EdgeOverlay>();

    for (const provider of this._overlayProviders.values()) {
      try {
        const result = provider.compute({
          data: snapshot.data,
          runtime: snapshot,
        });
        const providerDiagnostics: string[] = [...(result.diagnostics ?? [])];

        if (result.legend != null) {
          const descriptor = this.overlayRegistry.get(provider.kind);
          if (descriptor != null) {
            this.overlayRegistry.register({ ...descriptor, legend: result.legend });
          }
        }

        if (result.nodeOverlays != null) {
          for (const [nodeId, overlay] of result.nodeOverlays) {
            const existing = nodeOverlays.get(nodeId);
            if (existing != null && existing.kind !== overlay.kind) {
              providerDiagnostics.push(
                `node overlay conflict on ${nodeId}: "${existing.kind}" overwritten by "${overlay.kind}"`
              );
            }
            nodeOverlays.set(nodeId, overlay);
          }
        }
        if (result.edgeOverlays != null) {
          for (const [edgeId, overlay] of result.edgeOverlays) {
            const existing = edgeOverlays.get(edgeId);
            if (existing != null && existing.kind !== overlay.kind) {
              providerDiagnostics.push(
                `edge overlay conflict on ${edgeId}: "${existing.kind}" overwritten by "${overlay.kind}"`
              );
            }
            edgeOverlays.set(edgeId, overlay);
          }
        }
        this._overlayProviderDiagnostics.set(provider.kind, providerDiagnostics);
      } catch (error) {
        const diagnostics = [error instanceof Error ? error.message : String(error)];
        this._overlayProviderDiagnostics.set(provider.kind, diagnostics);
        this.overlayRegistry.setVisible(provider.kind, false);
      }
    }

    this.store.setOverlays({
      nodeOverlays,
      edgeOverlays,
    });
  }

  /** Emits semantic inspection payload for a node target. */
  inspectNode(nodeId: NodeId): void {
    const node = this.store.getSnapshot().data.nodes.get(nodeId);
    const payload = this.buildInspectionPayload("node", nodeId, node?.label, node?.kind, node?.metadata);
    this.store.eventBus.emit("NodeInspected", payload);
  }

  /** Emits semantic inspection payload for an edge target. */
  inspectEdge(edgeId: string): void {
    const edge = this.store.getSnapshot().data.edges.get(edgeId);
    const payload = this.buildInspectionPayload("edge", edgeId, edge?.label, edge?.id, undefined);
    this.store.eventBus.emit("EdgeInspected", payload);
  }

  /** Emits semantic inspection payload for a group target. */
  inspectGroup(groupId: GroupId): void {
    const group = this.store.getSnapshot().data.groups.get(groupId);
    const payload = this.buildInspectionPayload("group", groupId, group?.label, group?.kind, group?.metadata);
    this.store.eventBus.emit("GroupInspected", payload);
  }

  /** Emits semantic inspection payload for a node selection target. */
  inspectSelection(nodeIds: ReadonlySet<NodeId>): void {
    const payload: InspectionPayload = {
      targetType: "selection",
      targetIds: [...nodeIds],
      topologyScope: "selection",
    };
    this.store.eventBus.emit("SelectionInspected", payload);
  }

  /** Emits semantic inspection payload for an overlay target. */
  inspectOverlay(kind: string, targetType: "node" | "edge" | "group", targetId: string): void {
    const payload: InspectionPayload = {
      targetType: "overlay",
      targetIds: [targetId],
      kind,
      topologyScope: targetType,
    };
    this.store.eventBus.emit("OverlayInspected", payload);
  }

  private _handleBuiltIn(command: SemanticCommand): void {
    switch (command.type) {
      case "FocusNode":
        this.store.setFocus({ focusedNodeId: command.nodeId });
        break;
      case "FocusGroup":
        this.store.setFocus({ focusedGroupId: command.groupId });
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
        const focus = this.store.getSnapshot().focus;
        if (focus.navigationIndex > 0) {
          const previous = focus.navigationHistory[focus.navigationIndex - 1];
          if (previous != null) {
            this.store.setFocus({ focusedNodeId: previous }, { recordHistory: false });
          }
        }
        break;
      }
      case "NavigateForward": {
        const focus = this.store.getSnapshot().focus;
        if (focus.navigationIndex >= 0 && focus.navigationIndex < focus.navigationHistory.length - 1) {
          const next = focus.navigationHistory[focus.navigationIndex + 1];
          if (next != null) {
            this.store.setFocus({ focusedNodeId: next }, { recordHistory: false });
          }
        }
        break;
      }
      case "RevealElement": {
        const snapshot = this.store.getSnapshot();
        const kind = command.elementKind;
        if ((kind === "group" || kind === undefined) && snapshot.data.groups.has(command.elementId)) {
          this.store.setFocus({ focusedGroupId: command.elementId });
          break;
        }
        if ((kind === "node" || kind === undefined) && snapshot.data.nodes.has(command.elementId)) {
          this.store.setFocus({ focusedNodeId: command.elementId });
          break;
        }
        if (kind === "edge" || kind === undefined) {
          const edge = snapshot.data.edges.get(command.elementId);
          if (edge != null) {
            this.store.setFocus({ focusedNodeId: edge.targetId });
          }
        }
        break;
      }
      case "FitGraph":
      case "FitSelection":
        // FitSelection is a viewport command — implementation lives in the host rendering layer.
        break;
    }
  }

  private pruneOverlayTargets(): void {
    const snapshot = this.store.getSnapshot();
    const current = snapshot.overlays;
    const nodeOverlays = new Map<NodeId, NodeOverlay>();
    for (const [nodeId, overlay] of current.nodeOverlays) {
      if (snapshot.data.nodes.has(nodeId)) {
        nodeOverlays.set(nodeId, overlay);
      }
    }

    const edgeOverlays = new Map<string, EdgeOverlay>();
    for (const [edgeId, overlay] of current.edgeOverlays) {
      if (snapshot.data.edges.has(edgeId)) {
        edgeOverlays.set(edgeId, overlay);
      }
    }

    this.store.setOverlays({ nodeOverlays, edgeOverlays });
  }

  private buildInspectionPayload(
    targetType: "node" | "edge" | "group",
    targetId: string,
    label?: string,
    kind?: string,
    metadataSummary?: Readonly<Record<string, unknown>>
  ): InspectionPayload {
    const snapshot = this.store.getSnapshot();
    const activeOverlayKinds: string[] = [];
    if (targetType === "node") {
      const overlay = snapshot.overlays.nodeOverlays.get(targetId);
      if (overlay != null) activeOverlayKinds.push(overlay.kind);
    } else if (targetType === "edge") {
      const overlay = snapshot.overlays.edgeOverlays.get(targetId);
      if (overlay != null) activeOverlayKinds.push(overlay.kind);
    }

    return {
      targetType,
      targetIds: [targetId],
      activeOverlayKinds,
      ...(label !== undefined ? { label } : {}),
      ...(kind !== undefined ? { kind } : {}),
      ...(metadataSummary !== undefined ? { metadataSummary } : {}),
    };
  }

  private toGraphState(data: GraphDataState): GraphState {
    return {
      version: data.version,
      nodes: data.nodes,
      edges: data.edges,
      groups: data.groups,
    };
  }
}
