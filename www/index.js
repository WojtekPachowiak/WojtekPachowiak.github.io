import * as THREE from "three";
import backgroundShader from "./resources/shaders/indexbackground.glsl?raw";
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
// import headersFont from "/resources/fonts/GHOAS_Regular?url";
// import headersFont from "/resources/fonts/Bavex_Regular?url";
// import headersFont from "/resources/fonts/Raleway_Light?url";
import headersFont from "/resources/fonts/Fira Mono_Regular?url";
// import headersFont from "/resources/fonts/Fira Mono Medium_Regular?url";


let yOffset = 0.15;
let globalYOffset = 0.6;
let uppercase = false;
let rot = [0.0, 0.0, 0.0];
let opacity = 1.;
let fontSize = 0.1;



// if mobile device
if (matchMedia("(pointer:coarse)").matches) {
  alert("Mobile devices not supported. Sorry! :(");
  throw "Mobile devices not supported. Sorry! :(";
}

if (WebGL.isWebGL2Available() === false) {
  document.body.appendChild(WebGL.getWebGL2ErrorMessage());
}

// helpers
function remap(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

// Layers
const layers = {
  background: 0,
  text: 1,
};

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
    zoom: { value: 1 },
  },
  fragmentShader: backgroundShader,
});
plane_material.depthWrite = false;

const plane_mesh = new THREE.Mesh(plane_geometry, plane_material);
// plane_mesh.scale.set(window.innerWidth / window.innerHeight, 1, 1);
plane_mesh.layers.set(layers.background);
scene.add(plane_mesh);



// camera
const aspect = window.innerWidth / window.innerHeight
const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.001, 1000);

camera.position.set(0, 0, 10);
// const camera = new THREE.PerspectiveCamera(
//   45,
//   window.innerWidth / window.innerHeight,
//   0.001,
//   1000
// );
// camera.position.set(0, 0, 1);
scene.add(camera);

function drawItem(text, positionY, link) {
  const loader = new FontLoader();
  loader.load(headersFont, function (response) {
    let font = response;
    let textGeo = new TextGeometry(text, {
      size: fontSize,
      height: 0.0,
      curveSegments: 12,
      font: font,
    });
    textGeo.computeBoundingBox();
    // text
    const textMaterial = new THREE.MeshStandardMaterial({
      transparent: true,
      emissive: "white"
    });
    

    let mesh = new THREE.Mesh(textGeo, textMaterial);

    mesh.position.set(-0.95*aspect, positionY, 0.4);
    // mesh.lookAt(camera.position);
    mesh.rotation.set(rot[0], rot[1], rot[2]);
    mesh.scale.set(1*aspect, 1, 1);
    mesh.type = "text";
    mesh.link = link;
    mesh.material.opacity = opacity;

    scene.add(mesh);
  });
}

[
  // ["image", yOffset, "art.html"],
  // ["sound", 0, "music.html"],
  // ["about", -yOffset, "about.html"],
  // ["horror", -yOffset*2, "gramophone.html"],
].forEach((item) => {
  const text = uppercase ? item[0].toUpperCase() : item[0];
  drawItem(text, item[1] + globalYOffset, item[2]);
});

// efects
const renderScene = new RenderPass(scene, camera);
// renderScene.clearColor = new THREE.Color(0x000000)  ;
// renderScene.clearAlpha = 0.0;
let strength = 0.1;
let radius = 1;
let threshold = 1;
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  strength,
  radius,
  threshold
);


const size = renderer.getDrawingBufferSize(new THREE.Vector2());
				const renderTarget = new THREE.WebGLRenderTarget(
          size.width,
          size.height,
          { samples: 4, type: THREE.HalfFloatType }
        );

// const fxaaPass = new ShaderPass( FXAAShader );
// fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * window.pixelRatio );
// fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * window.pixelRatio );

const bloomComposer = new EffectComposer(renderer, renderTarget);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const final_mat = new THREE.ShaderMaterial({
  uniforms: {
    baseTexture: { value: null },
    bloomTexture: { value: bloomComposer.renderTarget2.texture },
    resolution: {
      value: new THREE.Vector2(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
      ),
    },
    invert: { value: 0 }
  },
  vertexShader: bloomVertexShader,
  fragmentShader: bloomFragmentShader,
  defines: {},
})
const mixPass = new ShaderPass(
  final_mat,
  "baseTexture"
);
mixPass.needsSwap = true;

const finalComposer = new EffectComposer(renderer);

finalComposer.addPass(renderScene);
finalComposer.addPass(mixPass);

// finalComposer.addPass(outputPass);
// /////////////////////////////////////////////////

// oribtal controls
// const controls = new OrbitControls(camera, renderer.domElement);

// // light
// // directional
// const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
// dirLight.position.set(0, 0, 1).normalize();
// // scene.add(dirLight);
// // hemispheric
// const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
// hemiLight.position.set(0, 0, 1);
// // scene.add(hemiLight);

// raycast
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(-999, -999);
let pointer_velocity = new THREE.Vector2(0, 0);

let timer = 0;
let invert = 0.0;
let invert_triggered = 0;
//////////////////
// ANIMATE
//////////////////
let clicked = false;
const start = Date.now() / 1000;
// renderer.autoClear = false;
function animate() {
  requestAnimationFrame(animate);

  //  UPDATE //

  // update raycaster
  raycaster.setFromCamera(pointer, camera);

  // get texts
  let texts = scene.children.filter((child) => child.type == "text");
  document.body.style.cursor = "default";

  texts.forEach((text) => {
    let bbox = new THREE.Box3().setFromObject(text);
    let size = new THREE.Vector3();
    bbox.getSize(size);
    let intersects = raycaster.ray.intersectsBox(bbox);
    // if intersects and cursor inside canvas
    if (intersects) {

      text.material.emissiveIntensity += 5;
      // clamp
      text.material.emissiveIntensity = Math.min(
        text.material.emissiveIntensity,
        50.0
      );
      text.material.opacity = 1.;
      // text.scale.set(1*aspect*1.05, 1*0.95, 1.0);

      text.madeEmmisive = true;
      // invert_triggered = 1;
      

      text.layers.set(layers.text);
      document.body.style.cursor = "pointer";
      if (clicked) {
        window.location.href = text.link;
      }
    } else {


      if (text.madeEmmisive) {
        if (text.material.opacity <= opacity) {
          text.madeEmmisive = false;
          text.material.opacity = opacity;
        } else {
          text.material.opacity =
            text.material.opacity - 0.01 * Math.exp(text.material.opacity);
        }
      }
      text.material.emissiveIntensity = 1.;
      text.layers.set(layers.text);
    }
  });

  //  update shader
  plane_material.uniforms.time.value = performance.now() / 1000 +0;

  clicked = false;
  // RENDER //

  // renderer.clear();
  camera.layers.set(1);
  bloomComposer.render();
  camera.layers.set(0);
  finalComposer.render();
}
animate();




//

window.addEventListener("pointermove", onPointerMove);
function onPointerMove(event) {
  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // if (audio.paused){
  //   audio.play();
  // }
  // audio.volume =0.7
}

window.addEventListener("touchend", onDocumentTouchEnd, false);
function onDocumentTouchEnd(event) {
  event.preventDefault();

  pointer.x = (event.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("click", function handleClick() {
  console.log("element clicked");
  clicked = true;
  
});

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
  // plane_material.uniforms.resolution.value = new THREE.Vector2(
  //   window.innerWidth * window.devicePixelRatio,
  //   window.innerHeight * window.devicePixelRatio
  // );

  // final_mat.uniforms.resolution.value = new THREE.Vector2(
  //   window.innerWidth * window.devicePixelRatio,
  //   window.innerHeight * window.devicePixelRatio
  // );

  
  bloomComposer.setSize(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio
  );
  finalComposer.setSize(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio
  );
}
window.onresize = updateViewport;
