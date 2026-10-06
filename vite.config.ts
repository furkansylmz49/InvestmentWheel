import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Göreli yollar: build çıktısı herhangi bir klasörden / statik sunucudan açılabilir.
  base: './',
});
