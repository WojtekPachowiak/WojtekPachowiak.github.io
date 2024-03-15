import WebGL from "three/addons/capabilities/WebGL.js";
import { g } from "./globals.js";
import { snowflakesInit, snowflakesUpdate } from "./snowflakes.js";
import { initMaterials } from "./materials.js";
import { playerUpdate, initPlayer } from "./player.js";
import { initDebugGUI } from "./debug/debug_gui.js";
import { initUI, resizeUI, renderUI } from "./ui.js";
import { initPostProcessing } from "./postprocessing.js";
import { initThree } from "./three_bultins.js";
import { init3DModels } from "./models3d.js";
import { updateCutscene, initCutscenes } from "./cutscenes.js";
import { initInput } from "./input.js";
import { screenspaceRaycast } from "./raycast.js";
import { projectDecal } from "./decals.js";
import { initPhysics, initStaticColliders } from "./physics.js";

if (WebGL.isWebGL2Available() === false) {
  document.body.appendChild(WebGL.getWebGL2ErrorMessage());
}



await initPhysics();
initThree();
initMaterials();
init3DModels();
initPlayer();
initStaticColliders();
initUI();
initInput();
snowflakesInit();
initPostProcessing();
updateViewport();
initDebugGUI();
animate();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// MAIN LOOP
function animate() {
  requestAnimationFrame(animate);

  g.DELTA_TIME = Math.min(0.05, g.CLOCK.getDelta());

  g.TIME = performance.now() / 1000 + 0;

  playerUpdate(g.DELTA_TIME);
  snowflakesUpdate(g.DELTA_TIME);

  let intersection = screenspaceRaycast(g.MOUSE, g.OBJECT_GROUPS.INTERACTABLES);
  if (intersection && intersection.distance < 2) {
    // change pointer image
    console.log("hovering over interactable");
    document.getElementById("cursor-custom").style.opacity = g.CURSOR_HOVER_OPACITY;
  } else {
    document.getElementById("cursor-custom").style.opacity = g.CURSOR_DEFAUTL_OPACITY;
  }

  // call all main loop callbacks (its a dict of functions)
  for (let key in g.MAIN_LOOP_CALLBACKS) {
    g.MAIN_LOOP_CALLBACKS[key]();
  }

  if (g.CUTSCENE !== null) {
    updateCutscene();
  }

  g.PHYSICS.WORLD.step();

  // g.RENDERER.clear();
  //g.RENDERER.render(scene, g.CAMERA);
  // if (f % RENDER_EVERY_N_FRAME === 0)
  if (g.TIME_SINCE_LAST_FRAME > 1 / g.FPS) {
    render();
    g.TIME_SINCE_LAST_FRAME = 0;
  } else {
    g.TIME_SINCE_LAST_FRAME += g.DELTA_TIME;
  }

  // after 5 seconds, change text
  // if (g.TIME > 5) {
  //   g.UI.TEXT = "Hello, world!";
  //   console.log("changing text");
  //   redrawText();
  // }

  // controls.update( clock.getDelta() );
}

// const clearColor = new THREE.Color(0xc22929);
g.RENDERER.autoClear = false;
g.RENDERER.setClearColor(0xf700ff, 0.0);

function render() {
  // g.CAMERA.layers.set(g.LAYERS.DEFAULT);
  // g.SCENE.background = new THREE.Color(g.FOG_COLOR);
  g.POSTPROCESSING_COMPOSERS.MAIN.render();

  // g.SCENE.background = null;
  // g.CAMERA.layers.set(g.LAYERS.TEXT);
  // g.RENDERER.render(g.SCENE, g.CAMERA);

  renderUI();
}

////////////////////////////////////////////////////////////////////////////////////////


// onresize
function updateViewport() {
  g.CAMERA.aspect = window.innerWidth / window.innerHeight;
  g.CAMERA.updateProjectionMatrix();

  g.SCREEN.RESOLUTION.set(
    g.SCREEN.TARGET_Y_RESOLUTION * g.CAMERA.aspect,
    g.SCREEN.TARGET_Y_RESOLUTION
  );

  resizeUI();

  /////////////////////// UPDATE UNIFORMS
  // > PS1 Material
  if (g.MATERIALS.PS1.userData.shader) {
    g.MATERIALS.PS1.userData.shader.uniforms.uResolution.value =
      g.SCREEN.RESOLUTION;
  }
  // > PS1_UI Postprocessing
  // g.POSTPROCESSING_PASSES.PS1_UI.uniforms.uResolution.value = g.SCREEN.RESOLUTION;
  // > PS1_MAIN Postprocessing
  g.POSTPROCESSING_PASSES.PS1.uniforms.uResolution.value = g.SCREEN.RESOLUTION;

  g.RENDERER.setSize(window.innerWidth, window.innerHeight);
  g.RENDERER.setPixelRatio(g.DPI);
}
window.onresize = updateViewport;
