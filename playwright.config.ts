import { defineConfig, devices } from '@playwright/test';
import crypto from 'node:crypto';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    actionTimeout: 15000,
    navigationTimeout: 15000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'production',
      CSRF_SECRET: process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex'),
      VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || 'E2E_NO_REAL_API_KEY',
      VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'olmart-staging-e2e.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || 'olmart-staging-e2e',
      VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'olmart-staging-e2e.firebasestorage.app',
      VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '207154734313',
      VITE_FIREBASE_DATABASE_ID: process.env.VITE_FIREBASE_DATABASE_ID || '(default)',
      VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID || 'E2E_NO_REAL_APP_ID',
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'olmart-staging-e2e',
    },
  },
});

