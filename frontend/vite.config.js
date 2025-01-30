import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { config } from 'dotenv';

config();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
    define: {
    'process.env': process.env
  }
});
