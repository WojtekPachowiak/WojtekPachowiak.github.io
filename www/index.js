import * as THREE from "three";
import backgroundShader from "./resources/shaders/indexbackground.glsl?raw";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import WebGL from "three/addons/capabilities/WebGL.js";

// import headersFont from "/resources/fonts/Mental Health Demo_Regular?url";
// import headersFont from "/resources/fonts/Essential Economy Demo_Bold?url";
// import headersFont from "/resources/fonts/GHOAS_Regular?url";
// import headersFont from "/resources/fonts/Bavex_Regular?url";
// import headersFont from "/resources/fonts/Raleway_Light?url";
import headersFont from "/resources/fonts/Fira Mono_Regular?url";
// import headersFont from "/resources/fonts/Fira Mono Medium_Regular?url";


let globalYOffset = 0.6;
let uppercase = false;
let rot = [0.0, 0.0, 0.0];
let opacity = 1.;
let fontSize = 0.1;
let dpi = 1;



if (WebGL.isWebGL2Available() === false) {
  document.body.appendChild(WebGL.getWebGL2ErrorMessage());
}


// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(
  window.innerWidth,
  window.innerHeight,
  dpi
);
renderer.setPixelRatio(dpi);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.width = "100%";
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "-1";


// scene
const scene = new THREE.Scene();

// shader background
const plane_geometry = new THREE.PlaneGeometry(10, 10);
const plane_material = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 1 },
    resolution: {
      value: new THREE.Vector2(
        window.innerWidth * dpi,
        window.innerHeight * dpi
      ),
    },
    zoom: { value: 1 },
  },
  fragmentShader: backgroundShader,
});
plane_material.depthWrite = false;

const plane_mesh = new THREE.Mesh(plane_geometry, plane_material);
scene.add(plane_mesh);



// camera
const aspect = window.innerWidth / window.innerHeight
const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.001, 1000);

camera.position.set(0, 0, 10);
scene.add(camera);


// MAIN LOOP
function animate() {
  requestAnimationFrame(animate);

  plane_material.uniforms.time.value = performance.now() / 1000 +0;
  plane_material.uniforms.resolution.value.set(
    window.innerWidth * dpi,
    window.innerHeight * dpi
  );

  renderer.clear();
  renderer.render(scene, camera);
}
animate();




// onresize
function updateViewport() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(
    window.innerWidth,
    window.innerHeight,
    dpi
  );
  renderer.setPixelRatio(dpi);

}
window.onresize = updateViewport;
