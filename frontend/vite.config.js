import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const slash = "/";
const defaultTarget = `http:${slash}${slash}localhost:9092`;
const target = process.env.VITE_API_TARGET || defaultTarget;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target, changeOrigin: true },
      "/auth": { target, changeOrigin: true },
    },
  },
});
