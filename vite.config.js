import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      input: 'src/index.html'
    }
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
