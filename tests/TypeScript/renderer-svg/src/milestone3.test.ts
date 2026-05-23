/**
 * Milestone 3 — tests for new renderer-svg abstractions:
 * RenderFrame, buildRenderFrame, GraphRendererBackend interface.
 */

import { computeLayout } from "@dataflow-visualizer/layout";
import {
  type GraphRendererBackend,
  type RenderEdge,
  type RenderFrame,
  type RenderNode,
  buildRenderFrame,
} from "@dataflow-visualizer/renderer-svg";
import { applySnapshot } from "@dataflow-visualizer/runtime";
import type { VisibleGraph } from "@dataflow-visualizer/runtime";
import { describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// buildRenderFrame
// ---------------------------------------------------------------------------

describe("buildRenderFrame", () => {
  it("builds a frame with correct node positions", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [{ id: "n1", label: "Node A", kind: "default" }],
      edges: [],
    });
    const snapshot = { version: 1, nodes: [{ id: "n1", label: "Node A", kind: "default" }], edges: [] };
    const layout = computeLayout(snapshot);
    const frame: RenderFrame = buildRenderFrame(state, layout);
    expect(frame.nodes.length).toBe(1);
    const node = frame.nodes[0] as RenderNode;
    expect(node.id).toBe("n1");
    expect(node.label).toBe("Node A");
    expect(node.x).toBeGreaterThanOrEqual(0);
    expect(node.y).toBeGreaterThanOrEqual(0);
  });

  it("builds a frame with edges", () => {
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
    const frame = buildRenderFrame(state, layout);
    expect(frame.edges.length).toBe(1);
    const edge = frame.edges[0] as RenderEdge;
    expect(edge.id).toBe("e1");
    expect(edge.sections.length).toBeGreaterThan(0);
  });

  it("reports canvas dimensions from layout", () => {
    const state = applySnapshot({ version: 0, nodes: [], edges: [] });
    const layout = computeLayout({ version: 0, nodes: [], edges: [] });
    const frame = buildRenderFrame(state, layout);
    expect(frame.canvasWidth).toBeGreaterThanOrEqual(0);
    expect(frame.canvasHeight).toBeGreaterThanOrEqual(0);
  });

  it("filters nodes by VisibleGraph", () => {
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
    const visible: VisibleGraph = {
      visibleNodeIds: new Set(["n1"]),
      visibleEdgeIds: new Set(),
      visibleGroupIds: new Set(),
    };
    const frame = buildRenderFrame(state, layout, { visible });
    const nodeIds = frame.nodes.map((n) => n.id);
    expect(nodeIds).toContain("n1");
    expect(nodeIds).not.toContain("n2");
    expect(frame.edges.length).toBe(0);
  });

  it("filters edges by VisibleGraph", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [
        { id: "n1", label: "A", kind: "default" },
        { id: "n2", label: "B", kind: "default" },
        { id: "n3", label: "C", kind: "default" },
      ],
      edges: [
        { id: "e1", sourceId: "n1", targetId: "n2" },
        { id: "e2", sourceId: "n2", targetId: "n3" },
      ],
    });
    const snapshot = {
      version: 1,
      nodes: [
        { id: "n1", label: "A", kind: "default" },
        { id: "n2", label: "B", kind: "default" },
        { id: "n3", label: "C", kind: "default" },
      ],
      edges: [
        { id: "e1", sourceId: "n1", targetId: "n2" },
        { id: "e2", sourceId: "n2", targetId: "n3" },
      ],
    };
    const layout = computeLayout(snapshot);
    const visible: VisibleGraph = {
      visibleNodeIds: new Set(["n1", "n2", "n3"]),
      visibleEdgeIds: new Set(["e1"]),
      visibleGroupIds: new Set(),
    };
    const frame = buildRenderFrame(state, layout, { visible });
    const edgeIds = frame.edges.map((e) => e.id);
    expect(edgeIds).toContain("e1");
    expect(edgeIds).not.toContain("e2");
  });

  it("returns integer node positions (floors values)", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [{ id: "n1", label: "A", kind: "default" }],
      edges: [],
    });
    const snapshot = { version: 1, nodes: [{ id: "n1", label: "A", kind: "default" }], edges: [] };
    const layout = computeLayout(snapshot);
    const frame = buildRenderFrame(state, layout);
    const node = frame.nodes[0];
    if (node != null) {
      expect(Number.isInteger(node.x)).toBe(true);
      expect(Number.isInteger(node.y)).toBe(true);
      expect(Number.isInteger(node.width)).toBe(true);
      expect(Number.isInteger(node.height)).toBe(true);
    }
  });

  it("preserves edge label when present", () => {
    const state = applySnapshot({
      version: 1,
      nodes: [
        { id: "n1", label: "A", kind: "default" },
        { id: "n2", label: "B", kind: "default" },
      ],
      edges: [{ id: "e1", sourceId: "n1", targetId: "n2", label: "edge-label" }],
    });
    const snapshot = {
      version: 1,
      nodes: [
        { id: "n1", label: "A", kind: "default" },
        { id: "n2", label: "B", kind: "default" },
      ],
      edges: [{ id: "e1", sourceId: "n1", targetId: "n2", label: "edge-label" }],
    };
    const layout = computeLayout(snapshot);
    const frame = buildRenderFrame(state, layout);
    expect(frame.edges[0]?.label).toBe("edge-label");
  });
});

describe("GraphRendererBackend lifecycle contract", () => {
  it("supports initialize, repeated renderFrame, viewport updates, resize, and dispose", () => {
    const calls: string[] = [];
    const backend: GraphRendererBackend = {
      initialize: () => {
        calls.push("initialize");
      },
      renderFrame: () => {
        calls.push("renderFrame");
      },
      updateViewport: () => {
        calls.push("updateViewport");
      },
      resize: () => {
        calls.push("resize");
      },
      dispose: () => {
        calls.push("dispose");
      },
    };

    const frame: RenderFrame = {
      nodes: [],
      edges: [],
      groups: [],
      overlays: [],
      canvasWidth: 0,
      canvasHeight: 0,
    };

    backend.initialize({} as Element, 800, 600);
    backend.renderFrame(frame);
    backend.renderFrame(frame);
    backend.updateViewport(10, 20, 1.25);
    backend.resize(1024, 768);
    backend.dispose();

    expect(calls).toEqual(["initialize", "renderFrame", "renderFrame", "updateViewport", "resize", "dispose"]);
  });
});
