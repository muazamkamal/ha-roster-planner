import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// One self-contained ES module: React, date-fns and CSS are all bundled in.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: { "process.env.NODE_ENV": JSON.stringify(mode) },
  build: {
    outDir: "../custom_components/roster_planner/frontend",
    emptyOutDir: true,
    target: "es2022",
    lib: {
      entry: "src/main.tsx",
      formats: ["es"],
      fileName: () => "roster-planner-panel.js",
    },
  },
  test: { include: ["src/**/*.test.ts"] },
}));
