import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// https://vite.dev/config/
// `vite --mode mainnet` layers .env.mainnet over .env (local Robinhood-mainnet stack).
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (command === 'build') {
    // Without these the app silently runs on the public, rate-limited Robinhood RPC.
    const testnet = String(env.VITE_ROBINHOOD_NETWORK || '').toLowerCase() === 'testnet';
    const required = ['VITE_ROBINHOOD_RPC_URL', ...(testnet ? ['VITE_ROBINHOOD_MAINNET_RPC_URL'] : [])];
    for (const key of required.filter(k => !env[k])) {
      console.warn(`\x1b[33m[l4va] ${key} is not set — falling back to the public Robinhood RPC.\x1b[0m`);
    }
  }
  return {
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
      minify: 'esbuild',
      terserOptions: {
        ecma: 2020,
        compress: { passes: 2 },
        mangle: true,
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      },
    },
  };
});
