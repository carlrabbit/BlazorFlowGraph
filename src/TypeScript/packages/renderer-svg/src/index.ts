/**
 * Renderer-SVG package — SVG renderer for the dataflow graph.
 * Milestone 3: adds GraphRendererBackend abstraction and RenderFrame model.
 */

import type { GraphState } from "@dataflow-visualizer/runtime";
import type { LayoutResult } from "@dataflow-visualizer/layout";
import type { VisibleGraph } from "@dataflow-visualizer/runtime";

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
// RenderFrame model (Phase 2)
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
  readonly sections: readonly { readonly startPoint: { x: number; y: number }; readonly endPoint: { x: number; y: number } }[];
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
  /** Total canvas dimensions derived from the layout. */
  readonly canvasWidth: number;
  readonly canvasHeight: number;
}

/**
 * Builds a RenderFrame from a GraphState (or VisibleGraph-filtered subset)
 * and the computed LayoutResult. This is the view projection step.
 */
export function buildRenderFrame(
  state: GraphState,
  layout: LayoutResult,
  options?: { nodeWidth?: number; nodeHeight?: number; visible?: VisibleGraph }
): RenderFrame {
  const nodeWidth = options?.nodeWidth ?? 120;
  const nodeHeight = options?.nodeHeight ?? 40;
  const visible = options?.visible;

  const nodes: RenderNode[] = [];
  for (const node of state.nodes.values()) {
    if (visible != null && !visible.visibleNodeIds.has(node.id)) continue;
    const pos = layout.nodes.get(node.id);
    if (pos == null) continue;
    nodes.push({
      id: node.id,
      label: node.label,
      kind: node.kind,
      x: Math.floor(pos.x),
      y: Math.floor(pos.y),
      width: Math.floor(pos.width ?? nodeWidth),
      height: Math.floor(pos.height ?? nodeHeight),
    });
  }

  const edges: RenderEdge[] = [];
  for (const edge of state.edges.values()) {
    if (visible != null && !visible.visibleEdgeIds.has(edge.id)) continue;
    const layoutEdge = layout.edges.get(edge.id);
    if (layoutEdge == null) continue;
    edges.push({
      id: edge.id,
      label: edge.label,
      sections: layoutEdge.sections,
    });
  }

  return {
    nodes,
    edges,
    canvasWidth: Math.floor(layout.width),
    canvasHeight: Math.floor(layout.height),
  };
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
  `<defs>`,
  `  <marker id="dfv-arrow" markerWidth="8" markerHeight="8"`,
  `           refX="6" refY="3" orient="auto">`,
  `    <path d="M0,0 L0,6 L8,3 z" fill="#9ca3af"/>`,
  `  </marker>`,
  `</defs>`,
].join("\n");

/**
 * SVG-based implementation of GraphRendererBackend.
 * Maintains a persistent SVG element with a viewport group for pan/zoom transforms.
 */
export class SvgRendererBackend implements GraphRendererBackend {
  private svg: SVGSVGElement | null = null;
  private viewportGroup: SVGGElement | null = null;

  initialize(container: Element, width: number, height: number): void {
    const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("width", String(Math.floor(width)));
    svg.setAttribute("height", String(Math.floor(height)));
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
    this.viewportGroup.innerHTML = buildFrameMarkup(frame);
  }

  updateViewport(panX: number, panY: number, scale: number): void {
    this.viewportGroup?.setAttribute(
      "transform",
      `translate(${panX},${panY}) scale(${scale})`
    );
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

/** Builds the inner SVG markup string from a RenderFrame. */
function buildFrameMarkup(frame: RenderFrame): string {
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
    return [`<g class="dfv-edge">`, `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#9ca3af" stroke-width="1.5" marker-end="url(#dfv-arrow)"/>`, labelEl, `</g>`]
      .filter(Boolean)
      .join("\n");
  });

  const nodeElements = frame.nodes.map((node) => {
    const labelText = escapeXml(node.label);
    const textX = Math.floor(node.width / 2);
    const textY = Math.floor(node.height / 2 + 5);
    return [
      `<g class="dfv-node" data-node-id="${escapeXmlAttr(node.id)}" transform="translate(${node.x},${node.y})">`,
      `  <rect width="${node.width}" height="${node.height}" rx="4" ry="4" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>`,
      `  <text x="${textX}" y="${textY}" text-anchor="middle" font-size="12">${labelText}</text>`,
      `</g>`,
    ].join("\n");
  });

  return [...edgeElements, ...nodeElements].filter(Boolean).join("\n");
}

/**
 * Renders only a specific layer of the graph.
 * "edges" and "nodes" delegate to the existing inner rendering logic.
 * "groups" and "overlays" are reserved for future implementation.
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
      // TODO: render group hulls/containers
      return "";
    case "labels":
      // TODO: render floating label decorations
      return "";
    case "selection":
      // TODO: render selection highlight rings
      return "";
    case "overlays":
      // TODO: render node/edge overlays
      return "";
  }
}

/**
 * Renders the inner SVG content (nodes and edges) using layout positions.
 * Returns an HTML string of `<g>` elements to be placed inside an SVG viewport group.
 * All user-supplied string values are XML-escaped before insertion.
 * All positional values are derived from integer arithmetic only.
 */
export function renderInnerSvg(
  state: GraphState,
  layout: LayoutResult,
  options: Pick<RenderOptions, "nodeWidth" | "nodeHeight">
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
      `<g class="dfv-edge">`,
      `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"`,
      `        stroke="#9ca3af" stroke-width="1.5" marker-end="url(#dfv-arrow)"/>`,
      labelEl,
      `</g>`,
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
    const labelText = escapeXml(node.label);
    const textX = toSafeInt(w / 2);
    const textY = toSafeInt(h / 2 + 5);
    return [
      `<g class="dfv-node" data-node-id="${escapeXmlAttr(node.id)}" transform="translate(${x},${y})">`,
      `  <rect width="${w}" height="${h}" rx="4" ry="4"`,
      `        fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>`,
      `  <text x="${textX}" y="${textY}" text-anchor="middle" font-size="12">${labelText}</text>`,
      `</g>`,
    ].join("\n");
  });

  return [...edgeElements, ...nodeElements].filter(Boolean).join("\n");
}

/**
 * Renders the graph state as a complete SVG string using the provided layout.
 * Suitable for static embedding. For interactive use, prefer the host package
 * which manages viewport transforms and event listeners directly.
 */
export function renderToSvg(
  state: GraphState,
  layout: LayoutResult,
  options: RenderOptions
): string {
  const width = toSafeInt(options.width);
  const height = toSafeInt(options.height);
  const inner = renderInnerSvg(state, layout, options);
  const defs = buildArrowDefs();
  return [
    `<svg xmlns="http://www.w3.org/2000/svg"`,
    ` width="${width}" height="${height}"`,
    ` viewBox="0 0 ${width} ${height}">`,
    defs,
    inner,
    `</svg>`,
  ].join("\n");
}

/** Renders only the edge layer. */
function renderEdgesLayer(
  state: GraphState,
  layout: LayoutResult,
  options: RenderLayerOptions
): string {
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
      `<g class="dfv-edge">`,
      `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"`,
      `        stroke="#9ca3af" stroke-width="1.5" marker-end="url(#dfv-arrow)"/>`,
      labelEl,
      `</g>`,
    ]
      .filter(Boolean)
      .join("\n");
  });
  return elements.filter(Boolean).join("\n");
}

/** Renders only the node layer. */
function renderNodesLayer(
  state: GraphState,
  layout: LayoutResult,
  options: RenderLayerOptions
): string {
  const elements = Array.from(state.nodes.values()).map((node) => {
    const pos = layout.nodes.get(node.id);
    if (pos == null) return "";
    const x = toSafeInt(pos.x);
    const y = toSafeInt(pos.y);
    const w = toSafeInt(pos.width ?? options.nodeWidth ?? 120);
    const h = toSafeInt(pos.height ?? options.nodeHeight ?? 40);
    const labelText = escapeXml(node.label);
    const textX = toSafeInt(w / 2);
    const textY = toSafeInt(h / 2 + 5);
    return [
      `<g class="dfv-node" data-node-id="${escapeXmlAttr(node.id)}" transform="translate(${x},${y})">`,
      `  <rect width="${w}" height="${h}" rx="4" ry="4"`,
      `        fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>`,
      `  <text x="${textX}" y="${textY}" text-anchor="middle" font-size="12">${labelText}</text>`,
      `</g>`,
    ].join("\n");
  });
  return elements.filter(Boolean).join("\n");
}

/** Builds the SVG <defs> block for the arrowhead marker. */
function buildArrowDefs(): string {
  return [
    `<defs>`,
    `  <marker id="dfv-arrow" markerWidth="8" markerHeight="8"`,
    `           refX="6" refY="3" orient="auto">`,
    `    <path d="M0,0 L0,6 L8,3 z" fill="#9ca3af"/>`,
    `  </marker>`,
    `</defs>`,
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
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
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
