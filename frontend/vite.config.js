/**
 * COMMIT: Members 1 & 2 (frontend pair). Shared between both.
 * Your task: Vite config and hot reload. Both contribute to frontend; Dockerfile and .dockerignore are shared.
 */
/*member1 start commit*/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api1': {
        target: 'http://api1:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api1/, ''),
      },
      '/api2': {
        target: 'http://api2:8002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api2/, ''),
      },
    },
    watch: {
      usePolling: true,
    },
  },
})
/*member1 end commit*/