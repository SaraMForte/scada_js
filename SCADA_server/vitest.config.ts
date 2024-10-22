import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // O 'jsdom' si estás probando código de navegador
  }
});
