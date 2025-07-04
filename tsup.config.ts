import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  minify: false,
  target: 'node18',
  publicDir: 'templates',
  banner: {
    js: '#!/usr/bin/env node',
  },
  external: ['express'], // исключаем express из бандла
}); 