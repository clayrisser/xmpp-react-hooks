import { defineConfig } from 'vitest/config';

const sharedTestOptions = {
  environment: 'jsdom',
  globals: true,
  restoreMocks: true,
  setupFiles: ['tests/setup.ts']
};

export default defineConfig({
  test: {
    coverage: {
      enabled: false,
      exclude: ['src/index.ts', 'src/**/*.d.ts'],
      include: ['src/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'lcov']
    },
    projects: [
      {
        test: {
          ...sharedTestOptions,
          include: ['tests/unit/**/*.test.{ts,tsx}'],
          name: 'unit'
        }
      },
      {
        test: {
          ...sharedTestOptions,
          // A real server round trip is slower than the 5s default, and the
          // suite serialises so the fixture accounts do not collide.
          fileParallelism: false,
          hookTimeout: 30000,
          include: ['tests/integration/**/*.test.{ts,tsx}'],
          name: 'integration',
          setupFiles: ['tests/integration/setup.ts'],
          testTimeout: 30000
        }
      }
    ]
  }
});
