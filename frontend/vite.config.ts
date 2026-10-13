import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  root: ".",
  publicDir: "public",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@views": fileURLToPath(new URL("./src/views", import.meta.url)),
      "@stores": fileURLToPath(new URL("./src/stores", import.meta.url)),
      "@router": fileURLToPath(new URL("./src/router", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      "@types": fileURLToPath(new URL("./src/types", import.meta.url)),
    },
  },
  server: {
    port: 5174,
    host: true,
    strictPort: true,
    proxy: {
      "^/api/.*": {
        target: process.env.VITE_API_URL || "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name]-[hash].js",
        manualChunks: {
          vuex: ["pinia"],
        },
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});