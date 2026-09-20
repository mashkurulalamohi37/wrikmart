import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/eps-sandbox': {
        target: 'https://sandboxpgapi.eps.com.bd',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/eps-sandbox/, '')
      },
      '/api/eps': {
        target: 'https://pgapi.eps.com.bd',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/eps/, '')
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react']
        }
      }
    }
  }
})
