
import { resizeUI } from "./ui.js";
import {g} from "./globals.js";

export function updateViewport() {
  // resizeUI();

  /////////////////////// UPDATE UNIFORMS
  // > PS1 Material
  // if (g.MATERIALS.PS1.userData.shader) {
  //   g.MATERIALS.PS1.userData.shader.uniforms.uResolution.value =
  //     g.SCREEN.RESOLUTION;
  // }
  // // > PS1_UI Postprocessing
  // // g.POSTPROCESSING_PASSES.PS1_UI.uniforms.uResolution.value = g.SCREEN.RESOLUTION;
  // // > PS1_MAIN Postprocessing

  // g.RENDERER.setSize(window.innerWidth, window.innerWidth , false);

  // set canvas element size so that aspect ratio is maintained
  let width, height;
  // if (window.innerWidth < window.innerHeight) {
  width = window.innerWidth;
  height = window.innerWidth * (1 / g.SCREEN.ASPECT_RATIO);
  if (height > window.innerHeight) {
    height = window.innerHeight;
    width = window.innerHeight * g.SCREEN.ASPECT_RATIO;
  }
  width = Math.floor(width);
  height = Math.floor(height);

  g.RENDERER.domElement.style.width = width + "px";
  g.RENDERER.domElement.style.height = height + "px";

  //// if debug mode then render at full resolution
  const lowres = g.DEBUG.LOWRES;
  const resolution = lowres ? g.SCREEN.RESOLUTION : { x: window.innerWidth, y: window.innerHeight };
  g.RENDERER.setSize(resolution.x, resolution.y, false);
  g.POSTPROCESSING_COMPOSERS.MAIN.setSize(resolution.x, resolution.y);
  g.SCREEN.WINDOW_RESOLUTION.set(width, height);
  resizeUI();

  
}
window.onresize = updateViewport;
