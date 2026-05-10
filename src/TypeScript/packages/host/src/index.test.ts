import { describe, expect, it } from "vitest";

import { registerGlobals, version } from "./index";

describe("registerGlobals", () => {
  it("exposes the bundled host version on the global API", () => {
    const windowObject = {} as typeof window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: windowObject,
    });

    registerGlobals();

    expect((windowObject as unknown as Record<string, unknown>).DataflowVisualizer).toMatchObject({
      version,
    });
  });
});
