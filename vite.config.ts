import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev: the games platform server (Platform/gamesplatform) runs on :3001.
// Production builds talk to VITE_API_BASE directly (see .env.example).
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/files": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: ["es2022", "chrome105", "safari15"],
    sourcemap: false,
  },
});
