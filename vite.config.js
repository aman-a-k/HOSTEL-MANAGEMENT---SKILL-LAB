import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/register': 'http://localhost:5000',
      '/login': 'http://localhost:5000',
      '/complaint': 'http://localhost:5000',
      '/complaints': 'http://localhost:5000',
      '/leave': 'http://localhost:5000',
      '/leaves': 'http://localhost:5000',
      '/announcement': 'http://localhost:5000',
      '/announcements': 'http://localhost:5000',
      '/stats': 'http://localhost:5000'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
})
