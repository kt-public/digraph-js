import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul', // or 'v8'
      // provider: 'v8',
      reporter: ['text', 'html', 'clover', 'json', 'lcov']
    }
  }
});
