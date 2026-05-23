/**
 * Renderer-SVG package — SVG renderer for the dataflow graph.
 * Milestone 3: adds GraphRendererBackend abstraction and RenderFrame model.
 * Milestone 4: adds style tokens, accessibility, group rendering, overlay rendering,
 *              and viewport-culling support in buildRenderFrame.
 */

import type { LayoutResult } from "@dataflow-visualizer/layout";
import type { GraphState } from "@dataflow-visualizer/runtime";
import type { GraphGroup, NodeOverlay, ViewportContext, VisibleGraph } from "@dataflow-visualizer/runtime";

export type { LayoutResult, VisibleGraph };

export interface RenderOptions {
  readonly width: number;
  readonly height: number;
  readonly nodeWidth?: number;
  readonly nodeHeight?: number;
}

/** Options for rendering a single layer. */
export interface RenderLayerOptions {
  readonly nodeWidth?: number;
  readonly nodeHeight?: number;
}

/** Explicit rendering layer ordering. */
export type RenderLayer = "groups" | "edges" | "nodes" | "labels" | "selection" | "overlays";

// ---------------------------------------------------------------------------
// Style tokens (Milestone 4) — map node kinds to visual appearance
// ---------------------------------------------------------------------------

/**
 * StyleToken defines the visual appearance of a node by kind.
 * All values are optional; unspecified values fall back to defaults.
 */
export interface StyleToken {
  /** Background fill colour (CSS colour string). */
  readonly fill: string;
  /** Border stroke colour. */
  readonly stroke: string;
  /** Border stroke width in pixels. */
  readonly strokeWidth: number;
  /** Text colour for the node label. */
  readonly textColor: string;
  /** Corner radius for the node rectangle. */
  readonly rx: number;
}

/** Built-in style tokens keyed by node kind. */
export const defaultStyleTokens: Record<string, StyleToken> = {
  default: {
    fill: "#e0e7ff",
    stroke: "#6366f1",
    strokeWidth: 1.5,
    textColor: "#1e1b4b",
    rx: 4,
  },
  service: {
    fill: "#d1fae5",
    stroke: "#059669",
    strokeWidth: 1.5,
    textColor: "#064e3b",
    rx: 4,
  },
  datastore: {
    fill: "#fef3c7",
    stroke: "#d97706",
    strokeWidth: 1.5,
    textColor: "#78350f",
    rx: 6,
  },
  gateway: {
    fill: "#ede9fe",
    stroke: "#7c3aed",
    strokeWidth: 2,
    textColor: "#4c1d95",
    rx: 4,
  },
  queue: {
    fill: "#fee2e2",
    stroke: "#dc2626",
    strokeWidth: 1.5,
    textColor: "#7f1d1d",
    rx: 4,
  },
  group: {
    fill: "#f0f9ff",
    stroke: "#0284c7",
    strokeWidth: 1,
    textColor: "#0c4a6e",
    rx: 8,
  },
};

/**
 * Resolves the StyleToken for the given node kind.
 * Falls back to the `default` token if the kind is not registered.
 */
export function resolveStyleToken(kind: string, tokens: Record<string, StyleToken> = defaultStyleTokens): StyleToken {
  // biome-ignore lint/style/noNonNullAssertion: defaultStyleTokens always defines a "default" key
  return tokens[kind] ?? tokens.default ?? defaultStyleTokens.default!;
}

// ---------------------------------------------------------------------------
// RenderFrame model (Phase 2 / Milestone 4 extended)
// ---------------------------------------------------------------------------

/** A positioned node ready for rendering (derived from LayoutResult). */
export interface RenderNode {
  readonly id: string;
  readonly label: string;
  readonly kind: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** A positioned edge ready for rendering. */
export interface RenderEdge {
  readonly id: string;
  readonly label?: string | undefined;
  readonly sections: readonly {
    readonly startPoint: { x: number; y: number };
    readonly endPoint: { x: number; y: number };
  }[];
}

/** A positioned group hull ready for rendering (Milestone 4). */
export interface RenderGroup {
  readonly id: string;
  readonly label: string;
  readonly kind: string;
  /** Bounding box of the group (encompasses all child nodes). */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** An active overlay badge to render on a node (Milestone 4). */
export type RenderOverlayShape = "badge" | "marker" | "halo" | "muted";

/** An active overlay marker to render on a node (Milestone 4+). */
export interface RenderOverlay {
  /** Node ID this overlay targets. */
  readonly nodeId: string;
  /** Overlay kind (e.g. "warning", "error", "info"). */
  readonly kind: string;
  /** Overlay shape hint for renderer default rendering. */
  readonly shape?: RenderOverlayShape;
  /** Optional severity used for sorting when overlays overlap. */
  readonly severity?: string;
  /** Optional visual priority override. Higher values render later. */
  readonly priority?: number;
  /** Optional badge text or icon indicator. */
  readonly badge?: string | undefined;
}

/**
 * RenderFrame is the explicit rendering representation produced by the view projection
 * pipeline. Backends receive a RenderFrame rather than raw runtime state.
 *
 * Pipeline: runtime state → view projection → RenderFrame → GraphRendererBackend
 */
export interface RenderFrame {
  /** Nodes visible in this frame (already filtered by VisibleGraph). */
  readonly nodes: readonly RenderNode[];
  /** Edges visible in this frame. */
  readonly edges: readonly RenderEdge[];
  /** Groups visible in this frame (Milestone 4). */
  readonly groups: readonly RenderGroup[];
  /** Overlays to render on nodes (Milestone 4). */
  readonly overlays: readonly RenderOverlay[];
  /** Total canvas dimensions derived from the layout. */
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly budgetLimited?: boolean;
  readonly culledNodeCount?: number;
  readonly culledEdgeCount?: number;
}

/** Progressive rendering limits applied when building a RenderFrame. */
export interface RenderBudget {
  readonly maxNodes?: number;
  readonly maxEdges?: number;
  readonly prioritizedNodeIds?: ReadonlySet<string>;
}

/** Group padding around child node bounds when computing group hull (in pixels). */
const GROUP_PADDING = 16;

/**
 * Builds a RenderFrame from a GraphState (or VisibleGraph-filtered subset)
 * and the computed LayoutResult. This is the view projection step.
 *
 * Milestone 4: accepts optional `viewport` for viewport-space culling,
 * includes group hulls and overlay badges in the output frame.
 */
export function buildRenderFrame(
  state: GraphState,
  layout: LayoutResult,
  options?: {
    nodeWidth?: number;
    nodeHeight?: number;
    visible?: VisibleGraph;
    viewport?: ViewportContext;
    styleTokens?: Record<string, StyleToken>;
    /** Optional node overlays from OverlayState.nodeOverlays to include in the frame. */
    nodeOverlays?: ReadonlyMap<string, NodeOverlay>;
    /** Optional frame-level render budget for progressive rendering. */
    budget?: RenderBudget;
  }
): RenderFrame {
  const nodeWidth = options?.nodeWidth ?? 120;
  const nodeHeight = options?.nodeHeight ?? 40;
  const visible = options?.visible;
  const viewport = options?.viewport;

  // Viewport culling bounds (in graph-space) for fast element rejection
  const cullBounds = viewport?.visibleBounds;

  const candidateNodes: RenderNode[] = [];
  for (const node of state.nodes.values()) {
    if (visible != null && !visible.visibleNodeIds.has(node.id)) continue;
    const pos = layout.nodes.get(node.id);
    if (pos == null) continue;
    // Cull against raw (unrounded) positions first to avoid unnecessary Math.floor work
    const w = pos.width ?? nodeWidth;
    const h = pos.height ?? nodeHeight;
    if (cullBounds != null && !boundsIntersect(pos.x, pos.y, w, h, cullBounds)) continue;
    candidateNodes.push({
      id: node.id,
      label: node.label,
      kind: node.kind,
      x: Math.floor(pos.x),
      y: Math.floor(pos.y),
      width: Math.floor(w),
      height: Math.floor(h),
    });
  }

  const nodeLimit = options?.budget?.maxNodes;
  const prioritizedNodeIds = options?.budget?.prioritizedNodeIds;
  const nodes =
    nodeLimit != null && nodeLimit >= 0 && candidateNodes.length > nodeLimit
      ? applyNodeBudget(candidateNodes, nodeLimit, prioritizedNodeIds)
      : candidateNodes;
  const renderedNodeIds = new Set(nodes.map((n) => n.id));
  const culledNodeCount = candidateNodes.length - nodes.length;

  const candidateEdges: RenderEdge[] = [];
  for (const edge of state.edges.values()) {
    if (visible != null && !visible.visibleEdgeIds.has(edge.id)) continue;
    if (!renderedNodeIds.has(edge.sourceId) || !renderedNodeIds.has(edge.targetId)) continue;
    const layoutEdge = layout.edges.get(edge.id);
    if (layoutEdge == null) continue;
    candidateEdges.push({
      id: edge.id,
      label: edge.label,
      sections: layoutEdge.sections,
    });
  }

  const budgetMaxEdges = options?.budget?.maxEdges;
  const edges =
    budgetMaxEdges != null && budgetMaxEdges >= 0 && candidateEdges.length > budgetMaxEdges
      ? candidateEdges.slice(0, budgetMaxEdges)
      : candidateEdges;
  const culledEdgeCount = candidateEdges.length - edges.length;

  // Build group hulls (Milestone 4)
  const groups: RenderGroup[] = [];
  for (const group of state.groups.values()) {
    if (visible != null && !visible.visibleGroupIds.has(group.id)) continue;
    const hull = computeGroupHull(group, layout, nodeWidth, nodeHeight);
    if (hull == null) continue;
    if (cullBounds != null && !boundsIntersect(hull.x, hull.y, hull.width, hull.height, cullBounds)) continue;
    groups.push({
      id: group.id,
      label: group.label,
      kind: group.kind,
      ...hull,
    });
  }

  // Build overlay badges from provided nodeOverlays (Milestone 4).
  // The overlay.data map may carry an optional "badge" string key used as the
  // badge indicator text (e.g. "!" for warnings, "E" for errors). No other
  // data keys are consumed by the renderer.
  const overlays: RenderOverlay[] = [];
  if (options?.nodeOverlays != null) {
    for (const [nodeId, overlay] of options.nodeOverlays) {
      if (visible != null && !visible.visibleNodeIds.has(nodeId)) continue;
      const badge = typeof overlay.data?.badge === "string" ? overlay.data.badge : undefined;
      const shapeValue = typeof overlay.data?.shape === "string" ? overlay.data.shape : undefined;
      const shape = isRenderOverlayShape(shapeValue) ? shapeValue : "badge";
      const severity = typeof overlay.data?.severity === "string" ? overlay.data.severity : undefined;
      const priority = typeof overlay.data?.priority === "number" ? overlay.data.priority : undefined;
      overlays.push({
        nodeId,
        kind: overlay.kind,
        shape,
        ...(severity !== undefined ? { severity } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(badge !== undefined ? { badge } : {}),
      });
    }
  }

  overlays.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0) || a.kind.localeCompare(b.kind));

  return {
    nodes,
    edges,
    groups,
    overlays,
    canvasWidth: Math.floor(layout.width),
    canvasHeight: Math.floor(layout.height),
    budgetLimited: culledNodeCount > 0 || culledEdgeCount > 0,
    culledNodeCount,
    culledEdgeCount,
  };
}

function applyNodeBudget(
  nodes: readonly RenderNode[],
  maxNodes: number,
  prioritizedNodeIds?: ReadonlySet<string>
): RenderNode[] {
  if (maxNodes <= 0) return [];
  const prioritized: RenderNode[] = [];
  const remaining: RenderNode[] = [];
  for (const node of nodes) {
    if (prioritizedNodeIds?.has(node.id) === true) {
      prioritized.push(node);
    } else {
      remaining.push(node);
    }
  }

  const selected: RenderNode[] = [];
  for (const node of prioritized) {
    if (selected.length >= maxNodes) break;
    selected.push(node);
  }
  for (const node of remaining) {
    if (selected.length >= maxNodes) break;
    selected.push(node);
  }
  return selected;
}

/** Returns the bounding hull for a group from child node positions, or null if no children placed. */
function computeGroupHull(
  group: GraphGroup,
  layout: LayoutResult,
  defaultWidth: number,
  defaultHeight: number
): { x: number; y: number; width: number; height: number } | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let found = false;

  for (const childId of group.childNodeIds) {
    const pos = layout.nodes.get(childId);
    if (pos == null) continue;
    found = true;
    const x = Math.floor(pos.x);
    const y = Math.floor(pos.y);
    const w = Math.floor(pos.width ?? defaultWidth);
    const h = Math.floor(pos.height ?? defaultHeight);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  }

  if (!found) return null;

  return {
    x: minX - GROUP_PADDING,
    y: minY - GROUP_PADDING,
    width: maxX - minX + GROUP_PADDING * 2,
    height: maxY - minY + GROUP_PADDING * 2,
  };
}

/** Returns true when the given rectangle intersects the viewport visible bounds. */
function boundsIntersect(
  x: number,
  y: number,
  w: number,
  h: number,
  vb: { x: number; y: number; width: number; height: number }
): boolean {
  return x < vb.x + vb.width && x + w > vb.x && y < vb.y + vb.height && y + h > vb.y;
}

// ---------------------------------------------------------------------------
// GraphRendererBackend interface (Phase 2)
// ---------------------------------------------------------------------------

/**
 * The GraphRendererBackend interface abstracts the rendering surface.
 * SVG is the primary implementation; alternative backends (Canvas, WebGL)
 * can be introduced by implementing this interface without touching the
 * render pipeline or runtime.
 */
export interface GraphRendererBackend {
  /**
   * Initializes the backend within the given container element.
   * Called once before the first render.
   */
  initialize(container: Element, width: number, height: number): void;

  /**
   * Renders a complete frame. Implementations should minimize DOM/canvas mutations.
   */
  renderFrame(frame: RenderFrame): void;

  /**
   * Updates the viewport transform (pan and zoom).
   */
  updateViewport(panX: number, panY: number, scale: number): void;

  /**
   * Resizes the render surface.
   */
  resize(width: number, height: number): void;

  /**
   * Releases all resources and removes DOM elements created by the backend.
   */
  dispose(): void;
}

// ---------------------------------------------------------------------------
// SvgRendererBackend — SVG implementation of GraphRendererBackend (Phase 2)
// ---------------------------------------------------------------------------

const SVG_NS = "http://www.w3.org/2000/svg";

const ARROW_DEFS_MARKUP = [
  "<defs>",
  `  <marker id="dfv-arrow" markerWidth="8" markerHeight="8"`,
  `           refX="6" refY="3" orient="auto">`,
  `    <path d="M0,0 L0,6 L8,3 z" fill="#9ca3af"/>`,
  "  </marker>",
  "</defs>",
].join("\n");

/**
 * SVG-based implementation of GraphRendererBackend.
 * Maintains a persistent SVG element with a viewport group for pan/zoom transforms.
 * Milestone 4: adds ARIA accessibility attributes and style-token-aware node rendering.
 */
export class SvgRendererBackend implements GraphRendererBackend {
  private svg: SVGSVGElement | null = null;
  private viewportGroup: SVGGElement | null = null;
  private readonly tokens: Record<string, StyleToken>;

  constructor(options?: { styleTokens?: Record<string, StyleToken> }) {
    this.tokens = options?.styleTokens ?? defaultStyleTokens;
  }

  initialize(container: Element, width: number, height: number): void {
    const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("width", String(Math.floor(width)));
    svg.setAttribute("height", String(Math.floor(height)));
    // Accessibility: mark as an interactive graphics document
    svg.setAttribute("role", "graphics-document");
    svg.setAttribute("aria-label", "Dataflow graph");
    svg.style.touchAction = "none";
    svg.style.userSelect = "none";
    svg.innerHTML = ARROW_DEFS_MARKUP;

    const viewportGroup = document.createElementNS(SVG_NS, "g") as SVGGElement;
    viewportGroup.setAttribute("class", "dfv-viewport");
    svg.appendChild(viewportGroup);

    container.innerHTML = "";
    container.appendChild(svg);

    this.svg = svg;
    this.viewportGroup = viewportGroup;
  }

  renderFrame(frame: RenderFrame): void {
    if (this.viewportGroup == null) return;
    this.viewportGroup.innerHTML = buildFrameMarkup(frame, this.tokens);
  }

  updateViewport(panX: number, panY: number, scale: number): void {
    this.viewportGroup?.setAttribute("transform", `translate(${panX},${panY}) scale(${scale})`);
  }

  resize(width: number, height: number): void {
    if (this.svg == null) return;
    this.svg.setAttribute("width", String(Math.floor(width)));
    this.svg.setAttribute("height", String(Math.floor(height)));
  }

  dispose(): void {
    this.svg?.parentElement?.removeChild(this.svg);
    this.svg = null;
    this.viewportGroup = null;
  }

  /** Returns the underlying SVG element, or null if not yet initialized. */
  getSvgElement(): SVGSVGElement | null {
    return this.svg;
  }
}

/** Builds the inner SVG markup string from a RenderFrame (Milestone 4: groups, overlays, style tokens, ARIA). */
function buildFrameMarkup(frame: RenderFrame, tokens: Record<string, StyleToken> = defaultStyleTokens): string {
  // Layer order: groups → edges → nodes → overlays
  const groupElements = frame.groups.map((group) => {
    const style = resolveStyleToken(group.kind, tokens);
    const labelText = escapeXml(group.label);
    return [
      `<g class="dfv-group" data-group-id="${escapeXmlAttr(group.id)}" role="graphics-object" aria-label="${escapeXmlAttr(group.label)} group">`,
      `  <rect x="${group.x}" y="${group.y}" width="${group.width}" height="${group.height}"`,
      `        rx="${style.rx}" ry="${style.rx}"`,
      `        fill="${escapeXmlAttr(style.fill)}" fill-opacity="0.3"`,
      `        stroke="${escapeXmlAttr(style.stroke)}" stroke-width="1" stroke-dasharray="4 3"/>`,
      `  <text x="${group.x + 8}" y="${group.y + 14}" font-size="11" fill="${escapeXmlAttr(style.stroke)}" font-weight="500">${labelText}</text>`,
      "</g>",
    ].join("\n");
  });

  const edgeElements = frame.edges.map((edge) => {
    const section = edge.sections[0];
    if (section == null) return "";
    const x1 = Math.floor(section.startPoint.x);
    const y1 = Math.floor(section.startPoint.y);
    const x2 = Math.floor(section.endPoint.x);
    const y2 = Math.floor(section.endPoint.y);
    const edgeLabel = edge.label != null ? escapeXml(edge.label) : "";
    const midX = Math.floor((x1 + x2) / 2);
    const midY = Math.floor((y1 + y2) / 2);
    const labelEl =
      edgeLabel !== ""
        ? `<text x="${midX}" y="${midY}" text-anchor="middle" font-size="10" fill="#6b7280">${edgeLabel}</text>`
        : "";
    return [
      `<g class="dfv-edge" data-edge-id="${escapeXmlAttr(edge.id)}" role="graphics-symbol" aria-label="${edgeLabel !== "" ? escapeXmlAttr(edgeLabel) : "edge"}">`,
      `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#9ca3af" stroke-width="1.5" marker-end="url(#dfv-arrow)"/>`,
      labelEl,
      "</g>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  // Build overlay badge lookup for fast access
  const overlayByNode = new Map<string, RenderOverlay>();
  for (const ov of frame.overlays) {
    overlayByNode.set(ov.nodeId, ov);
  }

  const nodeElements = frame.nodes.map((node) => {
    const style = resolveStyleToken(node.kind, tokens);
    const labelText = escapeXml(node.label);
    const textX = Math.floor(node.width / 2);
    const textY = Math.floor(node.height / 2 + 5);
    const overlay = overlayByNode.get(node.id);
    const overlayMarkup = overlay != null ? buildOverlayMarkup(overlay, node.width, node.height) : "";
    const mutedOpacity = overlay?.shape === "muted" ? ` opacity="0.45"` : "";
    return [
      `<g class="dfv-node" data-node-id="${escapeXmlAttr(node.id)}" data-kind="${escapeXmlAttr(node.kind)}"`,
      `   transform="translate(${node.x},${node.y})"`,
      `   role="graphics-symbol" aria-label="${escapeXmlAttr(node.label)}"${mutedOpacity}>`,
      `  <rect width="${node.width}" height="${node.height}"`,
      `        rx="${style.rx}" ry="${style.rx}"`,
      `        fill="${escapeXmlAttr(style.fill)}"`,
      `        stroke="${escapeXmlAttr(style.stroke)}" stroke-width="${style.strokeWidth}"/>`,
      `  <text x="${textX}" y="${textY}" text-anchor="middle" font-size="12"`,
      `        fill="${escapeXmlAttr(style.textColor)}">${labelText}</text>`,
      overlayMarkup,
      "</g>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  return [...groupElements, ...edgeElements, ...nodeElements].filter(Boolean).join("\n");
}

/** Builds the default SVG overlay markup for a node. */
function buildOverlayMarkup(overlay: RenderOverlay, nodeWidth: number, nodeHeight: number): string {
  if (overlay.shape === "halo") {
    return [
      `<rect x="-4" y="-4" width="${nodeWidth + 8}" height="${nodeHeight + 8}"`,
      `      rx="8" ry="8" fill="none" stroke="${resolveOverlayColor(overlay.kind)}" stroke-width="2" opacity="0.8"/>`,
    ].join("\n");
  }

  if (overlay.shape === "marker") {
    const color = resolveOverlayColor(overlay.kind);
    return [
      `<polygon points="${nodeWidth - 22},0 ${nodeWidth},0 ${nodeWidth},22" fill="${color}" opacity="0.8"/>`,
      `<text x="${nodeWidth - 8}" y="12" text-anchor="middle" font-size="8" fill="white" font-weight="bold">${escapeXml((overlay.badge ?? "•").slice(0, 1))}</text>`,
    ].join("\n");
  }

  if (overlay.shape === "muted") {
    return [`<rect width="${nodeWidth}" height="${nodeHeight}" rx="4" ry="4" fill="white" opacity="0.12"/>`].join("\n");
  }

  return buildOverlayBadge(overlay, nodeWidth);
}

/** Builds a small badge overlay indicator in the top-right corner of a node. */
function buildOverlayBadge(overlay: RenderOverlay, nodeWidth: number): string {
  const color = resolveOverlayColor(overlay.kind);
  const ariaLabel =
    overlay.severity != null ? `${overlay.kind} ${overlay.severity} indicator` : `${overlay.kind} indicator`;
  // Badge text is capped at 2 characters to fit inside the 8px-radius circle badge.
  const text = overlay.badge != null ? escapeXml(overlay.badge.slice(0, 2)) : "●";
  const bx = nodeWidth - 10;
  return [
    `<g class="dfv-overlay dfv-overlay-${escapeXmlAttr(overlay.kind)}" aria-label="${escapeXmlAttr(ariaLabel)}">`,
    `  <circle cx="${bx}" cy="0" r="8" fill="${color}" stroke="white" stroke-width="1"/>`,
    `  <text x="${bx}" y="4" text-anchor="middle" font-size="8" fill="white" font-weight="bold">${text}</text>`,
    "</g>",
  ].join("\n");
}

function resolveOverlayColor(kind: string): string {
  const badgeColors: Record<string, string> = {
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    success: "#10b981",
  };
  return badgeColors[kind] ?? "#6b7280";
}

function isRenderOverlayShape(value: unknown): value is RenderOverlayShape {
  return value === "badge" || value === "marker" || value === "halo" || value === "muted";
}

/**
 * Renders only a specific layer of the graph.
 * Milestone 4: groups and overlays are now implemented.
 */
export function renderLayer(
  layer: RenderLayer,
  state: GraphState,
  layout: LayoutResult,
  options: RenderLayerOptions
): string {
  switch (layer) {
    case "edges":
      return renderEdgesLayer(state, layout, options);
    case "nodes":
      return renderNodesLayer(state, layout, options);
    case "groups":
      return renderGroupsLayer(state, layout, options);
    case "overlays":
      // Overlay rendering is handled via buildRenderFrame + buildFrameMarkup in the backend.
      // renderLayer is a state-only path and doesn't carry overlay state — return empty.
      return "";
    case "labels":
      // Floating label decorations are embedded in node/edge elements.
      return "";
    case "selection":
      // Selection highlight rings are a browser-side interaction concern.
      return "";
  }
}

/**
 * Renders the inner SVG content (nodes and edges) using layout positions.
 * Returns an HTML string of `<g>` elements to be placed inside an SVG viewport group.
 * All user-supplied string values are XML-escaped before insertion.
 * All positional values are derived from integer arithmetic only.
 * Milestone 4: nodes use style tokens and include ARIA labels.
 */
export function renderInnerSvg(
  state: GraphState,
  layout: LayoutResult,
  options: Pick<RenderOptions, "nodeWidth" | "nodeHeight">,
  tokens: Record<string, StyleToken> = defaultStyleTokens
): string {
  const nodeWidth = toSafeInt(options.nodeWidth ?? 120);
  const nodeHeight = toSafeInt(options.nodeHeight ?? 40);

  const edgeElements = Array.from(state.edges.values()).map((edge) => {
    const section = layout.edges.get(edge.id)?.sections[0];
    if (section == null) return "";
    const x1 = toSafeInt(section.startPoint.x);
    const y1 = toSafeInt(section.startPoint.y);
    const x2 = toSafeInt(section.endPoint.x);
    const y2 = toSafeInt(section.endPoint.y);
    const edgeLabel = edge.label != null ? escapeXml(edge.label) : "";
    const midX = toSafeInt((x1 + x2) / 2);
    const midY = toSafeInt((y1 + y2) / 2);
    const labelEl =
      edgeLabel !== ""
        ? `<text x="${midX}" y="${midY}" text-anchor="middle" font-size="10" fill="#6b7280">${edgeLabel}</text>`
        : "";
    return [
      `<g class="dfv-edge" data-edge-id="${escapeXmlAttr(edge.id)}" role="graphics-symbol" aria-label="${edgeLabel !== "" ? escapeXmlAttr(edgeLabel) : "edge"}">`,
      `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"`,
      `        stroke="#9ca3af" stroke-width="1.5" marker-end="url(#dfv-arrow)"/>`,
      labelEl,
      "</g>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const nodeElements = Array.from(state.nodes.values()).map((node) => {
    const pos = layout.nodes.get(node.id);
    if (pos == null) return "";
    const x = toSafeInt(pos.x);
    const y = toSafeInt(pos.y);
    const w = toSafeInt(pos.width);
    const h = toSafeInt(pos.height);
    const style = resolveStyleToken(node.kind, tokens);
    const labelText = escapeXml(node.label);
    const textX = toSafeInt(w / 2);
    const textY = toSafeInt(h / 2 + 5);
    return [
      `<g class="dfv-node" data-node-id="${escapeXmlAttr(node.id)}" data-kind="${escapeXmlAttr(node.kind)}"`,
      `   transform="translate(${x},${y})" role="graphics-symbol" aria-label="${escapeXmlAttr(node.label)}">`,
      `  <rect width="${w}" height="${h}" rx="${style.rx}" ry="${style.rx}"`,
      `        fill="${escapeXmlAttr(style.fill)}"`,
      `        stroke="${escapeXmlAttr(style.stroke)}" stroke-width="${style.strokeWidth}"/>`,
      `  <text x="${textX}" y="${textY}" text-anchor="middle" font-size="12" fill="${escapeXmlAttr(style.textColor)}">${labelText}</text>`,
      "</g>",
    ].join("\n");
  });

  return [...edgeElements, ...nodeElements].filter(Boolean).join("\n");
}

/**
 * Renders the graph state as a complete SVG string using the provided layout.
 * Suitable for static embedding. For interactive use, prefer the host package
 * which manages viewport transforms and event listeners directly.
 * Milestone 4: adds ARIA roles and style token support.
 */
export function renderToSvg(
  state: GraphState,
  layout: LayoutResult,
  options: RenderOptions,
  tokens: Record<string, StyleToken> = defaultStyleTokens
): string {
  const width = toSafeInt(options.width);
  const height = toSafeInt(options.height);
  const inner = renderInnerSvg(state, layout, options, tokens);
  const defs = buildArrowDefs();
  return [
    `<svg xmlns="http://www.w3.org/2000/svg"`,
    ` width="${width}" height="${height}"`,
    ` viewBox="0 0 ${width} ${height}"`,
    ` role="graphics-document" aria-label="Dataflow graph">`,
    defs,
    inner,
    "</svg>",
  ].join("\n");
}

/** Renders only the edge layer. */
function renderEdgesLayer(state: GraphState, layout: LayoutResult, options: RenderLayerOptions): string {
  const elements = Array.from(state.edges.values()).map((edge) => {
    const section = layout.edges.get(edge.id)?.sections[0];
    if (section == null) return "";
    const x1 = toSafeInt(section.startPoint.x);
    const y1 = toSafeInt(section.startPoint.y);
    const x2 = toSafeInt(section.endPoint.x);
    const y2 = toSafeInt(section.endPoint.y);
    const edgeLabel = edge.label != null ? escapeXml(edge.label) : "";
    const midX = toSafeInt((x1 + x2) / 2);
    const midY = toSafeInt((y1 + y2) / 2);
    const labelEl =
      edgeLabel !== ""
        ? `<text x="${midX}" y="${midY}" text-anchor="middle" font-size="10" fill="#6b7280">${edgeLabel}</text>`
        : "";
    return [
      `<g class="dfv-edge" data-edge-id="${escapeXmlAttr(edge.id)}" role="graphics-symbol" aria-label="${edgeLabel !== "" ? escapeXmlAttr(edgeLabel) : "edge"}">`,
      `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"`,
      `        stroke="#9ca3af" stroke-width="1.5" marker-end="url(#dfv-arrow)"/>`,
      labelEl,
      "</g>",
    ]
      .filter(Boolean)
      .join("\n");
  });
  return elements.filter(Boolean).join("\n");
}

/** Renders only the node layer with style tokens and accessibility (Milestone 4). */
function renderNodesLayer(
  state: GraphState,
  layout: LayoutResult,
  options: RenderLayerOptions,
  tokens: Record<string, StyleToken> = defaultStyleTokens
): string {
  const elements = Array.from(state.nodes.values()).map((node) => {
    const pos = layout.nodes.get(node.id);
    if (pos == null) return "";
    const x = toSafeInt(pos.x);
    const y = toSafeInt(pos.y);
    const w = toSafeInt(pos.width ?? options.nodeWidth ?? 120);
    const h = toSafeInt(pos.height ?? options.nodeHeight ?? 40);
    const style = resolveStyleToken(node.kind, tokens);
    const labelText = escapeXml(node.label);
    const textX = toSafeInt(w / 2);
    const textY = toSafeInt(h / 2 + 5);
    return [
      `<g class="dfv-node" data-node-id="${escapeXmlAttr(node.id)}" data-kind="${escapeXmlAttr(node.kind)}"`,
      `   transform="translate(${x},${y})" role="graphics-symbol" aria-label="${escapeXmlAttr(node.label)}">`,
      `  <rect width="${w}" height="${h}" rx="${style.rx}" ry="${style.rx}"`,
      `        fill="${escapeXmlAttr(style.fill)}"`,
      `        stroke="${escapeXmlAttr(style.stroke)}" stroke-width="${style.strokeWidth}"/>`,
      `  <text x="${textX}" y="${textY}" text-anchor="middle" font-size="12" fill="${escapeXmlAttr(style.textColor)}">${labelText}</text>`,
      "</g>",
    ].join("\n");
  });
  return elements.filter(Boolean).join("\n");
}

/** Renders only the groups layer — group hull containers (Milestone 4). */
function renderGroupsLayer(
  state: GraphState,
  layout: LayoutResult,
  options: RenderLayerOptions,
  tokens: Record<string, StyleToken> = defaultStyleTokens
): string {
  const nodeWidth = options.nodeWidth ?? 120;
  const nodeHeight = options.nodeHeight ?? 40;
  const elements = Array.from(state.groups.values()).map((group) => {
    const hull = computeGroupHull(group, layout, nodeWidth, nodeHeight);
    if (hull == null) return "";
    const style = resolveStyleToken(group.kind, tokens);
    const labelText = escapeXml(group.label);
    return [
      `<g class="dfv-group" data-group-id="${escapeXmlAttr(group.id)}" role="graphics-object" aria-label="${escapeXmlAttr(group.label)} group">`,
      `  <rect x="${hull.x}" y="${hull.y}" width="${hull.width}" height="${hull.height}"`,
      `        rx="${style.rx}" ry="${style.rx}"`,
      `        fill="${escapeXmlAttr(style.fill)}" fill-opacity="0.3"`,
      `        stroke="${escapeXmlAttr(style.stroke)}" stroke-width="1" stroke-dasharray="4 3"/>`,
      `  <text x="${hull.x + 8}" y="${hull.y + 14}" font-size="11" fill="${escapeXmlAttr(style.stroke)}" font-weight="500">${labelText}</text>`,
      "</g>",
    ].join("\n");
  });
  return elements.filter(Boolean).join("\n");
}

/** Builds the SVG <defs> block for the arrowhead marker. */
function buildArrowDefs(): string {
  return [
    "<defs>",
    `  <marker id="dfv-arrow" markerWidth="8" markerHeight="8"`,
    `           refX="6" refY="3" orient="auto">`,
    `    <path d="M0,0 L0,6 L8,3 z" fill="#9ca3af"/>`,
    "  </marker>",
    "</defs>",
  ].join("\n");
}

/**
 * Converts a value to a safe non-negative integer.
 * Returns 0 for NaN or non-finite values.
 */
function toSafeInt(value: number): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * Escapes a string for safe embedding as XML text content.
 */
function escapeXml(value: string): string {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Escapes a string for safe embedding as an XML attribute value.
 */
function escapeXmlAttr(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
