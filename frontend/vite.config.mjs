import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "react",
      babel: {
        presets: [
          [
            "@babel/preset-react",
            {
              runtime: "automatic",
            },
          ],
        ],
      },
    }),
  ],
  server: {
    port: 3002,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "build",
    sourcemap: false,
    rollupOptions: {},
  },
  esbuild: {
    jsx: "automatic",
  },
});
