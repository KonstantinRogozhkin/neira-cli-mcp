import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['cjs'],
  dts: true,
  clean: true,
  minify: false,
  target: 'node18',
  publicDir: 'templates',
  banner: {
    js: '#!/usr/bin/env node',
  },
  external: [], // включаем все зависимости в бандл
  platform: 'node',
  shims: true, // добавляем shims для Node.js
}); 