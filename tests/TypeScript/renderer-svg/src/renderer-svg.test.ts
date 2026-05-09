import { describe, expect, it } from "vitest";
import { renderToSvg } from "@dataflow-visualizer/renderer-svg";
import { applySnapshot } from "@dataflow-visualizer/runtime";
import { computeLayout } from "@dataflow-visualizer/layout";

describe("renderToSvg", () => {
  it("returns an SVG string", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [{ id: "n1", label: "Node A", kind: "default" }],
      edges: [],
    });
    const snapshot = { version: 1, nodes: [{ id: "n1", label: "Node A", kind: "default" }], edges: [] };
    const layout = computeLayout(snapshot);
    const svg = renderToSvg(state, layout, { width: 800, height: 600 });
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("contains node labels", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [{ id: "n1", label: "MyLabel", kind: "default" }],
      edges: [],
    });
    const snapshot = { version: 1, nodes: [{ id: "n1", label: "MyLabel", kind: "default" }], edges: [] };
    const layout = computeLayout(snapshot);
    const svg = renderToSvg(state, layout, { width: 800, height: 600 });
    expect(svg).toContain("MyLabel");
  });

  it("escapes XML special characters in labels", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [{ id: "n1", label: "<dangerous>", kind: "default" }],
      edges: [],
    });
    const snapshot = { version: 1, nodes: [{ id: "n1", label: "<dangerous>", kind: "default" }], edges: [] };
    const layout = computeLayout(snapshot);
    const svg = renderToSvg(state, layout, { width: 800, height: 600 });
    expect(svg).not.toContain("<dangerous>");
    expect(svg).toContain("&lt;dangerous&gt;");
  });

  it("renders empty graph without error", () => {
    const state = applySnapshot({ version: 0, nodes: [], edges: [] });
    const layout = computeLayout({ version: 0, nodes: [], edges: [] });
    const svg = renderToSvg(state, layout, { width: 400, height: 300 });
    expect(svg).toContain("<svg");
  });

  it("renders edges as lines", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [
        { id: "n1", label: "A", kind: "default" },
        { id: "n2", label: "B", kind: "default" },
      ],
      edges: [{ id: "e1", sourceId: "n1", targetId: "n2" }],
    });
    const snapshot = {
      version: 1,
      nodes: [
        { id: "n1", label: "A", kind: "default" },
        { id: "n2", label: "B", kind: "default" },
      ],
      edges: [{ id: "e1", sourceId: "n1", targetId: "n2" }],
    };
    const layout = computeLayout(snapshot);
    const svg = renderToSvg(state, layout, { width: 800, height: 600 });
    expect(svg).toContain("<line");
  });
});
