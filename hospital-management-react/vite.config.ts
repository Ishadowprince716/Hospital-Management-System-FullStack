import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          state: ['@reduxjs/toolkit', 'react-redux'],
          charts: ['recharts'],
          realtime: ['@stomp/stompjs', 'sockjs-client'],
          ui: ['lucide-react', 'react-hot-toast', 'kbar'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/api.ts'],
      thresholds: {
        statements: 60,
        branches: 90,
        functions: 90,
        lines: 60,
      },
    },
  },
})
