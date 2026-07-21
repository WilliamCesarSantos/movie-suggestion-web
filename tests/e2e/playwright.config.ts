import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 45_000,
  expect: {
    timeout: 8_000
  },
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
});
