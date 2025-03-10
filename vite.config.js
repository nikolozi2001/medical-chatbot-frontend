import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import postcssPresetEnv from 'postcss-preset-env'
import postcssNormalize from 'postcss-normalize'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
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
})
