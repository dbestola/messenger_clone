import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "/", // Ensure correct base URL
  server: {
    historyApiFallback: true, // Enable history fallback
  }
});
