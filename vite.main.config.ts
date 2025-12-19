import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main/index.ts',
      formats: ['es'],
      name: 'main',
      fileName: () => `main.js`,
    },
  },
});
