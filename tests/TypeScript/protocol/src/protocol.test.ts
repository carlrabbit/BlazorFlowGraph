import { describe, expect, it } from "bun:test";
import {
  type GraphDiff,
  type GraphNode,
  type GraphSnapshot,
  validateGraphSnapshot,
} from "@dataflow-visualizer/protocol";

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
      protocolVersion: 1,
      fromVersion: 0,
      toVersion: 1,
      nodeOperations: [],
      edgeOperations: [],
    };

    expect(diff.fromVersion).toBe(0);
    expect(diff.toVersion).toBe(1);
  });

  it("validateGraphSnapshot returns no errors for a valid snapshot", () => {
    const errors = validateGraphSnapshot({
      protocolVersion: 1,
      version: 1,
      nodes: [{ id: "n1", label: "A", kind: "default" }],
      edges: [],
      groups: [{ id: "g1", label: "G", kind: "group", childNodeIds: ["n1"] }],
    });

    expect(errors).toEqual([]);
  });

  it("validateGraphSnapshot catches duplicate IDs, invalid references, and invalid version", () => {
    const errors = validateGraphSnapshot({
      protocolVersion: 999,
      version: -1,
      nodes: [
        { id: "n1", label: "A", kind: "default" },
        { id: "n1", label: "B", kind: "default" },
      ],
      edges: [
        { id: "e1", sourceId: "missing", targetId: "n1" },
        { id: "e1", sourceId: "n1", targetId: "missing2" },
      ],
      groups: [
        { id: "g1", label: "G1", kind: "group", childNodeIds: ["n1", "missing3"] },
        { id: "g1", label: "G2", kind: "group", childNodeIds: [] },
      ],
    });

    expect(errors.some((e) => e.includes("snapshot.version"))).toBe(true);
    expect(errors.some((e) => e.includes("protocolVersion"))).toBe(true);
    expect(errors.some((e) => e.includes("duplicate node id"))).toBe(true);
    expect(errors.some((e) => e.includes("duplicate edge id"))).toBe(true);
    expect(errors.some((e) => e.includes("duplicate group id"))).toBe(true);
    expect(errors.some((e) => e.includes("unknown sourceId"))).toBe(true);
    expect(errors.some((e) => e.includes("unknown targetId"))).toBe(true);
    expect(errors.some((e) => e.includes("unknown childNodeId"))).toBe(true);
  });
});
