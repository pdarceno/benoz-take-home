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
  },
});
