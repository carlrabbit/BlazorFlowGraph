import { describe, expect, it } from "bun:test";
import type { GraphDiff, GraphSnapshot } from "@dataflow-visualizer/protocol";
import { applyDiff, applySnapshot, createEmptyState } from "@dataflow-visualizer/runtime";

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
      protocolVersion: 1,
      fromVersion: 0,
      toVersion: 1,
      nodeOperations: [{ type: "add", node: { id: "n1", label: "Node 1", kind: "default" } }],
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
      protocolVersion: 1,
      fromVersion: 0,
      toVersion: 1,
      nodeOperations: [{ type: "remove", node: { id: "n1", label: "Node 1", kind: "default" } }],
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
      protocolVersion: 1,
      fromVersion: 0,
      toVersion: 1,
      nodeOperations: [{ type: "update", node: { id: "n1", label: "New", kind: "default" } }],
      edgeOperations: [],
    };
    const next = applyDiff(state, diff);
    expect(next.nodes.get("n1")?.label).toBe("New");
  });

  it("throws when diff.fromVersion does not match the current state version", () => {
    const state = applySnapshot({
      version: 3,
      nodes: [{ id: "n1", label: "Old", kind: "default" }],
      edges: [],
    });
    const diff: GraphDiff = {
      protocolVersion: 1,
      fromVersion: 2,
      toVersion: 4,
      nodeOperations: [{ type: "update", node: { id: "n1", label: "New", kind: "default" } }],
      edgeOperations: [],
    };

    expect(() => applyDiff(state, diff)).toThrowError(
      /fromVersion 2 does not match current state version 3/,
    );
  });
});
