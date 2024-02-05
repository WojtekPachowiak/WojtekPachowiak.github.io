// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        art: resolve(__dirname, "art.html"),
        horror: resolve(__dirname, "gramophone.html"),
        sound: resolve(__dirname, "music.html"),
        diary: resolve(__dirname, "review.html"),

      },
    },
  },
});
