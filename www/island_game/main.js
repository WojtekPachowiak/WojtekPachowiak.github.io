import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Octree } from "three/addons/math/Octree.js";
import { OctreeHelper } from "three/addons/helpers/OctreeHelper.js";
// import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";
import { g } from "./globals.js";
import { snowflakesInit, snowflakesUpdate } from "./snowflakes.js";
import { initMaterials } from "./materials.js";
import { playerUpdate, initPlayer } from "./player.js";
import { initDebugHelpers } from "./debug_helpers.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { initText } from "./text.js";
import {
  initPostProcessing,
} from "./postprocessing.js";


// create GUI
// const gui = new GUI({ width: 300 });
// gui.add(params.uniforms.warpRadius, "value").min(0).max(1).step(0.01).name("warpRadius").listen();
// gui.add(params.uniforms.warpStrength, "value").min(-5).max(5).step(0.01).name("warpStrength").listen();
// gui.add(params.uniforms.checkerSize, "value").min(1).max(100).step(1).name("checkerSize").listen();
// gui.add(params, "mouseDamp").min(0.9).max(1).step(0.001).name("mouseDamp").listen();
// // gui.add(params, "mouseWheelStrengthSpeed").min(0.0001).max(0.01).step(0.0001).name("mouseWheelStrengthSpeed").listen();
// // gui.add(params, "mouseWheelRadiusSpeed").min(0.0001).max(0.01).step(0.0001).name("mouseWheelRadiusSpeed").listen();
// gui.add(params, "afterimageDamp").min(0.1).max(1).step(0.001).name("afterimageDamp").listen();
// // choose texture
// const texFolder = gui.addFolder("Texture");
// texFolder.add(params.uniforms.tex, "value", params.textures).name("tex").listen();
// texFolder.open();

if (WebGL.isWebGL2Available() === false) {
  document.body.appendChild(WebGL.getWebGL2ErrorMessage());
}

initThree();
initMaterials();
init3DModels();
initPlayer();
initText();
snowflakesInit();
initPostProcessing();
updateViewport();
initDebugHelpers();
animate();

function initThree() {
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
  // set image-rendering: pixelated;
  // g.RENDERER.domElement.style.imageRendering = "pixelated";

  // colorspace
  g.RENDERER.outputColorSpace = THREE.LinearSRGBColorSpace ;

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
  // scene.fog = new THREE.FogExp2( g.FOG_COLOR, 0.05 );

  // sky cubemap
  // let textureEquirec = new THREE.TextureLoader().load( './resources/3d/sky.jpg' );
  // textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
  // textureEquirec.colorSpace = THREE.SRGBColorSpace;
  // textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
  // scene.background = textureEquirec;

  // light
  const dirLight = new THREE.DirectionalLight(g.FOG_COLOR, g.LIGHTS.GLOBAL_DIRECTIONAL_INTENSITY);
  dirLight.position.set(0, 30, 0);
  scene.add(dirLight);
  g.LIGHTS.DIRECTIONAL = dirLight;

  // const hemiLight = new THREE.HemisphereLight(g.FOG_COLOR, 0x9e9e9e, 1);
  // scene.add(hemiLight);

  const ambientLight = new THREE.AmbientLight(g.FOG_COLOR, g.LIGHTS.GLOBAL_AMBIENT_INTENSITY);
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
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function init3DModels() {
  // 3d models
  const loader = new GLTFLoader();

  // // Optional: Provide a DRACOLoader instance to decode compressed mesh data
  // const dracoLoader = new DRACOLoader();
  // dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
  // loader.setDRACOLoader( dracoLoader );

  // Load a glTF resource
  loader.load(
    // resource URL
    "./assets/island_scene.glb",
    // called when the resource is loaded
    function (gltf) {
      // traverse and assign standard material
      gltf.scene.traverse(function (child) {
        console.log(child.name);

        if (child.isMesh) {
          if (child.name === "land") {
            g.OBJECT_GROUPS.DECALABLES.push(child);
            // set layer
            // child.layers.set(2);
          }
          if (child.name !== "water") {
            g.OBJECT_GROUPS.COLLIDABLES.push(child);
          }
          if (child.name === "player") {
            g.OBJECT_GROUPS.INTERACTABLES.push(child);
          }

          // if it has a texture, then set it on the material
          let map;
          if (child.material.map) {
            console.log(child.name, "has", child.material.map);
            map = child.material.map.clone();
            map.minFilter = THREE.NearestFilter;
            map.magFilter = THREE.NearestFilter;
            // color space
            map.encoding = THREE.LinearEncoding;
            const mat = g.MATERIALS.PS1.clone();
            mat.map = map;
            map.minFilter = THREE.NearestFilter;
            map.magFilter = THREE.NearestFilter;
            g.MATERIALS.PS1.map = map;
            child.material = g.MATERIALS.PS1;
          } else {
            child.material = g.MATERIALS.PS1;
          }

          if (map) {
            child.material.map = map;
          }

          
        }
      });
      console.log(gltf.scene);
      g.SCENE.add(gltf.scene);

      // add to octree, but exclude "water" object
      console.log(gltf);
      let s = gltf.scene.clone();
      s.children = s.children.filter((child) => child.name !== "water");
      g.OCTREE.fromGraphNode(s);
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened:", error);
    }
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// MAIN LOOP
function animate() {
  requestAnimationFrame(animate);

  g.DELTA_TIME = Math.min(0.05, g.CLOCK.getDelta());

  g.TIME = performance.now() / 1000 + 0;

  playerUpdate(g.DELTA_TIME);
  snowflakesUpdate(g.DELTA_TIME);

  let intersection = mouseIntersection(g.OBJECT_GROUPS.INTERACTABLES);
  if (intersection && intersection.distance < 2) {
    // change pointer image
    document.body.style.cursor = "pointer";
  } else {
    document.body.style.cursor = "default";
  }

  // call all main loop callbacks (its a dict of functions)
  for (let key in g.MAIN_LOOP_CALLBACKS) {
    g.MAIN_LOOP_CALLBACKS[key]();
  }

  updateCutscene();

  // g.RENDERER.clear();
  //g.RENDERER.render(scene, g.CAMERA);
  // if (f % RENDER_EVERY_N_FRAME === 0)
  if (g.TIME_SINCE_LAST_FRAME > 1 / g.FPS) {
    render();
    g.TIME_SINCE_LAST_FRAME = 0;
  } else {
    g.TIME_SINCE_LAST_FRAME += g.DELTA_TIME;
  }

  // controls.update( clock.getDelta() );
}


// const clearColor = new THREE.Color(0xc22929);
g.RENDERER.autoClear = false;
g.RENDERER.setClearColor(0xf700ff, 0.0);

function render(){
  g.CAMERA.layers.set(0);
  g.SCENE.background = new THREE.Color(g.FOG_COLOR);
  // // g.RENDERER.clear();
  // // fog
  // g.RENDERER.setClearColor(g.FOG_COLOR, 1.0);
  // // render to texture and pass this texture to the next pass
  g.POSTPROCESSING_COMPOSERS.MAIN.render();
  // // g.RENDERER.clearDepth();
  
  g.CAMERA.layers.set(1);
  g.SCENE.background = null;
  // g.RENDERER.clear(true, false, false);
  g.POSTPROCESSING_COMPOSERS.UI.render();
  


// g.RENDERER.render(g.SCENE, g.CAMERA);
}

function updateCutscene() {
  if (g.CUTSCENE.ACTIVE) {
    g.PLAYER.CONTROL_TYPE = "CUTSCENE";
    g.CUTSCENE.BLACK_BARS_T += g.CUTSCENE.BLACK_BARS_SPEED * g.DELTA_TIME;
    if (g.CUTSCENE.BLACK_BARS_T > g.CUTSCENE.BLACK_BARS_HEIGHT) {
      g.CUTSCENE.BLACK_BARS_T = g.CUTSCENE.BLACK_BARS_HEIGHT;
    }

    if (g.CUTSCENE.BLACK_BARS_T >= g.CUTSCENE.BLACK_BARS_HEIGHT) {
      g.CUTSCENE.TIME += g.DELTA_TIME;

      if (
        g.CUTSCENE.DATA.CURRENT_KEYFRAME + 1 < g.CUTSCENE.DATA.TEXT.length &&
        g.CUTSCENE.TIME >
          g.CUTSCENE.DATA.TIMES[g.CUTSCENE.DATA.CURRENT_KEYFRAME + 1]
      ) {
        g.CUTSCENE.DATA.CURRENT_KEYFRAME += 1;
        g.CUTSCENE.TEXT =
          g.CUTSCENE.DATA.TEXT[g.CUTSCENE.DATA.CURRENT_KEYFRAME];
          g.CAMERA.position.copy(
            g.CUTSCENE.DATA.CAMERA_POSITIONS[g.CUTSCENE.DATA.CURRENT_KEYFRAME]
            );
            console.log(
              g.CUTSCENE.DATA.CAMERA_TARGETS[g.CUTSCENE.DATA.CURRENT_KEYFRAME]
              );
              console.log(g.CAMERA.rotation);
        g.CAMERA.lookAt(
          g.CUTSCENE.DATA.CAMERA_TARGETS[g.CUTSCENE.DATA.CURRENT_KEYFRAME]
        );
        console.log(
          g.CUTSCENE.DATA.CAMERA_TARGETS[g.CUTSCENE.DATA.CURRENT_KEYFRAME]
        );
        console.log(g.CAMERA.rotation);

        console.log(g.CUTSCENE.TEXT);
      }

      if (g.CUTSCENE.TIME > g.CUTSCENE.DATA.DURATION) {
        console.log("cutscene ended");
        g.CUTSCENE.ACTIVE = false;
        g.CUTSCENE.TIME = 0;
        g.CUTSCENE.DATA.CURRENT_KEYFRAME = -1;
      }
    }
  } else {
    g.CUTSCENE.BLACK_BARS_T -= g.CUTSCENE.BLACK_BARS_SPEED * g.DELTA_TIME;
    if (g.CUTSCENE.BLACK_BARS_T <= 0) {
      g.CUTSCENE.BLACK_BARS_T = 0;
    }
    g.PLAYER.CONTROL_TYPE = "FPS";
  }
  g.POSTPROCESSING_PASSES.PS1.uniforms.uBlackBarsT.value =
    g.CUTSCENE.BLACK_BARS_T;
}

////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("keydown", (event) => {
  g.KEY_STATES[event.code] = true;
});

document.addEventListener("keyup", (event) => {
  g.KEY_STATES[event.code] = false;
});

document.addEventListener("mousedown", () => {
  // document.body.requestPointerLock();
});

document.addEventListener("mouseup", () => {
  // if ( document.pointerLockElement !== null ) throwBall();
});

// document.body.addEventListener( 'mousemove', ( event ) => {
//     if ( document.pointerLockElement === document.body ) {
//         g.CAMERA.rotation.y -= event.movementX * playerMouseSensitivity * deltaTime;
//         g.CAMERA.rotation.x -= event.movementY * playerMouseSensitivity * deltaTime;

//         g.CAMERA.rotation.x = Math.max( - Math.PI / 2, Math.min( Math.PI / 2, g.CAMERA.rotation.x ) );

//     }

// } );

// let mouseHelper = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 10 ), new THREE.MeshNormalMaterial() );
// mouseHelper.visible = false;
// scene.add( mouseHelper );

document.addEventListener("mousemove", (event) => {
  g.MOUSE.x = (event.clientX / g.RENDERER.domElement.clientWidth) * 2 - 1;
  g.MOUSE.y = -(event.clientY / g.RENDERER.domElement.clientHeight) * 2 + 1;
});

window.addEventListener("pointerup", function () {
  let intersection;

  intersection = mouseIntersection(g.OBJECT_GROUPS.DECALABLES);

  if (intersection) {
    projectDecal(intersection);
  }
});

function mouseIntersection(objects) {
  g.RAYCASTER.setFromCamera(g.MOUSE, g.CAMERA);

  const intersects = g.RAYCASTER.intersectObjects(objects, false);

  // get the closest intersection
  return intersects.length > 0 ? intersects[0] : null;
}

function projectDecal(intrsct) {

  // get the interseted mesh from intrsct
  const mesh = intrsct.object;

  const pos = intrsct.point;
  const normal = intrsct.face.normal;

  const projectorOrientation = new THREE.Euler().setFromVector3(
    new THREE.Vector3().copy(normal).negate()
  );
  const size = new THREE.Vector3(1, 1, 1);

  const decalMaterial = new THREE.MeshStandardMaterial({
    // map: baseMap,
    // normalMap: normalMap,
    color: 0xffffff,
    depthTest: true,
    depthWrite: false,
    normalScale: new THREE.Vector2(1, 1),
    polygonOffset: true,
    polygonOffsetFactor: -4,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const geometry = new DecalGeometry(
    mesh,
    pos.clone(),
    projectorOrientation,
    size
  );
  const m = new THREE.Mesh(geometry, decalMaterial);
  g.SCENE.add(m);
}

// onresize
function updateViewport() {
  g.CAMERA.aspect = window.innerWidth / window.innerHeight;
  g.CAMERA.updateProjectionMatrix();
  
  g.SCREEN.RESOLUTION.set(
    g.SCREEN.TARGET_Y_RESOLUTION * g.CAMERA.aspect,
    g.SCREEN.TARGET_Y_RESOLUTION
    );
    
    g.POSTPROCESSING_PASSES.PS1.uniforms.uResolution.value = g.SCREEN.RESOLUTION;
    if (g.MATERIALS.PS1.userData.shader) {
      g.MATERIALS.PS1.userData.shader.uniforms.uResolution.value = g.SCREEN.RESOLUTION;
    }
    
    g.RENDERER.setSize(window.innerWidth, window.innerHeight);
    g.RENDERER.setPixelRatio(g.DPI);
}
window.onresize = updateViewport;
