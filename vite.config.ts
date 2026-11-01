import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// `base: './'` : chemins relatifs, pour que l'app marche telle quelle sur
// GitHub Pages (https://<compte>.github.io/<dépôt>/) comme en local (ADR 0004).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
