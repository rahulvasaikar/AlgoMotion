import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { algoMotionApiPlugin } from "./server/vite-plugin-api.ts";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    algoMotionApiPlugin(),
  ],
  server: {
    port: 3300,
    open: false,
  },
  define: {
    "process.env": {},
  },
  publicDir: "public",
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
