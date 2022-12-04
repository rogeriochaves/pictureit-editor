import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import { resolve } from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    host: "0.0.0.0",
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.tsx"),
      name: "PictureitEditor",
    },
  },
})
