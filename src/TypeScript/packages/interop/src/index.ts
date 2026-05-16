/**
 * Interop package — .NET / Blazor bridge for the dataflow visualizer.
 */

import { type GraphSnapshot, type GraphDiff, validateGraphSnapshot } from "@dataflow-visualizer/protocol";
import {
  applySnapshot,
  applyDiff,
  createEmptyState,
  GraphRuntimeStore,
  GraphRuntimeEventBus,
} from "@dataflow-visualizer/runtime";
import type { GraphState } from "@dataflow-visualizer/runtime";

export type { GraphSnapshot, GraphDiff, GraphState };
export { GraphRuntimeStore, GraphRuntimeEventBus };

/** Callback invoked when the graph state changes. */
export type StateChangeCallback = (state: GraphState) => void;

/**
 * Bridge between .NET server-side events and the TypeScript runtime.
 * Called by Blazor JS interop to push updates.
 */
export class DotNetBridge {
  private state: GraphState = createEmptyState();
  private readonly listeners: Set<StateChangeCallback> = new Set();

  /** Shared store for all runtime state slices. */
  readonly store: GraphRuntimeStore = new GraphRuntimeStore();

  /** Shared event bus for runtime events. */
  readonly eventBus: GraphRuntimeEventBus = this.store.eventBus;

  /** Receives a full snapshot from the .NET side. */
  receiveSnapshot(snapshot: GraphSnapshot): void {
    const validationErrors = validateGraphSnapshot(snapshot);
    if (validationErrors.length > 0) {
      console.warn(`[interop] rejected invalid snapshot: ${validationErrors.join("; ")}`);
      return;
    }
    this.state = applySnapshot(snapshot);
    this.store.setData(this.state);
    this.notifyListeners();
  }

  /** Receives an incremental diff from the .NET side. */
  receiveDiff(diff: GraphDiff): void {
    if (diff.fromVersion !== this.state.version) {
      console.warn(
        `[interop] diff fromVersion ${diff.fromVersion} does not match current state version ${this.state.version}`
      );
      return;
    }
    this.state = applyDiff(this.state, diff);
    this.store.setData(this.state);
    this.notifyListeners();
  }

  /** Returns the current graph state. */
  getState(): GraphState {
    return this.state;
  }

  /** Subscribes to state changes. */
  subscribe(callback: StateChangeCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

/** Singleton bridge instance, registered on the window for Blazor interop. */
export const bridge = new DotNetBridge();
