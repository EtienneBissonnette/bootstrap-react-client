import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    port: 5173,
    host: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    css: true,
    coverage: {
      reporter: ["html", "text", "json", "lcov"],
      reportsDirectory: "./coverage",
      clean: true,
    },
  },
});
