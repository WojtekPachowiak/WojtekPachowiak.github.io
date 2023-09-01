import * as THREE from "three";
import backgroundShader from "./resources/shaders/rainbow.glsl?raw";
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
let opacity = 0.3;
let fontSize = 0.1;

// if mobile device
if (matchMedia("(pointer:coarse)").matches) {
  alert("Mobile devices not supported yet. Sorry! :(");
  throw "Mobile devices not supported yet. Sorry! :(";
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
    // material.blendEquation = THREE.AddEquation; //default
    // material.blendSrc = THREE.SrcAlphaFactor; //default
    // material.blendDst = THREE.OneMinusSrcAlphaFactor; //default
    // material.depthWrite = false;

    // let amount = 2.0;
    // textMaterial.onBeforeCompile = function (shader) {
    //   shader.uniforms.time = { value: 0 };
    //   shader.uniforms.resolution = {
    //     value: new THREE.Vector2(
    //       window.innerWidth * window.devicePixelRatio,
    //       window.innerHeight * window.devicePixelRatio
    //     ),
    //   };
    //   const sss = `

    //           float randd(vec2 c) {
    //       return fract(sin(dot(c.xy, vec2(12.9898, 78.233))) * 43758.5453);
    //   }

    //           float noise(vec2 p, float freq) {
    //               float unit =2000. / freq;
    //               vec2 ij = floor(p / unit);
    //               vec2 xy = mod(p, unit) / unit;
    //             //xy = 3.*xy*xy-2.*xy*xy*xy;
    //               xy = .5 * (1. - cos(3.14 * xy));
    //               float a = randd((ij + vec2(0., 0.)));
    //               float b = randd((ij + vec2(1., 0.)));
    //               float c = randd((ij + vec2(0., 1.)));
    //               float d = randd((ij + vec2(1., 1.)));
    //               float x1 = mix(a, b, xy.x);
    //               float x2 = mix(c, d, xy.x);
    //               return mix(x1, x2, xy.y);
    //           }
    //   #define NUM_OCTAVES 5
    //   float remap(float value, float inputMin, float inputMax, float outputMin, float outputMax) {
    //       return outputMin + ((outputMax - outputMin) / (inputMax - inputMin)) * (value - inputMin);
    //   }
    //           float fbm(vec2 x, float freq) {
    //               float v = 0.0;
    //               float a = 0.5;
    //               vec2 shift = vec2(100);
    //             // Rotate to reduce axial bias
    //               mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    //               for(int i = 0; i < NUM_OCTAVES; ++i) {
    //                   v += a * noise(vec2(x), freq);
    //                   x = rot * x * 2.0 + shift;
    //                   a *= 0.5;
    //               }
    //               return v;
    //           }
    //           `;
    //   shader.vertexShader =
    //     "uniform float time;\nuniform float resolution;\n" +
    //     sss +
    //     shader.vertexShader;
    //   shader.vertexShader = shader.vertexShader.replace(
    //     "#include <begin_vertex>",
    //     [
    //       "vec3 transformed = mat3(1,0,0,0,1,0,0,0,1) * vec3( position ) ;",
    //       // "vNormal = vNormal * m;",
    //     ].join("\n")
    //   );

    //   textMaterial.userData.shader = shader;
    // };

    // // Make sure WebGLRenderer doesnt reuse a single program

    // textMaterial.customProgramCacheKey = function () {
    //   return amount.toFixed(1);
    // };

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
  ["image", yOffset, "art.html"],
  ["sound", 0, "music.html"],
  ["about", -yOffset, "about.html"],
  ["horror", -yOffset*2, "gramophone.html"],
].forEach((item) => {
  const text = uppercase ? item[0].toUpperCase() : item[0];
  drawItem(text, item[1] + globalYOffset, item[2]);
});

// // slider
// const slider = new THREE.PlaneGeometry(1., 1);
// const sliderHandle = new THREE.PlaneGeometry(1,1);
// const brightness = 1.;
// const height = 0.003;
// const sliderLength = 0.3
// const sliderMaterial = new THREE.MeshStandardMaterial({
//   transparent: true,
//   emissive: new THREE.Color(brightness,brightness,brightness),
//   opacity: opacity
// });
// const sliderMesh = new THREE.Mesh(slider, sliderMaterial);

// // sliderMesh.position.set(-0.6,-0.8,0);
// sliderMesh.scale.set(sliderLength,height,1.)
// const sliderHandleMesh = new THREE.Mesh(sliderHandle, sliderMaterial);
// sliderHandleMesh.position.set(-0.94,-0.8,0);
// sliderHandleMesh.scale.set(0.02, height, 1.)
// // sliderHandleMesh.type = "sliderHandle"
// scene.add(sliderMesh);
// const c = sliderMesh.clone()
// c.rotation.set(0,0,Math.PI/2)
// scene.add(c);

// scene.add(sliderHandleMesh);

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
const outputPass = new OutputPass();

const outlinePass = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  scene,
  camera
);
outlinePass.edgeStrength = 1;
outlinePass.edgeGlow = 1;
outlinePass.edgeThickness = 3;
outlinePass.visibleEdgeColor.set("#ffff00");

const size = renderer.getDrawingBufferSize(new THREE.Vector2());
const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
  samples: 4,
});
// const fxaaPass = new ShaderPass( FXAAShader );
// fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * window.pixelRatio );
// fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * window.pixelRatio );

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);
// bloomComposer.addPass(outlinePass);

const final_mat = new THREE.ShaderMaterial({
  uniforms: {
    baseTexture: { value: null },
    bloomTexture: { value: bloomComposer.renderTarget2.texture },
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
      text.material.opacity = 0.8;
      text.scale.set(1*aspect*1.05, 1*0.95, 1.0);

      text.scaled = true;
      text.madeEmmisive = true;
      invert_triggered = 1;
      

      text.layers.set(layers.text);
      document.body.style.cursor = "pointer";
      if (clicked) {
        window.location.href = text.link;
      }
    } else {

      text.scale.set(1*aspect, 1, 1);

      // if (text.scaled) {
      //   if (text.scale.x <= 1.0*aspect) {
      //     text.scaled = false;
      //     text.scale.set(1*aspect, 1, 1);
      //   } else {
      //     // text.scale.set(text.scale.x - 0.1 * Math.log(text.scale.x), 1, 1.0);
      //   }
      // }
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
  if (invert_triggered == 1){
    invert += 0.5;
  }
  invert_triggered -= 0.1
  if (invert_triggered < 0.1){
    invert -= 0.1;
  }
  invert_triggered = Math.max(invert_triggered, 0.)
  invert = Math.min(Math.max(0, invert),1.)

  //  update shader
  plane_material.uniforms.time.value = performance.now() / 1000;
  final_mat.uniforms.invert.value = invert;
  // textMaterial.uniforms.time_wojtek.value = Date.now() / 1000 - start;

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
  plane_material.uniforms.resolution.value = new THREE.Vector2(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio
  );

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

// <ul>
//   <li>
//     <a href="art.html">
//       <div class="header">Art</div>
//     </a>
//   </li>
//   <li>
//     <a href="about.html">
//       <div class="header">About</div>
//     </a>
//   </li>
//   <li>
//     <a href="gramophone.html">
//       <div class="header">Gramophone</div>
//     </a>
//   </li>
// </ul>;

// // generate menu
// let items = {
//   art: { header: "Art", href: "art.html" },
//   about: { header: "About", href: "about.html" },
//   gramophone: { header: "Gramophone", href: "gramophone.html" },
// };

// // create ul
// let ul = document.createElement("ul");
// document.body.appendChild(ul);

// // create li
// for (let item in items) {
//   let li = document.createElement("li");
//   ul.appendChild(li);

//   // create a
//   let a = document.createElement("a");
//   a.href = items[item].href;
//   li.appendChild(a);

//   // create div
//   let div = document.createElement("div");
//   div.className = "header";
//   div.innerHTML = items[item].header;
//   a.appendChild(div);
// }
