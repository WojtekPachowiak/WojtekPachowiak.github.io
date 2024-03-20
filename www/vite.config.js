// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        art: resolve(__dirname, "art.html"),
        contact: resolve(__dirname, "contact/contact.html"),
        sound: resolve(__dirname, "music.html"),
        diary: resolve(__dirname, "diary.html"),
        camera_tracking: resolve(__dirname, "camera_tracking.html"),
        islandgame: resolve(__dirname, "island_game/index.html"),
        spritesheet_cutter: resolve(__dirname, "spritesheet_cutter/index.html"),
        mouse: resolve(__dirname, "mouse/mouse.html"),
      },
    },
  },
});
