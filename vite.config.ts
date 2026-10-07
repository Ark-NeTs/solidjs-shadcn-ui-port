// Compile the public Solid 2 library while keeping one shared runtime; D19.
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tailwind from '@tailwindcss/vite';
export default defineConfig({
  plugins: [solid(), tailwind()],
  build: {
    lib: { entry: { 'shadcn-solidjs-theme': 'src/index.ts', styles: 'src/styles.ts' }, formats: ['es'], cssFileName: 'shadcn-solidjs-theme' },
    rolldownOptions: { external: ['solid-js', '@solidjs/web', 'class-variance-authority', 'clsx', 'tailwind-merge'], output: { entryFileNames: '[name].js' } },
  },
});
