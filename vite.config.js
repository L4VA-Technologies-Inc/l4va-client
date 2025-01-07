import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

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
    react(),
    nodePolyfills({
      globals: {
        process: true,
        Buffer: true,
      },
    }),
  ],
});
