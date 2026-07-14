import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: true,
    // Convenience proxy: lets the frontend call '/api/...' during development
    // without CORS. The app uses the full backend URL by default (see
    // src/api/client.js), so this is an optional fallback.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
