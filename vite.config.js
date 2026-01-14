import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false
  },
  server: {
    port: 5173,
    open: true,
    hmr: true
  },
  preview: {
    port: 4173
  },
  optimizeDeps: {
    include: []
  }
})
