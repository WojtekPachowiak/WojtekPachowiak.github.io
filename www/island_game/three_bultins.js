import * as THREE from "three";
import { Octree } from "three/addons/math/Octree.js";
import { OctreeHelper } from "three/addons/helpers/OctreeHelper.js";
import { g } from "./globals.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";


export function initThree() {
  g.RENDERER = new THREE.WebGLRenderer({ antialias: false });
  // g.RENDERER.setSize(g.SCREEN.TARGET_Y_RESOLUTION * g.SCREEN.ASPECT_RATIO, g.SCREEN.TARGET_Y_RESOLUTION, false);
  g.RENDERER.setSize(window.innerWidth, window.innerHeight);
  g.RENDERER.setPixelRatio(g.DPI);
  document.body.appendChild(g.RENDERER.domElement);
  g.RENDERER.domElement.style.width = "100%";
  g.RENDERER.domElement.style.height = "100%";
  g.RENDERER.domElement.style.position = "absolute";
  g.RENDERER.domElement.style.top = "0";
  g.RENDERER.domElement.style.left = "0";
  g.RENDERER.domElement.style.zIndex = "-1";
  // disable cursor
  g.RENDERER.domElement.style.cursor = "none";
  // set image-rendering: pixelated;
  // g.RENDERER.domElement.style.imageRendering = "pixelated";

  // colorspace
  g.RENDERER.outputColorSpace = THREE.LinearSRGBColorSpace;

  //clock
  g.CLOCK = new THREE.Clock();

  // scene
  const scene = new THREE.Scene();
  g.SCENE = scene;

  // g.CAMERA
  g.CAMERA = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    g.CAMERA_FAR
  );
  g.CAMERA.rotation.order = "YXZ";
  scene.add(g.CAMERA);

  // octree
  g.OCTREE = new Octree();

  // orbit controls
  g.ORBIT_CONTROLS = new OrbitControls(g.CAMERA, g.RENDERER.domElement);
  g.ORBIT_CONTROLS.enableDamping = true;
  g.ORBIT_CONTROLS.dampingFactor = 0.25;
  g.ORBIT_CONTROLS.enableZoom = true;
  g.ORBIT_CONTROLS.enabled = false;

  // octree helper
  g.OCTREE_HELPER = new OctreeHelper(g.OCTREE);
  g.OCTREE_HELPER.visible = false;
  scene.add(g.OCTREE_HELPER);

  // world axes helper
  g.WORLD_AXES_HELPER = new THREE.AxesHelper(100);
  g.WORLD_AXES_HELPER.visible = false;
  g.WORLD_AXES_HELPER.material.depthTest = false;
  g.WORLD_AXES_HELPER.material.depthWrite = true;
  g.WORLD_AXES_HELPER.renderOrder = 999;
  g.WORLD_AXES_HELPER.material.fog = false;

  scene.add(g.WORLD_AXES_HELPER);

  // fog
  g.FOG = new THREE.Fog(g.FOG_COLOR, 1, 20);
  scene.fog = g.FOG;
  scene.background = new THREE.Color(g.FOG_COLOR);
  
  // scene.fog = new THREE.FogExp2( g.FOG_COLOR, 0.05 );

  // sky cubemap
  // let textureEquirec = new THREE.TextureLoader().load( './resources/3d/sky.jpg' );
  // textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
  // textureEquirec.colorSpace = THREE.SRGBColorSpace;
  // textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
  // scene.background = textureEquirec;

  // light
  const dirLight = new THREE.DirectionalLight(
    g.FOG_COLOR,
    g.LIGHTS.GLOBAL_DIRECTIONAL_INTENSITY
  );
  dirLight.position.set(0, 30, 0);
  scene.add(dirLight);
  g.LIGHTS.DIRECTIONAL = dirLight;

  // const hemiLight = new THREE.HemisphereLight(g.FOG_COLOR, 0x9e9e9e, 1);
  // scene.add(hemiLight);

  const ambientLight = new THREE.AmbientLight(
    g.FOG_COLOR,
    g.LIGHTS.GLOBAL_AMBIENT_INTENSITY
  );
  scene.add(ambientLight);
  g.LIGHTS.AMBIENT = ambientLight;

  // spotlight flashlight
  const spotLight = new THREE.SpotLight(
    0xffffff,
    g.LIGHTS.FLASHLIGHT_INTENSITY,
    10,
    Math.PI * 0.1,
    0.9,
    1
  );
  g.CAMERA.add(spotLight);
  g.CAMERA.add(spotLight.target);
  spotLight.visible = false;
  spotLight.target.position.z = -1;
  spotLight.position.y = 0;
  g.PLAYER.FLASHLIGHT = spotLight;

  // on press F toggle flashlight
  document.addEventListener("keydown", (event) => {
    if (event.code === "KeyF") {
      spotLight.visible = !spotLight.visible;
    }
  });


//   Raycaster
g.RAYCASTER = new THREE.Raycaster();
}
