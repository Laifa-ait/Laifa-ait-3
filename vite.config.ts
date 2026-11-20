import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, loadEnv} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({mode, command}) => {
  const isBuild = command === 'build';
  const effectiveEnv = isBuild ? 'production' : mode;
  if (isBuild) {
    process.env.NODE_ENV = 'production';
  }
  const env = loadEnv(effectiveEnv, process.cwd(), '');

  return {
    define: {
      'process.env.NODE_ENV': JSON.stringify(effectiveEnv),
    },
    plugins: [
      react({ jsxRuntime: 'automatic' }), 
      tailwindcss(),
    ],
    base: '/',
    build: {
      target: 'es2022',
      outDir: 'dist',
      emptyOutDir: false,
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        external: ['firebase-admin', 'firebase-admin/firestore'],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // 1. Core React Engine first so CJS/React runtime helpers stay in vendor-react
              if (
                id.includes('/react/') ||
                id.includes('/react-dom/') ||
                id.includes('/react-router/') ||
                id.includes('/react-router-dom/') ||
                id.includes('/scheduler/') ||
                id.includes('/react-is/') ||
                id.includes('/use-sync-external-store/')
              ) {
                return 'vendor-react';
              }
              // 2. Core Firebase suite
              if (id.includes('@firebase/auth') || id.includes('firebase/auth')) {
                return 'vendor-firebase-auth';
              }
              if (id.includes('@firebase/firestore') || id.includes('firebase/firestore')) {
                return 'vendor-firebase-firestore';
              }
              if (id.includes('@firebase/storage') || id.includes('firebase/storage')) {
                return 'vendor-firebase-storage';
              }
              if (id.includes('@firebase/app') || id.includes('firebase/app')) {
                return 'vendor-firebase-app';
              }
              // 3. State Management, Query, Icons, i18n & Error monitoring
              if (id.includes('@tanstack/react-query') || id.includes('query-core')) {
                return 'vendor-query';
              }
              if (id.includes('zustand')) {
                return 'vendor-zustand';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('i18next') || id.includes('react-i18next')) {
                return 'vendor-i18n';
              }
              if (id.includes('@sentry')) {
                return 'vendor-sentry';
              }
            }
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      entries: ['index.html'],
      holdUntilCrawlEnd: false,
      include: [
        'react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime',
        'react-router-dom', 'react-i18next', 'i18next',
        'clsx', 'tailwind-merge', '@tanstack/react-query', 'zustand'
      ]
    },
    server: {
      hmr: false,
      allowedHosts: true,
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/dist/**',
          '**/dist-server/**',
          '**/.git/**',
          '**/.aistudio/**',
          '**/coverage/**',
          '**/.husky/**',
          '**/docs/**',
          '**/k6/**',
          '**/e2e/**',
          '**/scripts/**',
          '**/LOGO/**',
          '**/src/tests/**',
          '**/public/avatars/**',
          '**/public/brands/**'
        ]
      }
    },
  };
});
