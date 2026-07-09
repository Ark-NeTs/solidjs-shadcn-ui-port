import { isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';
import solid from 'vite-plugin-solid';

// Library build + test runner for the shadcn-solidjs-theme design system.
// `vite build` emits (D49, D19):
//   dist/shadcn-solidjs-theme.js   — ES bundle of every component + `cn`
//   dist/shadcn-solidjs-theme.css  — compiled Tailwind theme + used utilities
//   dist/index.d.ts                — types (per-module .d.ts mirrored under dist/)
// `vitest` reads the `test` block below; Solid JSX is compiled by vite-plugin-solid
// (Bun's `bun test` cannot apply Solid's transform, so this package tests via vitest).
export default defineConfig({
  plugins: [
    solid(),
    tailwindcss(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.{ts,tsx}'],
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
    // Solid ships separate dev/server/client builds behind export conditions;
    // tests need the browser dev build so signals/effects run in jsdom.
    conditions: ['development', 'browser'],
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'shadcn-solidjs-theme.js',
      cssFileName: 'shadcn-solidjs-theme',
    },
    rollupOptions: {
      // Bundle only first-party code (relative imports and the `~` src alias).
      // Every bare specifier — solid-js, @kobalte/core, @corvu/*, … — is
      // externalized so consumers dedupe a single copy.
      external: (id) =>
        !id.startsWith('.') && !id.startsWith('~') && !isAbsolute(id),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
