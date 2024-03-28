import { g } from "../globals.js";
import * as THREE from "three";
import {DEBUG_STATES} from "./debug_data.js";


export class DebugCube extends THREE.Mesh {
  constructor(position, rotation, scale) {
    super(
      new THREE.BoxGeometry(0.2, 0.1, 0.2),
      new THREE.MeshBasicMaterial({
        color: 0xf500fd,
        opacity: 0.2,
        transparent: true,
        depthTest: false,
      })
    );
    this.position.copy(position);
    this.rotation.copy(rotation);
    this.scale.set(scale.x, scale.y, scale.z);

    this.add(new THREE.AxesHelper(1));
  }
}

 function buildPhysicsWireframes() {
  const { vertices } = g.PHYSICS.WORLD.debugRender();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  // geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.LineBasicMaterial({
    transparent: true,
    // depthTest: false,
    opacity: 0.5,
    color: 0xffa600,
  });
  const lines = new THREE.LineSegments(geometry, material);
  lines.userData.isPhyscisDebug = true;
  lines.name = "physics_debug";
  
  
  g.SCENE.add(lines);
  g.OBJECT_GROUPS.WIREFRAMES.push(lines);
}



export function buildWireframes(){
  // iterate over all objects in the scene and if they are meshes, get their geometry and put it into wireframeGeometry
  // g.SCENE.traverse((child) => {
  //   if (child.isMesh) {
  //     const wireframe = new THREE.WireframeGeometry(child.geometry);

  //     const line = new THREE.LineSegments(wireframe);
  //     // line.material.depthTest = false;
  //     line.material.opacity = 0.5;
  //     line.material.transparent = true;
  //     line.material.color.set(0x0011ff);
  //     line.userData.isDebug = true;
  //     line.parent = child;

  //     console.log(child.name);
  //     console.log(child.position);
  //     console.log(child.rotation);
  //     // translate and rotate the wireframe to match the object
  //     line.rotation.copy(child.rotation);
  //     line.position.copy(child.position);

  //     line.name = child.name + "_wireframe";
  //     child.userData.wireframe = line;
  //     // g.SCENE.add(line);
  //     // g.OBJECT_GROUPS.WIREFRAMES.push(line);
  //   }
  // });

  // build physics wireframes
  buildPhysicsWireframes();
}



export function updateWireframe(){
  g.OBJECT_GROUPS.WIREFRAMES.forEach((child) => {
    // normal wireframes
    if (child.userData.isDebug) {
      child.position.copy(child.parent.position);
      child.rotation.copy(child.parent.rotation);
    }
    // physcis wireframes
    else if (child.userData.isPhyscisDebug) {
      const { vertices } = g.PHYSICS.WORLD.debugRender();
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      // geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      child.geometry = geometry;
    }
  });
}



export function variableTracking(div, rayHit=null){
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

  g.DEBUG.TRIANGLE.geometry.applyMatrix4(mesh.matrixWorld);

  g.DEBUG.TRIANGLE.visible = true;
  
  
  
  
  
  // draw the coordinates of the triangle on screen for debugging
  const vertices = {
    a: new THREE.Vector3().fromBufferAttribute(linePosition, 0),
    b: new THREE.Vector3().fromBufferAttribute(linePosition, 1),
    c: new THREE.Vector3().fromBufferAttribute(linePosition, 2),
  };

  Object.keys(vertices).forEach((k) => {
    const v = vertices[k];
    const screenPos = v.clone().project(g.CAMERA);
    const p = document.getElementById("debugTriangle_" + k);
    p.style.position = "absolute";
    p.style.left = `${(screenPos.x + 1) * window.innerWidth / 2}px`;
    p.style.top = `${(-screenPos.y + 1) * window.innerHeight / 2}px`;
    p.style.display = "block";
    p.innerHTML = `${k}: ${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)}`;

    });


  return vertices;
}


// debug triangle
function initDebugTriangle(){
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(4 * 3), 3)
  );
  const material = new THREE.LineBasicMaterial({ color: 0x09ff00, opacity: 0.5, transparent: true});  
  const line = new THREE.Line(geometry, material);
  g.SCENE.add(line);
  g.DEBUG.TRIANGLE = line;
}


export function initDebugHelpers() {
  // debug helpers
  document.addEventListener("keydown", (event) => {
    // on press "`"  toggle debug mode
    if (event.code === "Backquote") {
      g.DEBUG_MODE = !g.DEBUG_MODE;
      if (g.DEBUG_MODE) {
        DEBUG_STATES.CURRENT = DEBUG_STATES.DEFAULT_DEBUG;
        g.RENDERER.domElement.style.cursor = "";
        g.DEBUG.GUI.show();
      } else {
        DEBUG_STATES.CURRENT = DEBUG_STATES.DEFAULT_NONDEBUG;
        g.RENDERER.domElement.style.cursor = "none";
        g.DEBUG.GUI.hide();
      }
      forceUpdateGUI();

    }
  });

  initDebugTriangle();
  initCameraGizmo();
}



export function forceUpdateGUI() {
  for (const c of g.DEBUG.GUI.controllers) {
    c.setValue(DEBUG_STATES.CURRENT[c.property]);
  }
}


export function initCameraGizmo(){
  const pos = g.PLAYER.OBJECT.camPosition;
  const gizmo = new THREE.ArrowHelper(g.PLAYER.OBJECT.forward, pos, 3, 0x00ff00);
  // hide
  gizmo.visible = false;
  g.DEBUG.CAMERA_GIZMO = gizmo;
  g.SCENE.add(gizmo);
}



