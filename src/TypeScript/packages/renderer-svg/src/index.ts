/**
 * Renderer-SVG package — SVG renderer for the dataflow graph.
 */

import type { GraphState } from "@dataflow-visualizer/runtime";

export interface RenderOptions {
  readonly width: number;
  readonly height: number;
  readonly nodeWidth?: number;
  readonly nodeHeight?: number;
}

/**
 * Renders the graph state as an SVG string.
 * All user-supplied string values are XML-escaped before insertion.
 * All positional values are derived from integer arithmetic only.
 */
export function renderToSvg(state: GraphState, options: RenderOptions): string {
  const width = toSafeInt(options.width);
  const height = toSafeInt(options.height);
  const nodeWidth = toSafeInt(options.nodeWidth ?? 120);
  const nodeHeight = toSafeInt(options.nodeHeight ?? 40);
  const hPad = 20;
  const cols = 5;

  const nodes = Array.from(state.nodes.values());

  const nodeElements = nodes.map((node, i) => {
    const x = toSafeInt(hPad + (i % cols) * (nodeWidth + hPad));
    const y = toSafeInt(hPad + Math.floor(i / cols) * (nodeHeight + hPad));
    const labelText = escapeXmlAttr(node.label);
    const textX = toSafeInt(nodeWidth / 2);
    const textY = toSafeInt(nodeHeight / 2 + 5);
    return [
      `<g transform="translate(${x},${y})">`,
      `  <rect width="${nodeWidth}" height="${nodeHeight}" rx="4" ry="4"`,
      `        fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>`,
      `  <text x="${textX}" y="${textY}" text-anchor="middle" font-size="12">${labelText}</text>`,
      `</g>`,
    ].join("\n");
  });

  const innerSvg = nodeElements.join("\n");
  return buildSvg(width, height, innerSvg);
}

/** Constructs the outer SVG element with safe numeric dimensions. */
function buildSvg(
  width: number,
  height: number,
  content: string
): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg"`,
    ` width="${width}" height="${height}"`,
    ` viewBox="0 0 ${width} ${height}">`,
    content,
    `</svg>`,
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
 * Escapes a string for safe embedding as XML text content or attribute value.
 */
function escapeXmlAttr(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
