import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['cjs'],
  dts: true,
  clean: true,
  minify: false,
  target: 'node18',
  publicDir: 'templates',
}); 