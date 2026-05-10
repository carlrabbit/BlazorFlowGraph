import { defineConfig } from "vite";
import { resolve } from "path";

const workspaceSourceAliases = {
  "@dataflow-visualizer/protocol": resolve(__dirname, "../protocol/src/index.ts"),
  "@dataflow-visualizer/runtime": resolve(__dirname, "../runtime/src/index.ts"),
  "@dataflow-visualizer/interop": resolve(__dirname, "../interop/src/index.ts"),
  "@dataflow-visualizer/layout": resolve(__dirname, "../layout/src/index.ts"),
  "@dataflow-visualizer/renderer-svg": resolve(__dirname, "../renderer-svg/src/index.ts"),
};

/**
 * Browser bundle build — produces a self-contained IIFE that auto-registers
 * DataflowVisualizer on the window. Suitable for direct <script> inclusion
 * in a Blazor or plain HTML page.
 */
export default defineConfig({
  resolve: {
    alias: workspaceSourceAliases,
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/browser.ts"),
      formats: ["iife"],
      name: "DataflowVisualizerBundle",
      fileName: "browser",
    },
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: true,
    target: "es2022",
  },
});
