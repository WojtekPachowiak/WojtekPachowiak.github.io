import {setPlayerControlType} from "./player.js";
import {g} from "./globals.js";
import * as THREE from "three";

export function initDebugHelpers() {

  // debug helpers
  document.addEventListener("keydown", (event) => {

    // on press "1" toggle between FPS g.CAMERA  with physics and fly g.CAMERA without physics
    if (event.code === "Digit1") {
      const choice = g.PLAYER.CONTROL_TYPE === "FPS" ? "ORBIT" : "FPS";
      setPlayerControlType(choice);
      
      // distance from the player to the g.CAMERA
      if (choice === "ORBIT"){
        g.CAMERA.position.set(0, 10, 20);
      }
    }

    // on press "2" toggle between wireframe, normal, depth and default rendering
    if (event.code === "Digit2") {
      if (g.MATERIALS.PS1.wireframe) {
        g.MATERIALS.PS1.wireframe = false;
      } else {
        g.MATERIALS.PS1.wireframe = true;
      }
    }

    // on press "3" toggle between normal and postprocessing rendering
    if (event.code === "Digit3") {
      // toggle postprocessing
      if (g.POSTPROCESSING_PASSES.PS1.enabled) {
        g.POSTPROCESSING_PASSES.PS1.enabled = false;
      } else {
        g.POSTPROCESSING_PASSES.PS1.enabled = true;
      }
    }

    // on press "4" toggle normal and lowered pacity rendering
    if (event.code === "Digit4") {
      // toggle lowered opacity
      if (g.MATERIALS.PS1.opacity === 0.5) {
        g.MATERIALS.PS1.opacity = 1;
        g.MATERIALS.PS1.transparent = false;
      } else {
        g.MATERIALS.PS1.opacity = 0.5;
        g.MATERIALS.PS1.transparent = true;
      }
    }

    // on press "5" toggle octree
    if (event.code === "Digit5") {
      // toggle octree
      if (g.OCTREE_HELPER.visible) {
        g.OCTREE_HELPER.visible = false;
        g.OCTREE_HELPER.update();

      } else {
        g.OCTREE_HELPER.visible = true;
        g.OCTREE_HELPER.update();
      }
    }

    // on press "6" disable fog and increase camera far
    if (event.code === "Digit6") {
      // toggle fog
      if (g.SCENE.fog === null) {
        g.SCENE.fog = g.FOG;
        g.CAMERA.far = g.CAMERA_FAR;
      } else {
        g.SCENE.fog = null;
        g.CAMERA.far = 1000;
      }
      g.CAMERA.updateProjectionMatrix();
    }

    // if press "7" turn on raycasting and drawing name of the object
    if (event.code === "Digit7") {
      const div = document.getElementById("debugMouseDrawer");
      

      if (g.MAIN_LOOP_CALLBACKS["nameDrawing"]) {
        delete g.MAIN_LOOP_CALLBACKS["nameDrawing"];
        div.innerHTML = "";
      }
      else{
        g.MAIN_LOOP_CALLBACKS["nameDrawing"] = () => {
          div.innerHTML = "";
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(g.MOUSE, g.CAMERA);
          const intersects = raycaster.intersectObjects(
            g.OBJECT_GROUPS.COLLIDABLES,
            false
          );
          if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj.name) {
              div.innerHTML = `
                <p>${obj.name}</p>
                <p>position: ${obj.position.x.toFixed(2)}, ${obj.position.y.toFixed(2)}, ${obj.position.z.toFixed(2)}</p>
                <p>rotation: ${obj.rotation.x.toFixed(2)}, ${obj.rotation.y.toFixed(2)}, ${obj.rotation.z.toFixed(2)}</p>
                <p>scale: ${obj.scale.x.toFixed(2)}, ${obj.scale.y.toFixed(2)}, ${obj.scale.z.toFixed(2)}</p>
                <p>material: ${obj.material.name}</p>
                <p>player position: ${g.CAMERA.position.x.toFixed(2)}, ${g.CAMERA.position.y.toFixed(2)}, ${g.CAMERA.position.z.toFixed(2)}</p>
                <p>player rotation: ${g.CAMERA.rotation.x.toFixed(2)}, ${g.CAMERA.rotation.y.toFixed(2)}, ${g.CAMERA.rotation.z.toFixed(2)}</p>
                `;
              
              div.style.left = (g.MOUSE.x/2 +0.5) * window.innerWidth + "px";
              div.style.top = (-g.MOUSE.y / 2 + 0.5) * window.innerHeight + "px";

              // g.CANVAS_CTX.clearRect(0, 0, g.CANVAS.width, g.CANVAS.height);
              // g.CANVAS_CTX.fillText(obj.name, g.CANVAS.width / 2, g.CANVAS.height / 2);
            }
          }
        };

      }
      
    }

    // on press "8" toggle world axis helper
    if (event.code === "Digit8") {
      if (g.WORLD_AXES_HELPER.visible) {
        g.WORLD_AXES_HELPER.visible = false;
      } else {
        g.WORLD_AXES_HELPER.visible = true;
      }
    }

    // on press "9" toggle cutscene
    if (event.code === "Digit9") {
      g.CUTSCENE.ACTIVE = !g.CUTSCENE.ACTIVE;
      const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
      
    }

  });
}
