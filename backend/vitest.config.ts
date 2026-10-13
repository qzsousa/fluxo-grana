import { defineConfig } from "vitest/config";
import { config } from "dotenv";

config({ path: ".env.test" });

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    exclude: ["node_modules", "dist"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "c8",
      reporter: ["text", "json", "html"],
    },
  },
});