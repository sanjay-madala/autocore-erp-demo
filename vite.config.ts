import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: false,
    host: "127.0.0.1",
  },
  preview: {
    port: 5175,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor — react + motion + phosphor (task spec)
          if (id.includes("node_modules")) {
            if (
              id.includes("node_modules/react") ||
              id.includes("node_modules/react-dom") ||
              id.includes("node_modules/react/jsx") ||
              id.includes("scheduler")
            )
              return "vendor-react"
            if (id.includes("node_modules/motion") || id.includes("node_modules/framer-motion"))
              return "vendor-motion"
            if (id.includes("node_modules/@phosphor-icons")) return "vendor-icons"
            if (id.includes("node_modules/recharts") || id.includes("node_modules/d3")) return "vendor-charts"
            if (
              id.includes("node_modules/zustand") ||
              id.includes("node_modules/clsx") ||
              id.includes("node_modules/tailwind-merge") ||
              id.includes("node_modules/class-variance-authority") ||
              id.includes("node_modules/date-fns")
            )
              return "vendor-utils"
            return "vendor"
          }
          // Data layer — typed datasets (src/data)
          if (id.includes("/src/data/")) return "data"
          // Features stay as async chunks via React.lazy — no manual chunk
        },
      },
    },
  },
})
