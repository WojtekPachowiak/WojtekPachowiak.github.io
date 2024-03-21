import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  initWebcamTracking,
  getAverageEyePosition,
  getFaceNormalVector
} from "./camera_tracking_mediapipe.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

import deathgripseh_frag from "./resources/shaders/deathgripseh_frag.glsl?raw";
import deathgripseh_vert from "./resources/shaders/deathgripseh_vert.glsl?raw";


let camera;
let scene;
let renderer;
let video;
let webcamResolution = { width: null, height: null };

const params = {
  threshold: 0,
  strength: 0,
  radius: 0,
  exposure: 1,
}; 

const shaderUniforms = {
  uLineThickness: 0,
  uLightness: 1,
  uHeight: 0,
  uNumGridLines: 50,

  // color management
  uHue: 0,
  uSaturation: 1  ,
  uContrast: 1,
  uBrightness: 0,
  uGamma: 1,
  uExposure: 1,
  uTemperature: 0,
}

let deathgripsehMaterial;  



(
  async function () {
    init();
    await initWebcam();
    initWebcamTexture();
    // initGeometry();
    // initWebcamTracking(video);
    animate();
  }
)();



function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 5);

  scene = new THREE.Scene();


  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // backgroundwhite
  renderer.setClearColor(0x000000, 1);

//   // lights
//   const light = new THREE.DirectionalLight(0xffffff, 1);
//   light.castShadow = true; // default false
//   light.position.set(10, 10, 10).normalize();
//   scene.add(light);
//   //Set up shadow properties for the light
//   light.shadow.mapSize.width = 512; // default
//   light.shadow.mapSize.height = 512; // default
//   light.shadow.camera.near = 0.5; // default
//   light.shadow.camera.far = 500; // default

// // point light 
//   const pointLight = new THREE.PointLight(0xffffff, 100);
//   pointLight.position.set(0, 5, 1);
//   scene.add(pointLight);

//   // hemispheric light
//   const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
//   hemiLight.position.set(0, 20, 0);
//   scene.add(hemiLight);




  const controls = new OrbitControls(camera, renderer.domElement);
  //   controls.enableZoom = false;
  //   controls.enablePan = false;



  window.addEventListener("resize", onWindowResize);

  //
}

function initGeometry() {
  // draw plane and box on top
  // const geometry = new THREE.BoxGeometry(16, 9, 0.1);
  // geometry.rotateX(-Math.PI / 2);
  // const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  // const plane = new THREE.Mesh(geometry, material);
  // plane.castShadow = true;
  // plane.receiveShadow = true;
  // scene.add(plane);

  const geometry2 = new THREE.BoxGeometry(1, 1, 1);
  // geometry2.translate(0, 0, 0);
  const material2 = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry2, material2);
  cube.castShadow = true;
  cube.receiveShadow = true;
  scene.add(cube);
}



////////////////////////////////////////////////////////////////////////   get the video stream from the webcam

function initWebcamTexture() {
  video = document.getElementById("webcam");
  
  const texture = new THREE.VideoTexture( video );
  texture.colorSpace = THREE.SRGBColorSpace;

  // get the aspect ratio of the video
  const aspect = webcamResolution.width / webcamResolution.height;
  // scale the plane to the aspect ratio of the video and users screen
  const width = window.innerWidth 
  const height = window.innerHeight 

  const gridDensity = 100;

  const geometry = new THREE.PlaneGeometry( aspect * 3, 1* 3, gridDensity, gridDensity);



  const u = Object.fromEntries(
    Object.keys(shaderUniforms).map((key) => [
      key,
      { value: shaderUniforms[key] },
    ])
  );

  
  console.log(u);

  deathgripsehMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 1 },
      uTexture: { value: texture },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      ...u
    },
    fragmentShader: deathgripseh_frag,
    vertexShader: deathgripseh_vert,
    // depthWrite : false,
    vertexColors: true,
    side: THREE.DoubleSide,
    wireframe: true,
    transparent: true,
    // alphaTest: 0.5,
    // alphaHash: 1.0,
    // precision: "mediump",
  });



  // const material = new THREE.MeshBasicMaterial({
  //   map: texture,
  //   wireframe: false,
  //   vertexColors: true,
  // });

  const mesh = new THREE.Mesh(geometry, deathgripsehMaterial);
  // set the vertex color to the texture color

  const count = geometry.attributes.position.count;
  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(count * 3), 3)
    );
    const colors = geometry.attributes.color;
    const color = new THREE.Color();

  console.log(geometry.attributes.uv.array);
  console.log(texture);
  // throw new Error("stop");
  for (let i = 0; i < count; i++) {

    const uv = geometry.attributes.uv.array;
    // console.log(uv);

    

    color.setHSL(
      (i / count),
      // random value
      Math.random(),
      0.5,
      THREE.SRGBColorSpace
    );
    colors.setXYZ(i, uv[i*2], uv[i*2+1], color.b);
  }


  mesh.lookAt(camera.position);
  scene.add(mesh);


}


async function initWebcam() {

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

    // const width = window.innerWidth /2;
    // const height = window.innerHeight /2;
    video = document.getElementById("webcam");    

    const constraints = {
      video: {width: { ideal: 4096 }, height: { ideal: 2160 },  facingMode: "user" },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // apply the stream to the video element used in the texture
      webcamResolution = { width: stream.getVideoTracks()[0].getSettings().width, height: stream.getVideoTracks()[0].getSettings().height };
      video.srcObject = stream;
      video.play();
    } catch (error) {
      console.error("Unable to access the camera/webcam.", error);
    }
  } else {
    console.error("MediaDevices interface not available.");
  }
}

////////////////////////////////////////////////////////////////////////   

function map_range(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

function moveCamera() {
  const eyePosition = getAverageEyePosition();
  if (eyePosition) {

    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

    eyePosition.x = map_range(eyePosition.x, 0, 1, -Math.PI, Math.PI) * 3;

    const amplify = 3;
    eyePosition.y = map_range(
      eyePosition.y,
      1,
      0,
      0 - Math.PI * (amplify - 1),
      Math.PI + Math.PI * (amplify - 1)
    );

    // amplify but clamp to 0 and Math.PI
    eyePosition.y = clamp(eyePosition.y , 0.3, Math.PI -0.3);

    console.log(eyePosition.z);
    camera.position.setFromSphericalCoords(
      5 ,
      Math.PI/4,
      eyePosition.x
    );



    // clamp y to 0.1
    // camera.position.y = Math.max(camera.position.y, -4);
    // camera.position.y = Math.min(camera.position.y, 4);

    // normalize position 
    // const pos = camera.position.normalize().multiplyScalar(5);
    // camera.position.set(pos.x, pos.y, pos.z)
    camera.lookAt(0, 0, 0);
  }
}

function drawFaceNormal() {
  const normal = getFaceNormalVector();
  // delete previous arrow
  scene.children = scene.children.filter((child) => child.type !== "ArrowHelper");
  if (normal) {
    const origin = getAverageEyePosition();
    const length = 2;
    const hex = 0xff0000;
    const arrowHelper = new THREE.ArrowHelper(normal, new THREE.Vector3(0,0,0), length, hex);
    
    scene.add(arrowHelper);
  }
}





import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
let composer;
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const outputPass = new OutputPass();

composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(outputPass);

//////////////////////////////////////////////////////////////// GUI

const gui = new GUI();
const bloomFolder = gui.addFolder("bloom");

bloomFolder.add(params, "threshold", 0.0, 1.0).onChange(function (value) {
  bloomPass.threshold = Number(value);
});
bloomFolder.add(params, "strength", 0.0, 3.0).onChange(function (value) {
  bloomPass.strength = Number(value);
});
gui
  .add(params, "radius", 0.0, 1.0)
  .step(0.01)
  .onChange(function (value) {
    bloomPass.radius = Number(value);
  });
const toneMappingFolder = gui.addFolder("tone mapping");
toneMappingFolder.add(params, "exposure", 0.1, 2).onChange(function (value) {
  renderer.toneMappingExposure = Math.pow(value, 4.0);
});

const shaderFolder = gui.addFolder("shader");
shaderFolder.add(shaderUniforms, "uLineThickness", 0, 2).onChange(function (value) {
  shaderUniforms.uLineThickness = value;
  deathgripsehMaterial.uniforms.uLineThickness.value = value;
});
shaderFolder.add(shaderUniforms, "uLightness", 0, 1).onChange(function (value) {
  shaderUniforms.uLightness = value;
  deathgripsehMaterial.uniforms.uLightness.value = value;
});
shaderFolder.add(shaderUniforms, "uHeight", -10, 10).onChange(function (value) {
  shaderUniforms.uHeight = value;
  deathgripsehMaterial.uniforms.uHeight.value = value;
});
shaderFolder.add(shaderUniforms, "uNumGridLines", 1, 100).onChange(function (value) {
  shaderUniforms.uNumGridLines = value;
  deathgripsehMaterial.uniforms.uNumGridLines.value = value;
});
// color managament
shaderFolder.add(shaderUniforms, "uHue", 0, 1).onChange(function (value) {
  shaderUniforms.uHue = value;
  deathgripsehMaterial.uniforms.uHue.value = value;
});
shaderFolder.add(shaderUniforms, "uSaturation", 0, 2).onChange(function (value) {
  shaderUniforms.uSaturation = value;
  deathgripsehMaterial.uniforms.uSaturation.value = value;
});
shaderFolder.add(shaderUniforms, "uContrast", 0, 2).onChange(function (value) {
  shaderUniforms.uContrast = value;
  deathgripsehMaterial.uniforms.uContrast.value = value;
});
shaderFolder.add(shaderUniforms, "uBrightness", -1, 1).onChange(function (value) {
  shaderUniforms.uBrightness = value;
  deathgripsehMaterial.uniforms.uBrightness.value = value;
});
shaderFolder.add(shaderUniforms, "uGamma", 0, 2).onChange(function (value) {
  shaderUniforms.uGamma = value;
  deathgripsehMaterial.uniforms.uGamma.value = value;
});
shaderFolder.add(shaderUniforms, "uExposure", 0, 2).onChange(function (value) {
  shaderUniforms.uExposure = value;
  deathgripsehMaterial.uniforms.uExposure.value = value;
});
shaderFolder.add(shaderUniforms, "uTemperature", 0, 2).onChange(function (value) {
  shaderUniforms.uTemperature = value;
  deathgripsehMaterial.uniforms.uTemperature.value = value;
});






function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}




function animate() {
  requestAnimationFrame(animate);
  // moveCamera();
  // drawFaceNormal();
  // renderer.render(scene, camera);
  composer.render();

}
