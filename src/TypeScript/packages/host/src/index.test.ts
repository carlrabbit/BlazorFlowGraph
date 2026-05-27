/// <reference types="bun-types" />
import { describe, expect, it } from "bun:test";

import { registerGlobals, version } from "./index";

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
