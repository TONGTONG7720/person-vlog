import { fileURLToPath } from 'node:url';

import { configDefaults, defineConfig } from 'vitest/config';

const srcDirectory = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': srcDirectory,
    },
  },
  test: {
    environment: 'node',
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
  },
});
