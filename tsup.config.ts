import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['server.ts'], // Entry point
  format: ['esm'],      // Output ESM (matches type: module)
  target: 'node20',     // Target Node version
  splitting: false,
  sourcemap: true,
  clean: true,          // Clean dist before build
});