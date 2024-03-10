import { setPlayerControlType } from "./player.js";
import { g } from "./globals.js";
import * as THREE from "three";
import GUI from "lil-gui";

THREE.Vector3.prototype.toString = function () {
  const x = typeof this.x === "number" ? this.x.toFixed(2) : this.x;
  const y = typeof this.y === "number" ? this.y.toFixed(2) : this.y;
  const z = typeof this.z === "number" ? this.z.toFixed(2) : this.z;
  return `(${x}, ${y}, ${z})`;
};

THREE.Euler.prototype.toString = function () {
  if(this.x === undefined || this.y === undefined || this.z === undefined){
    return "undefined";
  }
  return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
};

let CURRENT_DEBUG_STATES = {
  camera: "FPS",
  wireframe: false,
  postprocessing: true,
  loweredOpacity: false,
  octree: false,
  fog: true,
  variableTracking: false,
  worldAxes: false,
  cutscene: false,

};

const DEFAULT_NONDEBUG_STATES = {...CURRENT_DEBUG_STATES};
const DEFAULT_DEBUG_STATES = {
  camera: "FPS",
  wireframe: false,
  postprocessing: false,
  loweredOpacity: false,
  octree: false,
  fog: false,
  variableTracking: true,
  worldAxes: false,
  cutscene: false,
};


export const gui = new GUI();
gui.add(CURRENT_DEBUG_STATES, "camera", ["FPS", "ORBIT"]).onChange((value) => {
  setPlayerControlType(value);

  // distance from the player to the g.CAMERA
  if (value === "ORBIT") {
    g.CAMERA.position.set(0, 10, 20);
  }
});

gui.add(CURRENT_DEBUG_STATES, "wireframe").onChange((value) => {
  g.MATERIALS.PS1.wireframe = value;
});

gui.add(CURRENT_DEBUG_STATES, "postprocessing").onChange((value) => {
  g.POSTPROCESSING_PASSES.PS1.enabled = value;
});

gui.add(CURRENT_DEBUG_STATES, "loweredOpacity").onChange((value) => {
  g.MATERIALS.PS1.opacity = value ? 0.5 : 1;
  g.MATERIALS.PS1.transparent = value;
});

gui.add(CURRENT_DEBUG_STATES, "octree").onChange((value) => {
  g.OCTREE_HELPER.visible = value;
  g.OCTREE_HELPER.update();
});

gui.add(CURRENT_DEBUG_STATES, "fog").onChange((value) => {
  if (value) {
    g.SCENE.fog = g.FOG;
    g.CAMERA.far = g.CAMERA_FAR;
  } else {
    g.SCENE.fog = null;
    g.CAMERA.far = 1000;
  }
  g.CAMERA.updateProjectionMatrix();
});



function variableTracking(div, rayHit=null){
  const varsToTrack = [
    "PLAYER.OBJECT.position",
    "PLAYER.OBJECT.velocity",
    "PLAYER.ON_FLOOR",
  ];
  div.innerHTML = "";

  let textt = "";

  textt += "<table>";
  textt += '<h1>PLAYER INFO:</h1>';
  for (const v of varsToTrack) {
    textt += `
    <tr>
      <td>${v}</td>
      <td>${eval("g." + v)}</td>
    </tr>
    `;
  }
  textt += "</table>";

  if (rayHit) {
    console.log(rayHit);

    textt += "<table>";
    textt += `<h1>MOUSE RAYCAST INFO:</h1>`;
    const rayHitInfo = {
      name: rayHit.object.name,
      position: rayHit.object.position.toString(),
      rotation: rayHit.object.rotation.toString(),
      scale: rayHit.object.scale.toString(),
      material: rayHit.object.material.name,
    };
    for (const k in rayHitInfo) {
      textt += `
      <tr>
        <td>${k}</td>
        <td>${rayHitInfo[k]}</td>
      </tr>
      `;
    }
    textt += "</table>";


  }
    div.innerHTML = textt;
}

gui.add(CURRENT_DEBUG_STATES, "variableTracking").onChange((value) => {
  const div = document.getElementById("debugMouseDrawer");

  if (!value) {
    delete g.MAIN_LOOP_CALLBACKS["variableTracking"];
    div.style.display = "none";
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

      variableTracking(div, intersects.length > 0 ? intersects[0]: null);
    };
});




gui.add(CURRENT_DEBUG_STATES, "worldAxes").onChange((value) => {
  g.WORLD_AXES_HELPER.visible = value;
});

gui.add(CURRENT_DEBUG_STATES, "cutscene").onChange((value) => {
  g.CUTSCENE.ACTIVE = value;
});

function forceUpdateGUI() {
  for (const c of gui.controllers) {
    c.setValue(CURRENT_DEBUG_STATES[c.property]);
}
}

export function initDebugHelpers() {
  // debug helpers
  document.addEventListener("keydown", (event) => {
    // on press "`"  toggle debug mode
    if (event.code === "Backquote") {
      g.DEBUG_MODE = !g.DEBUG_MODE;
      if (g.DEBUG_MODE) {
        CURRENT_DEBUG_STATES = DEFAULT_DEBUG_STATES;
        g.RENDERER.domElement.style.cursor = "";
        gui.show();
      } else {
        CURRENT_DEBUG_STATES = DEFAULT_NONDEBUG_STATES;
        g.RENDERER.domElement.style.cursor = "none";
        gui.hide();
      }
      forceUpdateGUI();

    }
  });

  // if (g.DEBUG_MODE) {
  //   gui.show();
  // } else {
  //   gui.hide();
  // }
}





export class DebugCube extends THREE.Mesh {
  constructor(position, rotation, scale) {
    super(
      new THREE.BoxGeometry(0.2, 0.1, 0.2),
      new THREE.MeshBasicMaterial({ color: 0xf500fd, opacity: 0.1, transparent: true, depthWrite: false})
    );
    this.position.copy(position);
    this.rotation.copy(rotation);
    this.scale.set(scale.x, scale.y, scale.z);

    this.add(new THREE.AxesHelper(1));
  }
}


// export function initDebugHelpers() {

//   // debug helpers
//   document.addEventListener("keydown", (event) => {

//     // on press "`"  toggle debug mode
//  if (event.code === "Backquote") {
//       g.DEBUG_MODE = !g.DEBUG_MODE;
//       if (g.DEBUG_MODE) {
//         gui.show();
//       } else {
//         gui.hide();
//       }
//   }

//   g.MAIN_LOOP_CALLBACKS["debugHelpers"] = () => {
//     if (!g.DEBUG_MODE) {
//       return;
//     }

//     // wireframe
//     if (BOOLEAN_DEBUG_STATES.wireframe) {
//       g.MATERIALS.PS1.wireframe = true;
//     } else {
//       g.MATERIALS.PS1.wireframe = false;
//     }

//     // postprocessing
//     if (BOOLEAN_DEBUG_STATES.postprocessing) {
//       g.POSTPROCESSING_PASSES.PS1.enabled = true;
//     } else {
//       g.POSTPROCESSING_PASSES.PS1.enabled = false;
//     }

//     // lowered opacity
//     if (BOOLEAN_DEBUG_STATES.loweredOpacity) {
//       g.MATERIALS.PS1.opacity = 0.5;
//       g.MATERIALS.PS1.transparent = true;
//     } else {
//       g.MATERIALS.PS1.opacity = 1;
//       g.MATERIALS.PS1.transparent = false;
//     }

//     // octree
//     if (BOOLEAN_DEBUG_STATES.octree) {
//       g.OCTREE_HELPER.visible = true;
//       g.OCTREE_HELPER.update();
//     } else {
//       g.OCTREE_HELPER.visible = false;
//       g.OCTREE_HELPER.update();
//     }

//     // fog
//     if (BOOLEAN_DEBUG_STATES.fog && !g.SCENE.fog === null) {
//       g.SCENE.fog = g.FOG;
//       g.CAMERA.far = g.CAMERA_FAR;
//       g.CAMERA.updateProjectionMatrix();
//     } elif (!BOOLEAN_DEBUG_STATES.fog && g.SCENE.fog !== null){
//       g.SCENE.fog = null;
//       g.CAMERA.far = 1000;
//       g.CAMERA.updateProjectionMatrix();
//     }

//     // raycasting and drawing name of the object
//     if (BOOLEAN_DEBUG_STATES.variableTracking) {
//       g.MAIN_LOOP_CALLBACKS["variableTracking"] = () => {
//         const raycaster = new THREE.Raycaster();
//         raycaster.setFromCamera(g.MOUSE, g.CAMERA);
//         const intersects = raycaster.intersectObjects(
//           g.OBJECT_GROUPS.COLLIDABLES,
//           false
//         );
//         if (intersects.length > 0) {
//           const obj = intersects[0].object;
//           if (obj.name) {
//             console.log(obj.name);
//           }
//         }
//       };
//     }

//     // world axes
//     if (BOOLEAN_DEBUG_STATES.worldAxes) {
//       g.WORLD_AXES_HELPER.visible = true;
//     } else {
//       g.WORLD_AXES_HELPER.visible = false;
//     }

//     // cutscene
//     // if (BOOLEAN_DEBUG_STATES.cutscene) {
//     //   g.CUTSCENE.ACTIVE = true;
//     // } else {
//     //   g.CUTSCENE.ACTIVE = false;
//     // }

// });

//     // on press "1" toggle between FPS g.CAMERA  with physics and fly g.CAMERA without physics
//     if (event.code === "Digit1") {
//       const choice = g.PLAYER.CONTROL_TYPE === "FPS" ? "ORBIT" : "FPS";
//       setPlayerControlType(choice);

//       // distance from the player to the g.CAMERA
//       if (choice === "ORBIT"){
//         g.CAMERA.position.set(0, 10, 20);
//       }
//     }

//     // on press "2" toggle between wireframe, normal, depth and default rendering
//     if (event.code === "Digit2") {
//       if (g.MATERIALS.PS1.wireframe) {
//         g.MATERIALS.PS1.wireframe = false;
//       } else {
//         g.MATERIALS.PS1.wireframe = true;
//       }
//     }

//     // on press "3" toggle between normal and postprocessing rendering
//     if (event.code === "Digit3") {
//       // toggle postprocessing
//       if (g.POSTPROCESSING_PASSES.PS1.enabled) {
//         g.POSTPROCESSING_PASSES.PS1.enabled = false;
//         g.POSTPROCESSING_PASSES.PS1_UI.enabled = false;
//       } else {
//         g.POSTPROCESSING_PASSES.PS1.enabled = true;
//         g.POSTPROCESSING_PASSES.PS1_UI.enabled = true;
//       }
//     }

//     // on press "4" toggle normal and lowered pacity rendering
//     if (event.code === "Digit4") {
//       // toggle lowered opacity
//       if (g.MATERIALS.PS1.opacity === 0.5) {
//         g.MATERIALS.PS1.opacity = 1;
//         g.MATERIALS.PS1.transparent = false;
//       } else {
//         g.MATERIALS.PS1.opacity = 0.5;
//         g.MATERIALS.PS1.transparent = true;
//       }
//     }

//     // on press "5" toggle octree
//     if (event.code === "Digit5") {
//       // toggle octree
//       if (g.OCTREE_HELPER.visible) {
//         g.OCTREE_HELPER.visible = false;
//         g.OCTREE_HELPER.update();

//       } else {
//         g.OCTREE_HELPER.visible = true;
//         g.OCTREE_HELPER.update();
//       }
//     }

//     // on press "6" disable fog and increase camera far
//     if (event.code === "Digit6") {
//       // toggle fog
//       if (g.SCENE.fog === null) {
//         g.SCENE.fog = g.FOG;
//         g.CAMERA.far = g.CAMERA_FAR;
//       } else {
//         g.SCENE.fog = null;
//         g.CAMERA.far = 1000;
//       }
//       g.CAMERA.updateProjectionMatrix();
//     }

//     // if press "7" turn on raycasting and drawing name of the object
//     if (event.code === "Digit7") {
//       const div = document.getElementById("debugMouseDrawer");

//       if (g.MAIN_LOOP_CALLBACKS["variableTracking"]) {
//         delete g.MAIN_LOOP_CALLBACKS["variableTracking"];
//         div.innerHTML = "";
//       }
//       else{
//         g.MAIN_LOOP_CALLBACKS["variableTracking"] = () => {
//           div.innerHTML = "";
//           const raycaster = new THREE.Raycaster();
//           raycaster.setFromCamera(g.MOUSE, g.CAMERA);
//           const intersects = raycaster.intersectObjects(
//             g.OBJECT_GROUPS.COLLIDABLES,
//             false
//           );
//           if (intersects.length > 0) {
//             const obj = intersects[0].object;
//             if (obj.name) {
//               div.innerHTML = `
//                 <p>${obj.name}</p>
//                 <p>position: ${obj.position.x.toFixed(2)}, ${obj.position.y.toFixed(2)}, ${obj.position.z.toFixed(2)}</p>
//                 <p>rotation: ${obj.rotation.x.toFixed(2)}, ${obj.rotation.y.toFixed(2)}, ${obj.rotation.z.toFixed(2)}</p>
//                 <p>scale: ${obj.scale.x.toFixed(2)}, ${obj.scale.y.toFixed(2)}, ${obj.scale.z.toFixed(2)}</p>
//                 <p>material: ${obj.material.name}</p>
//                 <p>player position: ${g.CAMERA.position.x.toFixed(2)}, ${g.CAMERA.position.y.toFixed(2)}, ${g.CAMERA.position.z.toFixed(2)}</p>
//                 <p>player rotation: ${g.CAMERA.rotation.x.toFixed(2)}, ${g.CAMERA.rotation.y.toFixed(2)}, ${g.CAMERA.rotation.z.toFixed(2)}</p>
//                 `;

//               div.style.left = (g.MOUSE.x/2 +0.5) * window.innerWidth + "px";
//               div.style.top = (-g.MOUSE.y / 2 + 0.5) * window.innerHeight + "px";

//               // g.CANVAS_CTX.clearRect(0, 0, g.CANVAS.width, g.CANVAS.height);
//               // g.CANVAS_CTX.fillText(obj.name, g.CANVAS.width / 2, g.CANVAS.height / 2);
//             }
//           }
//         };

//       }

//     }

//     // on press "8" toggle world axis helper
//     if (event.code === "Digit8") {
//       if (g.WORLD_AXES_HELPER.visible) {
//         g.WORLD_AXES_HELPER.visible = false;
//       } else {
//         g.WORLD_AXES_HELPER.visible = true;
//       }
//     }

//     // on press "9" toggle cutscene
//     if (event.code === "Digit9") {
//       g.CUTSCENE.ACTIVE = !g.CUTSCENE.ACTIVE;
//     }

//   });
// }
