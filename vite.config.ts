import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1/orders': 'http://localhost:5002',
      '/api': 'http://localhost:8080'
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
