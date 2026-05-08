import { describe, expect, it } from "vitest";
import type { GraphSnapshot, GraphDiff, GraphNode } from "@dataflow-visualizer/protocol";

describe("protocol types", () => {
  it("GraphSnapshot holds nodes and edges", () => {
    const node: GraphNode = { id: "n1", label: "Node 1", kind: "default" };
    const snapshot: GraphSnapshot = { version: 1, nodes: [node], edges: [] };

    expect(snapshot.version).toBe(1);
    expect(snapshot.nodes).toHaveLength(1);
    expect(snapshot.edges).toHaveLength(0);
  });

  it("GraphDiff holds operations", () => {
    const diff: GraphDiff = {
      fromVersion: 0,
      toVersion: 1,
      nodeOperations: [],
      edgeOperations: [],
    };

    expect(diff.fromVersion).toBe(0);
    expect(diff.toVersion).toBe(1);
  });
});
