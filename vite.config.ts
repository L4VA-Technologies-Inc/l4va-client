import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = loadEnv('mock', process.cwd(), '');

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': env.PUBLIC_VITE_API_URL,
    },
  },
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react({
      // Enable TypeScript support
      include: '**/*.{jsx,tsx}',
    }),
    svgr(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
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
