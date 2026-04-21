import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor';
          if (id.includes('/react/') || id.includes('\\react\\')) return 'react-vendor';
          if (id.includes('@react-oauth')) return 'oauth';
          if (id.includes('bootstrap')) return 'bootstrap';
          if (id.includes('aos')) return 'aos';
        },
      },
    },
  },
});
