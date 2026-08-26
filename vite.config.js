import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base ("./") makes the built site work both on GitHub Pages
// project sites (https://user.github.io/<repo>/) and when loaded from the
// local filesystem by Electron (file://.../dist/index.html).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
