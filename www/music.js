import * as THREE from "three";
import backgroundShader from "./resources/shaders/music_background.glsl?raw";
import bloomVertexShader from "./resources/shaders/bloom_v.glsl?raw";
import bloomFragmentShader from "./resources/shaders/bloom_f.glsl?raw";
import textVertexShader from "./resources/shaders/text_v.glsl?raw";
import textFragmentShader from "./resources/shaders/text_f.glsl?raw";

import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
import WebGL from "three/addons/capabilities/WebGL.js";

// import headersFont from "/resources/fonts/Mental Health Demo_Regular?url";
// import headersFont from "/resources/fonts/Essential Economy Demo_Bold?url";
import headersFont from "/resources/fonts/GHOAS_Regular?url";
// import headersFont from "/resources/fonts/Hurimate_Regular?url";
// import headersFont from "/resources/fonts/Barbie Doll_Regular?url";
import audioLoop from "/resources/sound/www2.rb.mp3"


// if mobile device
if (matchMedia("(pointer:coarse)").matches) {
  alert("Mobile devices not supported yet. Sorry! :(");
  throw "Mobile devices not supported yet. Sorry! :(";
}

if (WebGL.isWebGL2Available() === false) {
  document.body.appendChild(WebGL.getWebGL2ErrorMessage());
}

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(
  window.innerWidth,
  window.innerHeight,
  window.devicePixelRatio
);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.width = "100%";

// scene
const scene = new THREE.Scene();

// shader background
const plane_geometry = new THREE.PlaneGeometry(10, 10);
const plane_material = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 1 },
    resolution: {
      value: new THREE.Vector2(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
      ),
    },
  },
  fragmentShader: backgroundShader,
});
plane_material.depthWrite = false;

const plane_mesh = new THREE.Mesh(plane_geometry, plane_material);
scene.add(plane_mesh);


const aspect = window.innerWidth / window.innerHeight
const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.001, 1000);
camera.position.set(0, 0, 10);
scene.add(camera);



function animate() {
  requestAnimationFrame(animate);

  plane_material.uniforms.time.value = performance.now() / 1000;

  renderer.clear();
  renderer.render(scene,camera);
}
animate();


// onresize
function updateViewport() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(
    window.innerWidth,
    window.innerHeight,
    window.devicePixelRatio
  );

  // plane_mesh.scale.set(window.innerWidth / window.innerHeight, 1, 1);
  plane_material.uniforms.resolution.value = new THREE.Vector2(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio
  );

//   bloomComposer.setSize(
//     window.innerWidth * window.devicePixelRatio,
//     window.innerHeight * window.devicePixelRatio
//   );
//   finalComposer.setSize(
//     window.innerWidth * window.devicePixelRatio,
//     window.innerHeight * window.devicePixelRatio
//   );
}
window.onresize = updateViewport;

