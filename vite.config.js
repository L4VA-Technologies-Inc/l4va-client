import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
import topLevelAwait from 'vite-plugin-top-level-await';


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
    svgr(),
    tailwindcss(),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: "__tla",
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: i => `__tla_${i}`
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
