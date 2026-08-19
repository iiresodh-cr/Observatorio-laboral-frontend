import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'firebase';
            }
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'mui';
            }
            if (id.includes('@tiptap')) {
              return 'tiptap';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts';
            }
            if (id.includes('react-router') || id.includes('react-dom') || (id.includes('react') && !id.includes('react-markdown') && !id.includes('react-is'))) {
              return 'react-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
