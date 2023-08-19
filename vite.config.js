import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "public/index.html"),
        art: resolve(__dirname, "public/art.html"),
        about: resolve(__dirname, "public/about.html"),
        gramophone: resolve(__dirname, "public/gramophone.html"),
      },
    },
  },
});