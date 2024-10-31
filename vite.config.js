import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(),react()],
  build: {
    chunkSizeWarningLimit: 2000, // handle warning on vendor.js bundle size
  },
  base: "/",
});
