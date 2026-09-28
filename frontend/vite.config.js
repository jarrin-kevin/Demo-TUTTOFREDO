import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En GitHub Pages el sitio vive en /Demo-TUTTOFREDO/; el workflow pasa BASE_PATH.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
});
