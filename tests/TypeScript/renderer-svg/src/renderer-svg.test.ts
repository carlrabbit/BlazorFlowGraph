import { describe, expect, it } from "vitest";
import { renderToSvg } from "@dataflow-visualizer/renderer-svg";
import { applySnapshot } from "@dataflow-visualizer/runtime";

describe("renderToSvg", () => {
  it("returns an SVG string", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [{ id: "n1", label: "Node A", kind: "default" }],
      edges: [],
    });
    const svg = renderToSvg(state, { width: 800, height: 600 });
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("contains node labels", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [{ id: "n1", label: "MyLabel", kind: "default" }],
      edges: [],
    });
    const svg = renderToSvg(state, { width: 800, height: 600 });
    expect(svg).toContain("MyLabel");
  });

  it("escapes XML special characters in labels", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [{ id: "n1", label: "<dangerous>", kind: "default" }],
      edges: [],
    });
    const svg = renderToSvg(state, { width: 800, height: 600 });
    expect(svg).not.toContain("<dangerous>");
    expect(svg).toContain("&lt;dangerous&gt;");
  });

  it("renders empty graph without error", () => {
    const state = applySnapshot({ version: 0, nodes: [], edges: [] });
    const svg = renderToSvg(state, { width: 400, height: 300 });
    expect(svg).toContain("<svg");
  });
});
