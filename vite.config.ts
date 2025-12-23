import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
 import { cloudflare } from "@cloudflare/vite-plugin";
import fs from "fs";

// Custom plugin to remove _redirects
const removeRedirectsPlugin = () => ({
  name: "remove-redirects",
  closeBundle() {
    const redirectsPath = path.resolve(__dirname, "dist", "_redirects");
    if (fs.existsSync(redirectsPath)) {
      fs.unlinkSync(redirectsPath);
    }
  },
});

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    TanStackRouterVite(),
    cloudflare(),
    removeRedirectsPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
