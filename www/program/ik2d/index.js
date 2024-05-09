import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import Font from './helvetiker_bold.typeface.json?url';
import {g} from './globals.js';
import { IKArm } from './ik_arm.js';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export async function initThree() {

    g.DPI = 1;
  const canvas = document.getElementById("canvas3d");
  g.RENDERER = new THREE.WebGLRenderer({ antialias: true, canvas: canvas});
  g.RENDERER.setSize(window.innerWidth, window.innerHeight);
  g.RENDERER.setPixelRatio(g.DPI);

  // colorspace
  g.RENDERER.outputColorSpace = THREE.LinearSRGBColorSpace;

  // scene
  const scene = new THREE.Scene();
  g.SCENE = scene;
  g.SCENE.background = new THREE.Color(0xfffced);

  // g.CAMERA
  g.CAMERA = new THREE.OrthographicCamera( -1, 1, 1, -1, 0.1,10 );
  g.CAMERA.position.set(0, 0, 1);
  scene.add(g.CAMERA);
  
  // mouse pointer (yellow circle)
    g.MOUSE_POS = new THREE.Vector2();
    const mousePointer = new THREE.Mesh(
        new THREE.CircleGeometry(0.05, 32),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    scene.add(mousePointer);
    g.MOUSE_POINTER = mousePointer;

    //grid
    const gridSize = 5;
    const grid = new THREE.GridHelper(1*gridSize, 10*gridSize, 0xffffff, 0xffffff);
    // grid.material.opacity = 0.5;
    // grid.material.transparent = true;
    grid.position.set(0, 0, -1); // move grid to the back
    grid.rotation.x = Math.PI / 2; // rotate grid to face camera
    scene.add(grid);

    // font
    const loader = new FontLoader();
    g.FONT = await loader.loadAsync(Font);

    // axes
    const axes = new THREE.AxesHelper(10);
    axes.material.opacity = 0.3;
    axes.material.transparent = true;
    scene.add(axes);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function animate(now) {
    //// calculate delta time
    now = now || 0;
    g.DELTA_TIME = (now - (g.LAST_TIME || now))/1000;
    // // render every 1 second
    // if (g.DELTA_TIME < 1) {
    //     requestAnimationFrame(animate);
    //     return;
    // }
    g.LAST_TIME = now;
        
    //// update mouse pointer position
    g.MOUSE_POINTER.position.set(g.MOUSE_POS.x, g.MOUSE_POS.y, 0);
    
    //// update arm
    // g.ARM.reachAnalytic(new THREE.Vector3(g.MOUSE_POS.x, g.MOUSE_POS.y, 0));
    // g.ARM.reachCCD(new THREE.Vector3(g.MOUSE_POS.x, g.MOUSE_POS.y, 0));
    g.ARM.reachFABRIK(new THREE.Vector3(g.MOUSE_POS.x, g.MOUSE_POS.y, 0));

    // g.ARM.stretchTowards(new THREE.Vector3(g.MOUSE_POS.x, g.MOUSE_POS.y, 0));

    g.RENDERER.render(g.SCENE, g.CAMERA);
    requestAnimationFrame(animate);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

g.DELTA_TIME = 0;
g.LAST_TIME = 0.01;
await initThree();
const lengths = Array(10).fill(0.2);
// const lengths = [0.3, 0.3,0.2,0.2,0.2,0.1]
const arm = new IKArm(lengths);
arm.fixedRoot = false;
g.ARM = arm;
g.SCENE.add(arm);
animate();


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//// on resize screen
function onResize() {
    g.RENDERER.setSize(window.innerWidth, window.innerHeight);
    g.ASPECT_RATIO = window.innerWidth / window.innerHeight;
    // set orthographic camera aspect ratio
    g.CAMERA.left = -g.ASPECT_RATIO;
    g.CAMERA.right = g.ASPECT_RATIO;
    g.CAMERA.top = 1;
    g.CAMERA.bottom = -1;

    g.CAMERA.updateProjectionMatrix();
}
onResize();
window.addEventListener('resize', onResize);

//// get mouse position in normalized device coordinates
function getNDCCoords(event) {
    let x = (event.clientX / window.innerWidth) * 2 - 1;
    x *= g.ASPECT_RATIO;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    g.MOUSE_POS.set(x, y);
}
document.addEventListener('mousemove', getNDCCoords);
