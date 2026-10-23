import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

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
      {
        name: 'mirror-build-artifacts',
        closeBundle() {
          try {
            const distDir = path.resolve(__dirname, 'dist');
            const buildDir = path.resolve(__dirname, 'build');
            if (fs.existsSync(distDir)) {
              if (fs.existsSync(buildDir)) {
                fs.rmSync(buildDir, { recursive: true, force: true });
              }
              fs.cpSync(distDir, buildDir, { recursive: true });
            }
          } catch {
            // graceful fallback
          }
        },
      },
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Olma Marketplace',
          short_name: 'Olma',
          theme_color: '#f97316',
          start_url: '/',
          display: 'standalone',
          background_color: '#f9f4e8',
          icons: [
            {
              src: '/logo.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            },
            {
              src: '/logo.svg',
              sizes: '512x512',
              type: 'image/svg+xml'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          globPatterns: [
            'index.html',
            'manifest.webmanifest',
            'assets/index-*.{js,css}',
            'assets/vendor-react-*.js',
            'assets/vendor-i18n-*.js'
          ],
          globIgnores: [
            '**/vendor-pdf-*.js', '**/vendor-charts-*.js', '**/vendor-quill-*.js',
            '**/vendor-html2canvas-*.js', '**/vendor-sentry-*.js', '**/vendor-joyride-*.js',
            '**/browser-image-compression-*.js', '**/*Admin*.js', '**/*Dashboard*.js'
          ],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com)\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\.(?:png|gif|jpg|jpeg|webp|svg|avif)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'assets-images-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
                }
              }
            },
            {
              urlPattern: /\/api\/v1\/public\//i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-public-cache',
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 5 // 5 minutes
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\/locales\/.*\.json/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'locales-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
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
      include: [
        'react', 'react-dom', 'react-router-dom', 'react-i18next', 'i18next',
        'firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage',
        'lucide-react', 'motion/react', '@tanstack/react-query', 'zustand', 'date-fns'
      ]
    },
    server: {
      hmr: false,
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
