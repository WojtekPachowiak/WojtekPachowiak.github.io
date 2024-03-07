import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { g } from "./globals.js";
import { snowflakesInit, snowflakesUpdate } from "./snowflakes.js";
import { initMaterials } from "./materials.js";
import { playerUpdate, initPlayer } from "./player.js";
import { initDebugHelpers } from "./debug_helpers.js";
import { initText } from "./text.js";
import {
  initPostProcessing,
} from "./postprocessing.js";
import { initThree } from "./three_bultins.js";
import { init3DModels } from "./models3d.js";
import { updateCutscene } from "./cutscenes.js";
import { checkMouseIntersects, initInput } from "./input.js";
import { projectDecal } from "./decals.js";


if (WebGL.isWebGL2Available() === false) {
  document.body.appendChild(WebGL.getWebGL2ErrorMessage());
}

initThree();
initMaterials();  
init3DModels();
initPlayer();
initText();
initInput();
snowflakesInit();
initPostProcessing();
updateViewport();
initDebugHelpers();
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

  let intersection = checkMouseIntersects(g.OBJECT_GROUPS.INTERACTABLES);
  if (intersection && intersection.distance < 2) {
    // change pointer image
    document.body.style.cursor = "pointer";
  } else {
    document.body.style.cursor = "default";
  }

  // call all main loop callbacks (its a dict of functions)
  for (let key in g.MAIN_LOOP_CALLBACKS) {
    g.MAIN_LOOP_CALLBACKS[key]();
  }

  updateCutscene();

  // g.RENDERER.clear();
  //g.RENDERER.render(scene, g.CAMERA);
  // if (f % RENDER_EVERY_N_FRAME === 0)
  if (g.TIME_SINCE_LAST_FRAME > 1 / g.FPS) {
    render();
    g.TIME_SINCE_LAST_FRAME = 0;
  } else {
    g.TIME_SINCE_LAST_FRAME += g.DELTA_TIME;
  }

  // controls.update( clock.getDelta() );
}


// const clearColor = new THREE.Color(0xc22929);
g.RENDERER.autoClear = false;
g.RENDERER.setClearColor(0xf700ff, 0.0);

function render(){
  g.CAMERA.layers.set(0);
  g.SCENE.background = new THREE.Color(g.FOG_COLOR);
  // // g.RENDERER.clear();
  // // fog
  // g.RENDERER.setClearColor(g.FOG_COLOR, 1.0);
  // // render to texture and pass this texture to the next pass
  g.POSTPROCESSING_COMPOSERS.MAIN.render();
  // // g.RENDERER.clearDepth();
  
  // g.CAMERA.layers.set(1);
  // g.SCENE.background = null;
  // // g.RENDERER.clear(true, false, false);
  // g.POSTPROCESSING_COMPOSERS.UI.render();
  

  g.CUTSCENE.TEXT.render(g.RENDERER);


// g.RENDERER.render(g.SCENE, g.CAMERA);
}


////////////////////////////////////////////////////////////////////////////////////////


window.addEventListener("pointerup", function () {
  let intersection;

  intersection = checkMouseIntersects(g.OBJECT_GROUPS.DECALABLES);

  if (intersection) {
    projectDecal(intersection);
  }
});


// onresize
function updateViewport() {
  g.CAMERA.aspect = window.innerWidth / window.innerHeight;
  g.CAMERA.updateProjectionMatrix();
  
  g.SCREEN.RESOLUTION.set(
    g.SCREEN.TARGET_Y_RESOLUTION * g.CAMERA.aspect,
    g.SCREEN.TARGET_Y_RESOLUTION
    );
    

    
    /////////////////////// UPDATE UNIFORMS
    // > PS1 Material
    if (g.MATERIALS.PS1.userData.shader) {
      g.MATERIALS.PS1.userData.shader.uniforms.uResolution.value = g.SCREEN.RESOLUTION;
    }
    // > PS1_UI Postprocessing
    // g.POSTPROCESSING_PASSES.PS1_UI.uniforms.uResolution.value = g.SCREEN.RESOLUTION;
    // > PS1_MAIN Postprocessing
    g.POSTPROCESSING_PASSES.PS1.uniforms.uResolution.value = g.SCREEN.RESOLUTION;

    
    g.RENDERER.setSize(window.innerWidth, window.innerHeight);
    g.RENDERER.setPixelRatio(g.DPI);
}
window.onresize = updateViewport;
