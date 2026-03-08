import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nexura_static/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-v8.js`,
        chunkFileNames: `assets/[name]-v8.js`,
        assetFileNames: `assets/[name]-v8.[ext]`
      }
    }
  }
})
