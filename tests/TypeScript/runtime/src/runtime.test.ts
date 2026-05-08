import { describe, expect, it } from "vitest";
import {
  createEmptyState,
  applySnapshot,
  applyDiff,
} from "@dataflow-visualizer/runtime";
import type { GraphSnapshot, GraphDiff } from "@dataflow-visualizer/protocol";

const emptySnapshot = (version = 0): GraphSnapshot => ({
  version,
  nodes: [],
  edges: [],
});

describe("createEmptyState", () => {
  it("creates state with version 0", () => {
    const state = createEmptyState();
    expect(state.version).toBe(0);
    expect(state.nodes.size).toBe(0);
    expect(state.edges.size).toBe(0);
  });
});

describe("applySnapshot", () => {
  it("indexes nodes by id", () => {
    const snapshot: GraphSnapshot = {
      version: 1,
      nodes: [{ id: "n1", label: "A", kind: "default" }],
      edges: [],
    };
    const state = applySnapshot(snapshot);
    expect(state.version).toBe(1);
    expect(state.nodes.has("n1")).toBe(true);
  });
});

describe("applyDiff", () => {
  it("adds nodes from diff", () => {
    const state = createEmptyState();
    const diff: GraphDiff = {
      fromVersion: 0,
      toVersion: 1,
      nodeOperations: [
        { type: "add", node: { id: "n1", label: "Node 1", kind: "default" } },
      ],
      edgeOperations: [],
    };
    const next = applyDiff(state, diff);
    expect(next.version).toBe(1);
    expect(next.nodes.has("n1")).toBe(true);
  });

  it("removes nodes from diff", () => {
    const state = applySnapshot({
      version: 0,
      nodes: [{ id: "n1", label: "Node 1", kind: "default" }],
      edges: [],
    });
    const diff: GraphDiff = {
      fromVersion: 0,
      toVersion: 1,
      nodeOperations: [
        { type: "remove", node: { id: "n1", label: "Node 1", kind: "default" } },
      ],
      edgeOperations: [],
    };
    const next = applyDiff(state, diff);
    expect(next.nodes.has("n1")).toBe(false);
  });

  it("updates nodes from diff", () => {
    const state = applySnapshot({
      version: 0,
      nodes: [{ id: "n1", label: "Old", kind: "default" }],
      edges: [],
    });
    const diff: GraphDiff = {
      fromVersion: 0,
      toVersion: 1,
      nodeOperations: [
        { type: "update", node: { id: "n1", label: "New", kind: "default" } },
      ],
      edgeOperations: [],
    };
    const next = applyDiff(state, diff);
    expect(next.nodes.get("n1")?.label).toBe("New");
  });
});
