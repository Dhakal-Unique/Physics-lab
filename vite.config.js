import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'charts'
          if (id.includes('react-router')) return 'router'
          if (id.includes('react-dom') || (id.includes('node_modules/react/') && !id.includes('react-router'))) return 'vendor'
        },
      },
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
