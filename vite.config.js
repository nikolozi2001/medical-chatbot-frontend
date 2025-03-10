import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import postcssPresetEnv from 'postcss-preset-env';
import postcssNormalize from 'postcss-normalize';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~styles': path.resolve(__dirname, './src/styles')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        // This will be included in every SCSS file
        additionalData: '@use "/src/styles/variables" as *;'
      }
    },
    postcss: {
      plugins: [
        postcssPresetEnv({
          stage: 1,
          features: {
            'nesting-rules': true
          }
        }),
        postcssNormalize()
      ]
    }
  }
});
