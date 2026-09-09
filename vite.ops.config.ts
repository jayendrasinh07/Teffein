import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.join(projectRoot, 'ops'),
  publicDir: path.join(projectRoot, 'ops', 'public'),
  plugins: [react(), tailwindcss()],
  define: { 'import.meta.env.VITE_APP_TARGET': JSON.stringify('ops') },
  resolve: { alias: { '@': projectRoot } },
  build: { outDir: path.join(projectRoot, 'dist', 'ops'), emptyOutDir: true },
});
