/// <reference types="bun-types" />
import { describe, expect, it } from "bun:test";
import { getBuiltInFlowGraphThemes } from "@dataflow-visualizer/renderer-svg";

import { registerGlobals, renderSnapshotToSvg, version } from "./index";

describe("registerGlobals", () => {
  it("exposes the bundled host version on the global API", () => {
    const originalWindowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
    const windowObject = {} as typeof window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: windowObject,
    });

    try {
      registerGlobals();

      expect((windowObject as unknown as Record<string, unknown>).DataflowVisualizer).toMatchObject(
        {
          version,
          renderSnapshotToSvg: expect.any(Function),
          getBuiltInThemes: expect.any(Function),
          importThemeDraftJson: expect.any(Function),
          exportThemeDraftJson: expect.any(Function),
        },
      );
    } finally {
      if (originalWindowDescriptor == null) {
        delete (globalThis as { window?: typeof window }).window;
      } else {
        Object.defineProperty(globalThis, "window", originalWindowDescriptor);
      }
    }
  });
});

describe("renderSnapshotToSvg", () => {
  it("applies path highlighting state for themed rendering", () => {
    const firstTheme = Object.values(getBuiltInFlowGraphThemes())[0];
    expect(firstTheme).toBeDefined();
    const svg = renderSnapshotToSvg(
      {
        version: 1,
        nodes: [
          { id: "a", label: "A", kind: "default" },
          { id: "b", label: "B", kind: "default" },
        ],
        edges: [{ id: "e1", sourceId: "a", targetId: "b" }],
      },
      {
        width: 400,
        height: 200,
        theme: firstTheme!,
        pathHighlight: { mode: "between", sourceNodeId: "a", targetNodeId: "b" },
      },
    );

    expect(svg.includes("dfv-arrow-highlight")).toBe(true);
    expect(svg.includes('data-edge-id="e1"')).toBe(true);
  });
});
