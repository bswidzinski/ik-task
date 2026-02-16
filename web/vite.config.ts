import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/types/**', 'src/main.tsx', 'src/vite-env.d.ts', 'src/__tests__/**', 'src/components/ui/**', 'src/App.tsx', 'src/components/layout.tsx'],
      reportsDirectory: 'coverage',
      reporter: ['text', 'text-summary', 'lcov'],
    },
  },
});
