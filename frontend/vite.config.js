// Vite configuration for React app migrated from CRA
// - Keeps output directory as "build" to match Netlify publish path
// - Dev server runs on port 3002 to match previous setup
// - Proxies /api to local backend for dev convenience

const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react").default;

module.exports = defineConfig({
  plugins: [
    react({
      include: [/\.([jt])sx?$/],
      babel: {
        presets: [["@babel/preset-react", { runtime: "automatic" }]],
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
  },
  esbuild: {
    jsx: "automatic",
  },
});
