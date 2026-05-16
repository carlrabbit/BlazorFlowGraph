import { describe, expect, it, vi } from "vitest";
import { DotNetBridge } from "./index.js";

describe("DotNetBridge reconciliation behavior", () => {
  it("rejects invalid snapshots and preserves the current state", () => {
    const bridge = new DotNetBridge();
    bridge.receiveSnapshot({
      protocolVersion: 1,
      version: 1,
      nodes: [{ id: "n1", label: "A", kind: "default" }],
      edges: [],
    });

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    bridge.receiveSnapshot({
      protocolVersion: 1,
      version: 2,
      nodes: [
        { id: "n1", label: "A", kind: "default" },
        { id: "n1", label: "B", kind: "default" },
      ],
      edges: [],
    });

    const current = bridge.getState();
    expect(current.version).toBe(1);
    expect(current.nodes.size).toBe(1);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("rejects diff version mismatches as a recoverable reconciliation path", () => {
    const bridge = new DotNetBridge();
    bridge.receiveSnapshot({
      protocolVersion: 1,
      version: 1,
      nodes: [{ id: "n1", label: "A", kind: "default" }],
      edges: [],
    });

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    bridge.receiveDiff({
      protocolVersion: 1,
      fromVersion: 0,
      toVersion: 2,
      nodeOperations: [{ type: "update", node: { id: "n1", label: "B", kind: "default" } }],
      edgeOperations: [],
    });

    const current = bridge.getState();
    expect(current.version).toBe(1);
    expect(current.nodes.get("n1")?.label).toBe("A");
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
