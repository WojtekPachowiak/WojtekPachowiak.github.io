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

THREE.Vector2.prototype.toString = function () {
  const x = typeof this.x === "number" ? this.x.toFixed(2) : this.x;
  const y = typeof this.y === "number" ? this.y.toFixed(2) : this.y;
  return `(${x}, ${y})`;
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
  debug_material: false,

};

const DEFAULT_NONDEBUG_STATES = {...CURRENT_DEBUG_STATES};
const DEFAULT_DEBUG_STATES = {
  camera: "FPS",
  wireframe: false,
  postprocessing: true,
  loweredOpacity: false,
  octree: false,
  fog: true,
  variableTracking: true,
  worldAxes: false,
  cutscene: false,
  debug_material: false,
};


function buildWireframes(){
  // iterate over all objects in the scene and if they are meshes, get their geometry and put it into wireframeGeometry
  g.SCENE.traverse((child) => {
    if (child.isMesh) {
      console.log(child.isMesh, child.geometry);
      const wireframe = new THREE.WireframeGeometry(child.geometry);

      // translate and rotate the wireframe to match the object
      wireframe.translate(child.position.x, child.position.y, child.position.z);
      wireframe.rotateX(child.rotation.x);
      wireframe.rotateY(child.rotation.y);
      wireframe.rotateZ(child.rotation.z);

      const line = new THREE.LineSegments(wireframe);
      line.material.depthTest = false;
      // line.material.opacity = 0.25;
      // line.material.transparent = true;
      line.material.color = new THREE.Color(0xea00ff);
      line.material.lineWidth = 1;
      line.userData.isDebug = true;
      g.SCENE.add(line);
      g.OBJECT_GROUPS.WIREFRAMES.push(line);
    }
  });
}

export const gui = new GUI();
gui.add(CURRENT_DEBUG_STATES, "camera", ["FPS", "ORBIT"]).onChange((value) => {
  setPlayerControlType(value);

  // distance from the player to the g.CAMERA
  if (value === "ORBIT") {
    g.CAMERA.position.set(0, 10, 20);
  }
});

gui.add(CURRENT_DEBUG_STATES, "wireframe").onChange((value) => {
  
  if (value && g.OBJECT_GROUPS.WIREFRAMES.length === 0) {
    buildWireframes();
  } 

  g.OBJECT_GROUPS.WIREFRAMES.forEach((child) => {
    child.visible = value;
  });
  
});

gui.add(CURRENT_DEBUG_STATES, "postprocessing").onChange((value) => {
  g.POSTPROCESSING_PASSES.PS1.enabled = value;
});

gui.add(CURRENT_DEBUG_STATES, "loweredOpacity").onChange((value) => {
  // iterate over dict of materials
  Object.values(g.MATERIALS).forEach((mat) => {
    if (!mat) {
      return;
    } 
    console.log(mat);
    mat.opacity = value ? 0.5 : 1;  
    mat.transparent = value;
  });
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
    "PLAYER.OBJECT.rigidBody.translation()",
    "PLAYER.OBJECT.rigidBody.rotation()",

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
    textt += "<table>";
    textt += `<h1>MOUSE RAYCAST INFO:</h1>`;

    const triangle = drawDebugTriangle(rayHit);

    const rayHitInfo = {
      name: rayHit.object.name,
      position: rayHit.object.position.toString(),
      rotation: rayHit.object.rotation.toString(),
      scale: rayHit.object.scale.toString(),
      material: rayHit.object.material.name,
      uv: rayHit.uv ? rayHit.uv.toString() : "no UVs",
      tri_a : triangle.a.toString(),
      tri_b : triangle.b.toString(),
      tri_c : triangle.c.toString(),
      distance: rayHit.distance.toFixed(2),
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

function drawDebugTriangle(rayhit){
  const face = rayhit.face;
  const mesh = rayhit.object;

  const linePosition = g.DEBUG.TRIANGLE.geometry.attributes.position;
  const meshPosition = mesh.geometry.attributes.position;

  linePosition.copyAt(0, meshPosition, face.a);
  linePosition.copyAt(1, meshPosition, face.b);
  linePosition.copyAt(2, meshPosition, face.c);
  linePosition.copyAt(3, meshPosition, face.a);

  mesh.updateMatrix();

  g.DEBUG.TRIANGLE.geometry.applyMatrix4(mesh.matrix);

  g.DEBUG.TRIANGLE.visible = true;
  
  // return positions of the triangle
  return {
    a: new THREE.Vector3().fromBufferAttribute(linePosition, 0),
    b: new THREE.Vector3().fromBufferAttribute(linePosition, 1),
    c: new THREE.Vector3().fromBufferAttribute(linePosition, 2),
  };
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

      const rayhit = intersects.length > 0 ? intersects[0] : null;
      variableTracking(div, rayhit);
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

// debug triangle
function createDebugTriangle(){
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
  );
  const material = new THREE.LineBasicMaterial({ color: 0xa200ff,depthTest: false});  
  const line = new THREE.Line(geometry, material);
  g.SCENE.add(line);
  return line;
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

  g.DEBUG.TRIANGLE = createDebugTriangle();
}

gui.add(CURRENT_DEBUG_STATES, "debug_material").onChange((value) => {
  if(g.MATERIALS.UV === null){
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
      child.userData.originalMaterial = child.userData.originalMaterial || child.material;
      child.material = value
        ? g.MATERIALS.UV
        : child.userData.originalMaterial;
    }
  });


});





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

