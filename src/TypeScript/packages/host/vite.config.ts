import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "@dataflow-visualizer/interop",
        "@dataflow-visualizer/layout",
        "@dataflow-visualizer/protocol",
        "@dataflow-visualizer/renderer-svg",
        "@dataflow-visualizer/runtime",
      ],
    },
    sourcemap: true,
    target: "es2022",
  },
});
