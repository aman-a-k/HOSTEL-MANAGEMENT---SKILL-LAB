import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/register': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/login': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/complaint': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/complaints': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/leave': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/leaves': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/announcement': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/announcements': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/stats': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser'
  }
})
