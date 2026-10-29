import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, loadEnv} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    plugins: [
      react(), 
      tailwindcss(),
    ],
    base: '/',
    build: {
      target: 'es2022',
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: process.env.NODE_ENV === 'production' ? false : 'hidden',
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        external: ['firebase-admin', 'firebase-admin/firestore'],
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // 1. Core React Engine first so CJS wrappers stay in vendor-react
              if (
                id.includes('/react/') ||
                id.includes('/react-dom/') ||
                id.includes('/react-router/') ||
                id.includes('/react-router-dom/') ||
                id.includes('/scheduler/')
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
              // 3. State Management & Query
              if (id.includes('@tanstack/react-query') || id.includes('query-core')) {
                return 'vendor-query';
              }
              if (id.includes('zustand')) {
                return 'vendor-zustand';
              }
              // 4. Animations & Design System Icons
              if (id.includes('framer-motion') || id.includes('/motion/')) {
                return 'vendor-animations';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              // 5. Internationalization
              if (id.includes('i18next') || id.includes('react-i18next')) {
                return 'vendor-i18n';
              }
              // 6. Heavy optional toolkits (PDF, Charts, Error monitoring)
              if (id.includes('jspdf')) {
                return 'vendor-pdf';
              }
              if (id.includes('html2canvas')) {
                return 'vendor-html2canvas';
              }
              if (id.includes('recharts') || id.includes('d3-')) {
                return 'vendor-charts';
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
      holdUntilCrawlEnd: false,
      include: [
        'react', 'react-dom', 'react-router-dom', 'react-i18next', 'i18next',
        'firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage',
        'lucide-react', 'motion/react', '@tanstack/react-query', 'zustand', 'date-fns'
      ]
    },
    server: {
      hmr: false,
      allowedHosts: true,
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/dist/**',
          '**/.git/**',
          '**/coverage/**',
          '**/.husky/**',
          '**/docs/**',
          '**/k6/**'
        ]
      }
    },
  };
});
