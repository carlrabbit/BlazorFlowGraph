/**
 * Renderer-SVG package — SVG renderer for the dataflow graph.
 */

import type { GraphState } from "@dataflow-visualizer/runtime";
import type { LayoutResult } from "@dataflow-visualizer/layout";

export type { LayoutResult };

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
  const nodeWidth = toSafeInt(options.nodeWidth ?? 120);
  const nodeHeight = toSafeInt(options.nodeHeight ?? 40);
  void nodeWidth;
  void nodeHeight;
  const elements = Array.from(state.nodes.values()).map((node) => {
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
