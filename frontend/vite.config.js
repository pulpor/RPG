import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        login: './login.html',
        master: './src/pages/master.html',
        student: './src/pages/student.html',
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    fs: {
      allow: ['..'],
    },
  },
});