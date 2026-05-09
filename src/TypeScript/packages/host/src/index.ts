/**
 * Host package — runtime bootstrap for the dataflow visualizer.
 */

import { bridge } from "@dataflow-visualizer/interop";
import { computeLayout } from "@dataflow-visualizer/layout";
import { renderToSvg } from "@dataflow-visualizer/renderer-svg";
import { applySnapshot } from "@dataflow-visualizer/runtime";
import type { GraphSnapshot } from "@dataflow-visualizer/protocol";

export type { GraphSnapshot };
export { bridge };

export interface HostOptions {
  /** CSS selector for the container element. */
  readonly container: string;
  readonly width?: number;
  readonly height?: number;
}

/**
 * Bootstraps the dataflow visualizer into the specified container.
 */
export function mount(options: HostOptions): () => void {
  const { container, width = 800, height = 600 } = options;

  const el = document.querySelector(container);
  if (el == null) {
    throw new Error(`[host] Container element "${container}" not found`);
  }

  const render = (): void => {
    const state = bridge.getState();
    const snapshot: GraphSnapshot = {
      version: state.version,
      nodes: Array.from(state.nodes.values()),
      edges: Array.from(state.edges.values()),
    };

    computeLayout(snapshot);
    el.innerHTML = renderToSvg(state, { width, height });
  };

  const unsubscribe = bridge.subscribe(render);
  render();

  return unsubscribe;
}

/** Exposes the bridge to Blazor via window globals. */
export function registerGlobals(): void {
  const w = window as unknown as Record<string, unknown>;
  w["DataflowVisualizer"] = {
    receiveSnapshot: (snapshot: GraphSnapshot) =>
      bridge.receiveSnapshot(snapshot),
    receiveDiff: bridge.receiveDiff.bind(bridge),
    mount,
  };
}
