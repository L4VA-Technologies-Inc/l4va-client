import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

const env = loadEnv(
  'mock',
  process.cwd(),
  '',
);

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': env.PUBLIC_VITE_API_URL,
    },
  },
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
    svgr(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext', // enables top-level await in deps like lucid
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
});
