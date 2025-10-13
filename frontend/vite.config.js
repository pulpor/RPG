import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        login: './index.html',
        master: './src/pages/master.html',
        student: './src/pages/student.html',
      },
    },
    // Otimizações de build
    minify: 'esbuild',
    target: 'esnext',
    cssCodeSplit: true,
  },
  server: {
    port: 5173,
    open: true,
    fs: {
      allow: ['..'],
    },
    // Otimizações para recarregamento mais rápido
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: false, // Desabilita polling para melhor performance
      interval: 100, // Intervalo mínimo de verificação
    },
  },
  // CSS Processing
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true,
  },
  // Otimizações de dependências
  optimizeDeps: {
    include: ['toastify-js'],
    exclude: [],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  // Cache de dependências para builds mais rápidos
  cacheDir: '.vite',
  // Configurações do esbuild
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'esnext',
  },
});