import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  root: "app",
  publicDir: resolve(__dirname, "public"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@lib": resolve(__dirname, "lib"),
      "@definitions": resolve(__dirname, "definitions"),
    },
  },
  build: {
    outDir: resolve(__dirname, "app/dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/dompurify")) return "dompurify";
          if (
            id.includes("validation/ValidationDemo") ||
            id.includes("validation/demoFixtures")
          ) {
            return "validation-demo";
          }
          if (
            id.includes("EventStackSection") ||
            id.includes("part-5-event-stack")
          ) {
            return "event-stack";
          }
        },
      },
    },
  },
});
