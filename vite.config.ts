import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Punkt wejścia kodu źródłowego to app.html.
// Plik index.html w głównym folderze repozytorium to GOTOWA, zbudowana gra
// (generowana przez `npm run build:pages`) – serwuje go GitHub Pages.
//
// `npm run build`        -> standardowy build (dist/)
// `npm run build:single` -> cała gra w jednym pliku HTML (dist-single/app.html)
// `npm run build:pages`  -> build:single + skopiowanie wyniku do ./index.html
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'single' ? [react(), viteSingleFile()] : [react()],
  server: { open: '/app.html' },
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    rollupOptions: { input: 'app.html' },
  },
}));
