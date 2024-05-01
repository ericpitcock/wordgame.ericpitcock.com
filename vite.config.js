import { fileURLToPath, URL } from 'node:url'
import ViteYaml from '@modyfi/vite-plugin-yaml'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    ViteYaml(),
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
