import * as THREE from "three";
import backgroundShaderFrag from "./mouse_fun_frag.glsl?raw";
import WebGL from "three/addons/capabilities/WebGL.js";
import mefistoTex from "../resources/image/mefisto.jpg";
import checkerTex from "../resources/image/misc/checker.png";
import galaxyTex from "../resources/image/misc/galaxy.jpg";
import abstractTex from "../resources/image/misc/abstract.jpg";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";

let dpi = 1;
let w = 1827;
let h = 959;

const params = {};
params.textures = {
  mefisto: new THREE.TextureLoader().load(mefistoTex),
  checker: new THREE.TextureLoader().load(checkerTex),
  galaxy: new THREE.TextureLoader().load(galaxyTex),
  abstract: new THREE.TextureLoader().load(abstractTex),
};
params.uniforms = {
  time: { value: 1 },
  resolution: {
    value: new THREE.Vector2(w * dpi, h * dpi),
  },
  mousePos: { value: new THREE.Vector2(0, 0) },
  checkerSize: { value: 60 },
  tex: { value: params.textures.checker },
  warpRadius: { value: 0.5 },
  warpStrength: { value: -0.1 },
};

params.mouseDamp = 0.97;
params.mouseWheelStrengthSpeed = 0.001;
params.mouseWheelRadiusSpeed = 0.0001;
params.afterimageDamp = 0.96;

// create GUI
const gui = new GUI({ width: 300 });
gui
  .add(params.uniforms.warpRadius, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("warpRadius")
  .listen();
gui
  .add(params.uniforms.warpStrength, "value")
  .min(-5)
  .max(5)
  .step(0.01)
  .name("warpStrength")
  .listen();
gui
  .add(params.uniforms.checkerSize, "value")
  .min(1)
  .max(100)
  .step(1)
  .name("checkerSize")
  .listen();
gui
  .add(params, "mouseDamp")
  .min(0.9)
  .max(1)
  .step(0.001)
  .name("mouseDamp")
  .listen();
// gui.add(params, "mouseWheelStrengthSpeed").min(0.0001).max(0.01).step(0.0001).name("mouseWheelStrengthSpeed").listen();
// gui.add(params, "mouseWheelRadiusSpeed").min(0.0001).max(0.01).step(0.0001).name("mouseWheelRadiusSpeed").listen();
gui
  .add(params, "afterimageDamp")
  .min(0.1)
  .max(1)
  .step(0.001)
  .name("afterimageDamp")
  .listen();
// choose texture
const texFolder = gui.addFolder("Texture");
texFolder
  .add(params.uniforms.tex, "value", params.textures)
  .name("tex")
  .listen();
texFolder.open();

if (WebGL.isWebGL2Available() === false) {
  document.body.appendChild(WebGL.getWebGL2ErrorMessage());
}

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight, dpi);
renderer.setPixelRatio(dpi);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.width = "100%";
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "-1";
// colorspace
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// scene
const scene = new THREE.Scene();

// shader background
const plane_geometry = new THREE.PlaneGeometry(10, 10);
const plane_material = new THREE.ShaderMaterial({
  uniforms: params.uniforms,
  fragmentShader: backgroundShaderFrag,
  // vertexShader: backgroundShaderVert,
});
plane_material.depthWrite = false;

const plane_mesh = new THREE.Mesh(plane_geometry, plane_material);
scene.add(plane_mesh);

// camera
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  -aspect,
  aspect,
  1,
  -1,
  0.001,
  1000
);

camera.position.set(0, 0, 10);
scene.add(camera);

// postprocessing
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";

import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// anti-aliasing
const size = renderer.getDrawingBufferSize(new THREE.Vector2());
const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
  samples: 4,
});

const composer = new EffectComposer(renderer, renderTarget);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const customPass = new AfterimagePass(params.afterimageDamp);

// modify fragment shader
let shader = customPass.shader;
shader.fragmentShader = `

		uniform float damp;

		uniform sampler2D tOld;
		uniform sampler2D tNew;

		varying vec2 vUv;

		vec4 when_gt( vec4 x, float y ) {

			return max( sign( x - y ), 0.0 );

		}

		void main() {

			vec4 texelOld = texture2D( tOld, vUv );
			vec4 texelNew = texture2D( tNew, vUv );

			// texelOld *= damp * when_gt( texelOld, 0.1 );

			gl_FragColor = mix(texelNew, texelOld, damp);

		}`;
customPass.shader = shader;

composer.addPass(customPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

let lastMousePos = new THREE.Vector2(0, 0);

// MAIN LOOP
function animate() {
  requestAnimationFrame(animate);

  params.uniforms.time.value = performance.now() / 1000 + 0;
  params.uniforms.resolution.value.set(w * dpi, h * dpi);
  customPass.uniforms.damp.value = params.afterimageDamp;

  params.uniforms.mousePos.value.x =
    params.uniforms.mousePos.value.x * params.mouseDamp +
    lastMousePos.x * (1.0 - params.mouseDamp);
  params.uniforms.mousePos.value.y =
    params.uniforms.mousePos.value.y * params.mouseDamp +
    lastMousePos.y * (1.0 - params.mouseDamp);
  // renderer.clear();
  // renderer.render(scene, camera);
  composer.render();
}
animate();

document.addEventListener("mousemove", (e) => {
  // lerp mouse position
  lastMousePos = new THREE.Vector2(e.clientX, window.innerHeight - e.clientY);
});

// blue circle around mouse
const circle = document.createElement("div");
circle.style.position = "absolute";
circle.style.width = "20px";
circle.style.height = "20px";
circle.style.opacity = "0.5";
// circle.style.border = "2px solid #000";
circle.style.borderRadius = "50%";
circle.style.pointerEvents = "none";
circle.style.zIndex = "100";
circle.style.overflow = "hidden";
circle.style.visibility = "hidden";
circle.style.backgroundColor = "rgba(100, 100, 100, 1)";
// transition when visibility changes
document.body.appendChild(circle);

let circleScale = Math.min(window.innerHeight, window.innerWidth);

document.addEventListener("mousemove", (e) => {
  circle.style.left = `${parseInt(
    e.clientX - params.uniforms.warpRadius.value * circleScale
  )}px`;
  circle.style.top = `${parseInt(
    e.clientY - params.uniforms.warpRadius.value * circleScale
  )}px`;
});

// on mouse wheel, change warpRadius
let wheelEventEndTimeout = null;

document.addEventListener("wheel", (e) => {
  // if shift is pressed, change warpStrength
  if (e.shiftKey) {
    params.uniforms.warpStrength.value +=
      e.deltaY * params.mouseWheelStrengthSpeed;
    // clamp warpStrength between -2 and 2
    params.uniforms.warpStrength.value = Math.min(
      5,
      Math.max(-5, params.uniforms.warpStrength.value)
    );
    // change circle background color
    return;
  } else {
    params.uniforms.warpRadius.value += e.deltaY * params.mouseWheelRadiusSpeed;
    // clamp warpStrength between 0 and 1
    params.uniforms.warpRadius.value = Math.min(
      1,
      Math.max(0, params.uniforms.warpRadius.value)
    );
    circle.style.width = `${parseInt(
      params.uniforms.warpRadius.value * 2 * circleScale
    )}px`;
    circle.style.height = `${parseInt(
      params.uniforms.warpRadius.value * 2 * circleScale
    )}px`;
    circle.style.left = `${parseInt(
      e.clientX - params.uniforms.warpRadius.value * circleScale
    )}px`;
    circle.style.top = `${parseInt(
      e.clientY - params.uniforms.warpRadius.value * circleScale
    )}px`;
  }

  circle.style.visibility = "visible";

  clearTimeout(wheelEventEndTimeout);
  wheelEventEndTimeout = setTimeout(() => {
    circle.style.visibility = "hidden";
  }, 300);
});

// onresize
function updateViewport() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, dpi);
  renderer.setPixelRatio(dpi);
}
window.onresize = updateViewport;
