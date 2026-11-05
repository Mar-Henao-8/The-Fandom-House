import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' permite publicar el build en GitHub Pages aunque el repo no esté en la raíz del dominio.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
  },
});
