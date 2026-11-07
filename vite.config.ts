import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, /api and /ws are proxied to the API gateway (infra/).
// In production the gateway serves the frontend and the APIs from one origin.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const gateway = env.GATEWAY_URL || 'http://localhost:8080'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': { target: gateway, changeOrigin: true },
        '/ws': { target: gateway.replace(/^http/, 'ws'), ws: true, changeOrigin: true },
      },
    },
  }
})
