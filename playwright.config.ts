import { defineConfig, devices } from '@playwright/test';

const webServerEnv = process.env.E2E_DATABASE_URL
  ? {
      DATABASE_URL: process.env.E2E_DATABASE_URL,
      ...(process.env.AUTH_SECRET
        ? { AUTH_SECRET: process.env.AUTH_SECRET }
        : {}),
    }
  : undefined;

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    env: webServerEnv,
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
