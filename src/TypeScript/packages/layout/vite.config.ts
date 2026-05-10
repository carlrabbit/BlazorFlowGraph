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
      // elkjs is a dynamic import inside ElkLayoutProvider and is intentionally
      // not listed as an external — consumers bundle it alongside the provider
      // only when they instantiate ElkLayoutProvider.
      external: ["@dataflow-visualizer/protocol"],
    },
    emptyOutDir: false,
    sourcemap: true,
    target: "es2022",
  },
});
