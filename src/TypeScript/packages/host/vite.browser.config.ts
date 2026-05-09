import { defineConfig } from "vite";
import { resolve } from "path";

/**
 * Browser bundle build — produces a self-contained IIFE that auto-registers
 * DataflowVisualizer on the window. Suitable for direct <script> inclusion
 * in a Blazor or plain HTML page.
 */
export default defineConfig({
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
