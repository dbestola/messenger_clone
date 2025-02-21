import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true, // Ensure SPA fallback
    headers: {
      "Content-Type": "text/html",
    },
  },
});

