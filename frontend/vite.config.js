/**
 * COMMIT: Members 1 & 2 (frontend pair). Shared between both.
 * Your task: Vite config and hot reload. Both contribute to frontend; Dockerfile and .dockerignore are shared.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
})
