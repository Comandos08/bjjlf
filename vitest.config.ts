import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

// Standalone Vitest config — keeps unit tests isolated from the
// TanStack Start dev/build pipeline (which uses Cloudflare/SSR plugins
// that aren't compatible with jsdom-based unit tests).
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./tests/unit/setup.ts"],
    css: false,
  },
});
