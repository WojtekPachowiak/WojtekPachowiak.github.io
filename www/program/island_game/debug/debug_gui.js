import { setPlayerControlType } from "../player/player.js";
import { g } from "../globals.js";
import * as THREE from "three";
import GUI from "lil-gui";
import {DEBUG_STATES} from "./debug_data.js";
import { buildWireframes, updateWireframe, variableTracking, initDebugHelpers } from "./debug_functions.js";
import {initDebugOverrides} from "./debug_overrides.js";
import "./debug_keytriggers.js";
import { updateViewport } from "../screen.js";



export function initDebugGUI(){
  const gui = new GUI();
  gui.hide();
  g.DEBUG.GUI = gui;

  initDebugOverrides();
  initDebugHelpers();
  /////////////////////////////////////////////////////////////////////////////////////////////////////////// CAMERA CONTROLS

  gui
    .add(DEBUG_STATES.CURRENT, "camera", ["FPS", "ORBIT"])
    .onChange((value) => {
      setPlayerControlType(value);

      // distance from the player to the g.CAMERA
      if (value === "ORBIT") {
        g.CAMERA.position.set(0, 10, 20);
      }
    });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////// WIREFRAME

  gui.add(DEBUG_STATES.CURRENT, "wireframe").onChange((value) => {
    if (value && g.OBJECT_GROUPS.WIREFRAMES.length === 0) {
      buildWireframes();
    }

    g.OBJECT_GROUPS.WIREFRAMES.forEach((child) => {
      child.visible = value;
    });

    if (value) {
      g.MAIN_LOOP_CALLBACKS["updateWireframe"] = updateWireframe;
    } else {
      delete g.MAIN_LOOP_CALLBACKS["updateWireframe"];
    }
  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////// POSTPROCESSING

  gui.add(DEBUG_STATES.CURRENT, "postprocessing").onChange((value) => {
    g.POSTPROCESSING_PASSES.PS1.enabled = value;
  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////// LOWERED OPACITY

  // gui.add(DEBUG_STATES.CURRENT, "loweredOpacity").onChange((value) => {
  //   // iterate over dict of materials
  //   Object.values(g.MATERIALS).forEach((mat) => {
  //     if (!mat) {
  //       return;
  //     }
  //     // console.log(mat);
  //     mat.opacity = value ? 0.5 : 1;
  //     mat.transparent = value;
  //   });
  // });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  // gui.add(DEBUG_STATES.CURRENT, "octree").onChange((value) => {
  //   g.OCTREE_HELPER.visible = value;
  //   g.OCTREE_HELPER.update();
  // });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////// FOG

  gui.add(DEBUG_STATES.CURRENT, "fog").onChange((value) => {
    if (value) {
      g.SCENE.fog = g.FOG;
      g.CAMERA.far = g.CAMERA_FAR;
    } else {
      g.SCENE.fog = null;
      g.CAMERA.far = 1000;
    }
    g.CAMERA.updateProjectionMatrix();
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  gui.add(DEBUG_STATES.CURRENT, "variableTracking").onChange((value) => {
    const div = document.getElementById("debugMouseDrawer");
    if (!value) {
      delete g.MAIN_LOOP_CALLBACKS["variableTracking"];
      div.style.display = "none";
      g.DEBUG.TRIANGLE.visible = false;
      return;
    }
    g.MAIN_LOOP_CALLBACKS["variableTracking"] = () => {
      div.innerHTML = "";
      div.style.display = "block";
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(g.MOUSE, g.CAMERA);
      const intersects = raycaster.intersectObjects(
        g.OBJECT_GROUPS.COLLIDABLES,
        false
      );

      const rayhit = intersects.length > 0 ? intersects[0] : null;
      variableTracking(div, rayhit);
    };
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  gui.add(DEBUG_STATES.CURRENT, "worldAxes").onChange((value) => {
    g.WORLD_AXES_HELPER.visible = value;
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  gui.add(DEBUG_STATES.CURRENT, "cutscene").onChange((value) => {
    g.CUTSCENE.ACTIVE = value;
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  gui.add(DEBUG_STATES.CURRENT, "debug_material").onChange((value) => {
    if (g.MATERIALS.UV === null) {
      g.MATERIALS.UV = new THREE.ShaderMaterial({
        vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
      `,
        fragmentShader: `
      varying vec2 vUv;
      void main() {
        // checker
        vec2 uv = vUv ;
        gl_FragColor = vec4(uv, 0.0, 1.0);

      }
      `,
      });
    }

    // traverse scene and set material to UV
    g.SCENE.traverse((child) => {
      if (child.isMesh) {
        child.userData.originalMaterial =
          child.userData.originalMaterial || child.material;
        child.material = value
          ? g.MATERIALS.UV
          : child.userData.originalMaterial;
      }
    });
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  gui.add(DEBUG_STATES.CURRENT, "cameraGizmo").onChange((value) => {
    g.DEBUG.CAMERA_GIZMO.visible = value;
    
    if (value) {
      g.MAIN_LOOP_CALLBACKS["updateCameraGizmo"] = () => {
        g.DEBUG.CAMERA_GIZMO.position.copy(g.PLAYER.OBJECT.camPosition);
        g.DEBUG.CAMERA_GIZMO.setDirection(g.PLAYER.OBJECT.forward);
      };
    } else {
      delete g.MAIN_LOOP_CALLBACKS["updateCameraGizmo"];
    }
    
  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////// lowres

  gui.add(DEBUG_STATES.CURRENT, "lowres").onChange((value) => {
    g.DEBUG.LOWRES = value;
    updateViewport();
  });

}
