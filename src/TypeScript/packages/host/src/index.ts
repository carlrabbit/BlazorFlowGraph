/**
 * Host package — runtime bootstrap for the dataflow visualizer.
 */

import { bridge } from "@dataflow-visualizer/interop";
import { computeLayout } from "@dataflow-visualizer/layout";
import { renderInnerSvg } from "@dataflow-visualizer/renderer-svg";
import type { GraphSnapshot } from "@dataflow-visualizer/protocol";

export type { GraphSnapshot };
export { bridge };

export interface HostOptions {
  /** CSS selector or element id (with #) for the container element. */
  readonly container: string;
  readonly width?: number;
  readonly height?: number;
  readonly nodeWidth?: number;
  readonly nodeHeight?: number;
}

/** Viewport state: pan offsets and zoom scale. */
export interface ViewportState {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

/** Clamps the zoom scale within safe bounds. */
function clampScale(s: number): number {
  return Math.max(0.1, Math.min(10, s));
}

/** Arrow marker definition used for directed edges. */
const ARROW_DEFS = `<defs>
  <marker id="dfv-arrow" markerWidth="8" markerHeight="8"
           refX="6" refY="3" orient="auto">
    <path d="M0,0 L0,6 L8,3 z" fill="#9ca3af"/>
  </marker>
</defs>`;

/**
 * Bootstraps the dataflow visualizer into the specified container.
 * Returns an object exposing viewport controls and an unmount function.
 */
export function mount(options: HostOptions): {
  unmount: () => void;
  fitToScreen: () => void;
  resetViewport: () => void;
  getViewport: () => ViewportState;
} {
  const {
    container,
    width = 800,
    height = 600,
    nodeWidth = 120,
    nodeHeight = 40,
  } = options;

  const elOrNull = document.querySelector(container);
  if (elOrNull == null) {
    throw new Error(`[host] Container element "${container}" not found`);
  }
  const el: Element = elOrNull;

  // Create persistent SVG element
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("xmlns", svgNS);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.style.touchAction = "none";
  svg.style.userSelect = "none";
  svg.innerHTML = ARROW_DEFS;

  // Viewport group — pan/zoom applied here
  const viewportGroup = document.createElementNS(svgNS, "g");
  viewportGroup.setAttribute("class", "dfv-viewport");
  svg.appendChild(viewportGroup);
  el.innerHTML = "";
  el.appendChild(svg);

  let viewport: ViewportState = { x: 0, y: 0, scale: 1 };
  let layoutWidth = 0;
  let layoutHeight = 0;

  function applyViewport(): void {
    viewportGroup.setAttribute(
      "transform",
      `translate(${viewport.x},${viewport.y}) scale(${viewport.scale})`
    );
  }

  function render(): void {
    const state = bridge.getState();
    const snapshot: GraphSnapshot = {
      version: state.version,
      nodes: Array.from(state.nodes.values()),
      edges: Array.from(state.edges.values()),
    };
    const layout = computeLayout(snapshot, { nodeWidth, nodeHeight });
    layoutWidth = layout.width;
    layoutHeight = layout.height;
    viewportGroup.innerHTML = renderInnerSvg(state, layout, {
      nodeWidth,
      nodeHeight,
    });
  }

  const unsubscribe = bridge.subscribe(render);
  render();

  // --- Pan ---
  let isPanning = false;
  let panStart = { x: 0, y: 0 };

  function onPointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;
    isPanning = true;
    panStart = { x: e.clientX - viewport.x, y: e.clientY - viewport.y };
    svg.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent): void {
    if (!isPanning) return;
    viewport = {
      ...viewport,
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    };
    applyViewport();
  }

  function onPointerUp(): void {
    isPanning = false;
  }

  // --- Zoom ---
  function onWheel(e: WheelEvent): void {
    e.preventDefault();
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    const newScale = clampScale(viewport.scale * delta);
    // Zoom towards mouse position
    viewport = {
      x: mouseX - (mouseX - viewport.x) * (newScale / viewport.scale),
      y: mouseY - (mouseY - viewport.y) * (newScale / viewport.scale),
      scale: newScale,
    };
    applyViewport();
  }

  svg.addEventListener("pointerdown", onPointerDown);
  svg.addEventListener("pointermove", onPointerMove);
  svg.addEventListener("pointerup", onPointerUp);
  svg.addEventListener("pointercancel", onPointerUp);
  svg.addEventListener("wheel", onWheel, { passive: false });

  function fitToScreen(): void {
    if (layoutWidth <= 0 || layoutHeight <= 0) return;
    const padding = 20;
    const scaleX = (width - padding * 2) / layoutWidth;
    const scaleY = (height - padding * 2) / layoutHeight;
    const scale = clampScale(Math.min(scaleX, scaleY));
    const x = (width - layoutWidth * scale) / 2;
    const y = (height - layoutHeight * scale) / 2;
    viewport = { x, y, scale };
    applyViewport();
  }

  function resetViewport(): void {
    viewport = { x: 0, y: 0, scale: 1 };
    applyViewport();
  }

  function unmount(): void {
    unsubscribe();
    svg.removeEventListener("pointerdown", onPointerDown);
    svg.removeEventListener("pointermove", onPointerMove);
    svg.removeEventListener("pointerup", onPointerUp);
    svg.removeEventListener("pointercancel", onPointerUp);
    svg.removeEventListener("wheel", onWheel);
    el.innerHTML = "";
  }

  return {
    unmount,
    fitToScreen,
    resetViewport,
    getViewport: () => viewport,
  };
}

/** Exposes the bridge and host API to Blazor via window globals. */
export function registerGlobals(): void {
  const w = window as unknown as Record<string, unknown>;
  const mountedInstances = new Map<
    string,
    ReturnType<typeof mount>
  >();

  w["DataflowVisualizer"] = {
    receiveSnapshot: (snapshot: GraphSnapshot) =>
      bridge.receiveSnapshot(snapshot),
    receiveDiff: bridge.receiveDiff.bind(bridge),
    mount: (opts: HostOptions) => {
      const instance = mount(opts);
      mountedInstances.set(opts.container, instance);
      return instance;
    },
    unmount: (container: string) => {
      mountedInstances.get(container)?.unmount();
      mountedInstances.delete(container);
    },
    fitToScreen: (container: string) => {
      mountedInstances.get(container)?.fitToScreen();
    },
    resetViewport: (container: string) => {
      mountedInstances.get(container)?.resetViewport();
    },
  };
}
