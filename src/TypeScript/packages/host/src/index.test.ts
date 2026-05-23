import { describe, expect, it } from "vitest";

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

      expect((windowObject as unknown as Record<string, unknown>).DataflowVisualizer).toMatchObject({
        version,
      });
    } finally {
      if (originalWindowDescriptor == null) {
        (globalThis as { window?: typeof window }).window = undefined;
      } else {
        Object.defineProperty(globalThis, "window", originalWindowDescriptor);
      }
    }
  });
});
