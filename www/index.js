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

import HelvetikerFontPath from "three/examples/fonts/helvetiker_regular.typeface.json";


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
// plane_mesh.scale.set(window.innerWidth / window.innerHeight, 1, 1);
plane_mesh.layers.set(layers.background);
scene.add(plane_mesh);

// camera
const camera = new THREE.OrthographicCamera(
  -1,
  1,
  1,
  -1,
  0.001,
  1000
);
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
  loader.load(
    "/resources/fonts/helvetiker_regular.typeface.json",
    function (response) {
      let font = response;
      let textGeo = new TextGeometry(text, {
        size: 0.4,
        height: 0.01,
        curveSegments: 12,
        // bevelEnabled : true,
        // bevelThickness: 0.01,
        // bevelSize: 0.01,
        // // bevelOffset: 0.1,
        // bevelSegments: 10,

        font: font,

        //   curveSegments: 12,
      });
      textGeo.computeBoundingBox();
      textGeo.center();
      const centerOffset =
        -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

      // text
      const textMaterial = new THREE.MeshStandardMaterial({
        // color: 0xffff00,
        transparent: true,
        emissive: "white",
        // depthWrite: false,
        // depthTest: false,
        // depthFunc: THREE.AlwaysDepth,
        // colorWrite: false,
        // clipIntersection: false,
        // forceSinglePass: true,
        // blending: THREE.MaxEquation,
        // blendEquation: THREE.MaxEquation,
        // blendEquationAlpha: THREE.MaxEquation,
        // blendSrcAlpha: THREE.OneFactor,
      });
      // material.blendEquation = THREE.AddEquation; //default
      // material.blendSrc = THREE.SrcAlphaFactor; //default
      // material.blendDst = THREE.OneMinusSrcAlphaFactor; //default
      // material.depthWrite = false;

      let amount = 2.0;
      textMaterial.onBeforeCompile = function (shader) {
        shader.uniforms.time = { value: 0 };
        shader.uniforms.resolution = {
          value: new THREE.Vector2(
            window.innerWidth * window.devicePixelRatio,
            window.innerHeight * window.devicePixelRatio
          ),
        };
        const sss = `

              float randd(vec2 c) {
          return fract(sin(dot(c.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

              float noise(vec2 p, float freq) {
                  float unit =2000. / freq;
                  vec2 ij = floor(p / unit);
                  vec2 xy = mod(p, unit) / unit;
                //xy = 3.*xy*xy-2.*xy*xy*xy;
                  xy = .5 * (1. - cos(3.14 * xy));
                  float a = randd((ij + vec2(0., 0.)));
                  float b = randd((ij + vec2(1., 0.)));
                  float c = randd((ij + vec2(0., 1.)));
                  float d = randd((ij + vec2(1., 1.)));
                  float x1 = mix(a, b, xy.x);
                  float x2 = mix(c, d, xy.x);
                  return mix(x1, x2, xy.y);
              }
      #define NUM_OCTAVES 5
      float remap(float value, float inputMin, float inputMax, float outputMin, float outputMax) {
          return outputMin + ((outputMax - outputMin) / (inputMax - inputMin)) * (value - inputMin);
      }
              float fbm(vec2 x, float freq) {
                  float v = 0.0;
                  float a = 0.5;
                  vec2 shift = vec2(100);
                // Rotate to reduce axial bias
                  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
                  for(int i = 0; i < NUM_OCTAVES; ++i) {
                      v += a * noise(vec2(x), freq);
                      x = rot * x * 2.0 + shift;
                      a *= 0.5;
                  }
                  return v;
              }
              `;
        shader.vertexShader =
          "uniform float time;\nuniform float resolution;\n" +
          sss +
          shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
          "#include <begin_vertex>",
          [
            "vec3 transformed = mat3(1,0,0,0,1,0,0,0,1) * vec3( position ) ;",
            // "vNormal = vNormal * m;",
          ].join("\n")
        );

        textMaterial.userData.shader = shader;
      };

      // Make sure WebGLRenderer doesnt reuse a single program

      textMaterial.customProgramCacheKey = function () {
        return amount.toFixed(1);
      };

      let mesh = new THREE.Mesh(textGeo, textMaterial);

      mesh.position.set(0, positionY, 0.4);
      // mesh.lookAt(camera.position);
      // mesh.rotation.set(0.4, 0.0, 0.0);
      // mesh.scale.set(1., 2., 1.);
      mesh.type = "text";
      mesh.link = link;

      scene.add(mesh);
    }
  );
}
drawItem("ART", 0.5, "art.html");
drawItem("ABT", 0, "about.html");
drawItem("HOR", -0.5, "gramophone.html");

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

const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);
// bloomComposer.addPass(fxaaPass);

// bloomComposer.addPass(outlinePass);

const mixPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture },
    },
    vertexShader: bloomVertexShader,
    fragmentShader: bloomFragmentShader,
    defines: {},
  }),
  "baseTexture"
);
mixPass.needsSwap = true;

const finalComposer = new EffectComposer(renderer);
finalComposer.addPass(renderScene);
finalComposer.addPass(mixPass);
// finalComposer.addPass(outputPass);
// /////////////////////////////////////////////////

// oribtal controls
const controls = new OrbitControls(camera, renderer.domElement);

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
const pointer = new THREE.Vector2();

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
    if (intersects ) {
      // text.material.emissive.set("#ffffff");
      text.material.emissiveIntensity = 30;
      text.material.opacity = 0.8;
      // skew text
      // text.rotation.set(0.4, 0.0, 0.0);
      text.scale.set(1.1, 1.1, 1.1);

      // text.material.transparent = false;
      text.layers.set(layers.text);
      document.body.style.cursor = "pointer";
      if (clicked) {
        // fetch(text.link);
        window.location.href = text.link;
      }
    } else {
      // text.material.emissive.set("#000000");
      text.material.emissiveIntensity = 1;
      text.scale.set(1.0, 1.0, 1.0);


      text.material.opacity = 0.1;
      // text.material.transparent = true;
      text.layers.set(layers.text);
    }
  });

  //  update shader
  plane_material.uniforms.time.value = performance.now() / 1000;
  // textMaterial.uniforms.time_wojtek.value = Date.now() / 1000 - start;
  scene.traverse(function (child) {
    if (child.type == "text") {
      const shader = child.material.userData.shader;

      if (shader) {
        shader.uniforms.time.value = performance.now() / 1000;
      }
    }
  });

  //  update position of each text
  scene.children.forEach((child) => {
    if (child.type == "text") {
      const centerOffset =
        -0.5 *
        (child.geometry.boundingBox.max.x - child.geometry.boundingBox.min.x);

      // child.position.y +=
      //   Math.sin(child.id + Date.now() / 100 - start) * 0.00001;
      //   const look =  camera.position;
      // child.lookAt(look);
      // child.position.z =  0.4+ remap(
      //   Math.sin(child.id + Date.now() / 10000 - start),
      //   -1,
      //   1,
      //   0,
      //   0.1
      // );
      // child.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), 0.005 * child.id/10 );
      // child.rotateOnWorldAxis(
      //   new THREE.Vector3(1, 0, 0),
      //   (0.002 * child.id) / 10
      // );

      // child.scale.y =
      //   0.4+
      //   remap(
      //     Math.sin(child.id + Date.now() / 10000 - start),
      //     -1,
      //     1,
      //     -0.1,
      //     0.1
      //   );
    }
  });

  clicked = false;
  // RENDER //

  // renderer.clear();
  camera.layers.set(1);
  bloomComposer.render();
  camera.layers.set(0);
  finalComposer.render();
}
animate();

window.addEventListener("pointermove", onPointerMove);
function onPointerMove(event) {
  // calculate pointer position in normalized device coordinates
  // (-1 to +1) for both components

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener("click", function handleClick() {
  console.log("element clicked");
  clicked = true;
});

// onresize
window.onresize = () => {
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

  bloomComposer.setSize(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio
  );
  finalComposer.setSize(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio
  );
};

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
