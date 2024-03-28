import * as THREE from "three";
import backgroundShaderFrag from "./mouse_distortion.glsl?raw";
import WebGL from "three/addons/capabilities/WebGL.js";
import checkerTex from "./checker.png";
import galaxyTex from "./galaxy.jpg";
import abstractTex from "./abstract.jpg";
import galaxy2Tex from "./galaxy2.jpg";
import night from "./night.jpg";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import asuka from "./asuka.jpg";
import { AfterimagePass } from "./AfterimagePassCustom.js";

function filePick(){
  // open filepicker
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();
  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        params.textures.custom = texture;
        params.uniforms.tex.value = params.textures.custom;
      };
    };
    reader.readAsDataURL(file);
  });
}

let dpi = 1;
let w = 1827;
let h = 959;

const params = {};
params.textures = {
  checker: new THREE.TextureLoader().load(checkerTex),
  galaxy: new THREE.TextureLoader().load(galaxyTex),
  abstract: new THREE.TextureLoader().load(abstractTex),
  galaxy2: new THREE.TextureLoader().load(galaxy2Tex),
  night: new THREE.TextureLoader().load(night),
  asuka: new THREE.TextureLoader().load(asuka),
};
params.warpShape = {
  "Blackhole" : 0,
  "Spiral" : 1,
};
params.afterimageType = {
  "Blur" : 0,
  "Smear" : 1,
};

params.uniforms = {
  time: { value: 0 },
  resolution: {
    value: new THREE.Vector2(w * dpi, h * dpi),
  },
  mousePos: { value: new THREE.Vector2(0, 0) },
  warpRadius: { value: 0.4 },
  warpStrength: { value: -0.1 },
  tex: { value: params.textures.checker },
  warpShape: { value: params.warpShape.Blackhole },
  afterimageType: { value: params.afterimageType.Blur },
};


params.filePick = filePick;

params.mouseDamp = 0.96;
params.mouseWheelStrengthSpeed = 0.001;
params.mouseWheelRadiusSpeed = 0.0001;
params.afterimageStrength = 0.85;

// create GUI
const gui = new GUI({ width: 300 });
gui
  .add(params.uniforms.warpRadius, "value")
  .min(0.1)
  .max(0.5)
  .step(0.01)
  .name("warpRadius")
  .listen();
gui
  .add(params.uniforms.warpStrength, "value")
  .min(-3)
  .max(3)
  .step(0.01)
  .name("warpStrength")
  .listen();



gui
  .add(params, "mouseDamp")
  .min(0.0)
  .max(0.99)
  .step(0.001)
  .name("mouseDamp")
  .listen();
// gui.add(params, "mouseWheelStrengthSpeed").min(0.0001).max(0.01).step(0.0001).name("mouseWheelStrengthSpeed").listen();
// gui.add(params, "mouseWheelRadiusSpeed").min(0.0001).max(0.01).step(0.0001).name("mouseWheelRadiusSpeed").listen();
gui
  .add(params, "afterimageStrength")
  .min(0.5)
  .max(1)
  .step(0.001)
  .name("afterimageStrength")
  .listen();
// choose texture
const texFolder = gui.addFolder("Texture");
texFolder
  .add(params.uniforms.tex, "value", params.textures)
  .name("tex")
  .listen();
texFolder.open();

gui.add(params.uniforms.warpShape, "value",params.warpShape).name("distortionType").listen();

gui
  .add(params.uniforms.afterimageType, "value", params.afterimageType)
  .name("afterimageType")
  .listen();


// upload you own texture
gui.add(params, "filePick").name("Add your own texture");


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

///////////////////////////////////////////////////////////////////////////////////////////// POSTPROCESSING

// postprocessing
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
// import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
// import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";

import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

// anti-aliasing
const size = renderer.getDrawingBufferSize(new THREE.Vector2());
const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
  samples: 4,
});

const composer = new EffectComposer(renderer, renderTarget);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const customPass = new AfterimagePass(params.afterimageStrength);

composer.addPass(customPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

let lastMousePos = new THREE.Vector2(0, 0);




///////////////////////////////////////////////////////////////////////////////////////////// MAIN LOOP
function animate() {
  requestAnimationFrame(animate);

  params.uniforms.time.value = performance.now() / 1000 + 0;
  params.uniforms.resolution.value.set(w * dpi, h * dpi);
  params.uniforms.mousePos.value.x =
    params.uniforms.mousePos.value.x * params.mouseDamp +
    lastMousePos.x * (1.0 - params.mouseDamp);
  params.uniforms.mousePos.value.y =
    params.uniforms.mousePos.value.y * params.mouseDamp +
    lastMousePos.y * (1.0 - params.mouseDamp);
  
  customPass.uniforms.damp.value = params.afterimageStrength;
  customPass.uniforms.time.value = performance.now() / 1000;
  customPass.uniforms.afterimageType.value = params.uniforms.afterimageType.value;
  // renderer.clear();
  // renderer.render(scene, camera);
  composer.render();
}
animate();


//////////////////////////////////////////////////////////////////////////////////////////// MOUSE LISTENERS



document.addEventListener("mousemove", (e) => {
  // lerp mouse position
  lastMousePos = new THREE.Vector2(e.clientX, window.innerHeight - e.clientY);
});

// blue circle around mouse
const circle = document.createElement("div");
circle.style.position = "absolute";
circle.style.width = "20px";
circle.style.height = "20px";
circle.style.opacity = "0.3";
circle.style.border = "2px solid #000";
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
      e.preventDefault();
  
  if (e.shiftKey) {

    params.uniforms.warpStrength.value +=
      Math.sign(e.deltaY) * 1 * Math.max(0.05, Math.abs(params.uniforms.warpStrength.value/5));
    // clamp warpStrength between -2 and 2
    params.uniforms.warpStrength.value = Math.min(
      3,
      Math.max(-3, params.uniforms.warpStrength.value)
    );
    // change circle background color
    return;
    }else if (e.ctrlKey) {
    // change afterimage strength
    params.afterimageStrength += Math.sign(e.deltaY) * 0.01;
    // clamp afterimageStrength between 0 and 1
    params.afterimageStrength = Math.min(
      1,
      Math.max(0.5, params.afterimageStrength)
    );
    return;
    } else if (e.altKey) {
      // change mouse damp
      params.mouseDamp += Math.sign(e.deltaY) *  Math.pow(0.01, Math.max(0.1,params.mouseDamp));
      // clamp mouseDamp between 0.9 and 1
      params.mouseDamp = Math.min(
        0.99,
        Math.max(0.0, params.mouseDamp)
      );
      return;
  } else {
    params.uniforms.warpRadius.value += e.deltaY * params.mouseWheelRadiusSpeed;
    // clamp warpStrength between 0 and 1
    params.uniforms.warpRadius.value = Math.min(
      0.5,
      Math.max(0.1, params.uniforms.warpRadius.value)
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
}, { passive: false});

// onresize
function updateViewport() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, dpi);
  renderer.setPixelRatio(dpi);
}
window.onresize = updateViewport;
