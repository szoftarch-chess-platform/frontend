import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// A separate configuration, because vite.config.ts reads the certificates of the infra repo
// for the dev server, which the tests do not need.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
    },
  },
});
