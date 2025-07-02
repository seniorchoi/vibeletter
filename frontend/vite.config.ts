// File: vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // any request to /api/foo → http://localhost:8000/api/foo
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        // if your Python app mounts at /api, you don’t need rewrite
        // but if it mounts directly at /, you could rewrite:
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
});
