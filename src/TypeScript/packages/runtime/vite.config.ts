import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: ["@dataflow-visualizer/protocol"],
    },
    emptyOutDir: false,
    sourcemap: true,
    target: "es2022",
  },
});
