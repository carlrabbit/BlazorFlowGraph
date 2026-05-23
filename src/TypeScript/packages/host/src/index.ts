/**
 * Host package — runtime bootstrap for the dataflow visualizer.
 */

import { bridge } from "@dataflow-visualizer/interop";
import { computeLayout } from "@dataflow-visualizer/layout";
import type { GraphSnapshot } from "@dataflow-visualizer/protocol";
import { renderInnerSvg } from "@dataflow-visualizer/renderer-svg";

declare const __BLAZORFLOWGRAPH_VERSION__: string;

export type { GraphSnapshot };
export { bridge };
export const version = typeof __BLAZORFLOWGRAPH_VERSION__ === "undefined" ? "0.0.0-dev" : __BLAZORFLOWGRAPH_VERSION__;

export interface HostOptions {
  /** CSS selector or element id (with #) for the container element. */
  readonly container: string;
  readonly width?: number;
  readonly height?: number;
  readonly nodeWidth?: number;
  readonly nodeHeight?: number;
  /** Optional .NET object reference used for semantic inspection callbacks. */
  readonly inspectionTarget?: {
    invokeMethodAsync(method: string, payload: unknown): Promise<unknown>;
  };
  /** Method name invoked on the inspection target (defaults to "HandleInspection"). */
  readonly inspectionMethodName?: string;
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

/** Zoom step multiplier applied per wheel tick (10% increase/decrease). */
const ZOOM_FACTOR = 1.1;

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
    inspectionTarget,
    inspectionMethodName = "HandleInspection",
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
    viewportGroup.setAttribute("transform", `translate(${viewport.x},${viewport.y}) scale(${viewport.scale})`);
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

  function emitInspection(payload: {
    targetType: "node" | "edge" | "group" | "selection" | "overlay";
    targetIds: string[];
    label?: string;
    kind?: string;
    topologyScope?: string;
  }): void {
    inspectionTarget?.invokeMethodAsync(inspectionMethodName, payload).catch(() => {
      // Inspection callback errors should never break rendering.
    });
  }

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
    const delta = e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    const newScale = clampScale(viewport.scale * delta);
    // Zoom towards mouse position
    viewport = {
      x: mouseX - (mouseX - viewport.x) * (newScale / viewport.scale),
      y: mouseY - (mouseY - viewport.y) * (newScale / viewport.scale),
      scale: newScale,
    };
    applyViewport();
  }

  function onClick(e: MouseEvent): void {
    const target = e.target as Element | null;
    if (target == null) return;

    const nodeEl = target.closest("[data-node-id]");
    if (nodeEl != null) {
      const nodeId = nodeEl.getAttribute("data-node-id");
      if (nodeId != null) {
        emitInspection({
          targetType: "node",
          targetIds: [nodeId],
          ...(nodeEl.getAttribute("aria-label") != null ? { label: nodeEl.getAttribute("aria-label") ?? "" } : {}),
          ...(nodeEl.getAttribute("data-kind") != null ? { kind: nodeEl.getAttribute("data-kind") ?? "" } : {}),
          topologyScope: "node",
        });
      }
      return;
    }

    const edgeEl = target.closest("[data-edge-id]");
    if (edgeEl != null) {
      const edgeId = edgeEl.getAttribute("data-edge-id");
      if (edgeId != null) {
        emitInspection({
          targetType: "edge",
          targetIds: [edgeId],
          ...(edgeEl.getAttribute("aria-label") != null ? { label: edgeEl.getAttribute("aria-label") ?? "" } : {}),
          topologyScope: "edge",
        });
      }
      return;
    }

    const groupEl = target.closest("[data-group-id]");
    if (groupEl != null) {
      const groupId = groupEl.getAttribute("data-group-id");
      if (groupId != null) {
        emitInspection({
          targetType: "group",
          targetIds: [groupId],
          ...(groupEl.getAttribute("aria-label") != null ? { label: groupEl.getAttribute("aria-label") ?? "" } : {}),
          topologyScope: "group",
        });
      }
    }
  }

  svg.addEventListener("pointerdown", onPointerDown);
  svg.addEventListener("pointermove", onPointerMove);
  svg.addEventListener("pointerup", onPointerUp);
  svg.addEventListener("pointercancel", onPointerUp);
  svg.addEventListener("wheel", onWheel, { passive: false });
  svg.addEventListener("click", onClick);

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
    svg.removeEventListener("click", onClick);
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
  const mountedInstances = new Map<string, ReturnType<typeof mount>>();

  w.DataflowVisualizer = {
    version,
    receiveSnapshot: (snapshot: GraphSnapshot) => bridge.receiveSnapshot(snapshot),
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
