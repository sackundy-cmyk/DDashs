import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@':           resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks':      resolve(__dirname, 'src/hooks'),
      '@utils':      resolve(__dirname, 'src/utils'),
      '@data':       resolve(__dirname, 'src/data'),
      '@lessons':    resolve(__dirname, 'src/lessons'),
      '@pages':      resolve(__dirname, 'src/pages'),
      '@contexts':   resolve(__dirname, 'src/contexts'),
    },
  },

  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Konva must come before the react catch-all (react-konva contains "react")
          if (id.includes('node_modules/konva') || id.includes('node_modules/react-konva')) return 'konva-vendor';
          if (id.includes('node_modules/react-router')) return 'router-vendor';
          if (id.includes('node_modules/react')) return 'react-vendor';
          if (id.includes('/lessons/unit1')) return 'unit1';
          if (id.includes('/lessons/unit2')) return 'unit2';
          if (id.includes('/lessons/unit3')) return 'unit3';
          if (id.includes('/lessons/unit5')) return 'unit5';
        },
      },
    },
  },
});
