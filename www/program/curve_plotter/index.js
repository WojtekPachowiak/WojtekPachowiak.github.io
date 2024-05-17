import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// Import the necessary three.js modules

// Create a scene
const scene = new THREE.Scene();

// set background
scene.background = new THREE.Color(0x2c2c2c);

// Create a renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, -3, 2);
camera.up.set(0, 0, 1);


// Create a controls object
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.target.set(0, 0, 0);

const DT = 0.1;

// define curve
const curve = (t) => new THREE.Vector3(Math.cos(t) * Math.cos(t), Math.cos(t)*Math.sin(t), Math.sin(t));

function getAttribute(func, t, mode){
    const dt = DT;

    // p_der1 = (func(t+dt) - func(t)) / dt
    const p_der1 = func(t + dt).clone().sub(func(t)).divideScalar(dt);
    // p_der2 = (func(t+dt) - 2*func(t) + func(t-dt)) / dt^2
    const p_der2 = func(t + dt).clone().sub(func(t)).sub(func(t - dt)).divideScalar(dt*dt);
    // p_der3 = (func(t+2*dt) - 2*func(t+dt) + 2*func(t-dt) - func(t-2*dt)) / (2*dt^3)
    const p_der3 = func(t + 2*dt).clone().sub(func(t + dt)).multiplyScalar(2).sub(func(t - dt)).sub(func(t - 2*dt)).divideScalar(2*dt*dt*dt);

    if (mode === 'curvature'){
        // curvature = |p_der1 x p_der2| / |p_der1|^3
        const curvature = p_der1.clone().cross(p_der2).length() / Math.pow(p_der1.length(), 3);
        console.log(curvature);
        return curvature;
    }
    else if (mode === 'torsion'){
        // torsion = (p_der1 x p_der2) . p_der3 / |p_der1 x p_der2|^2
        const torsion = p_der1.clone().cross(p_der2).dot(p_der3) / Math.pow(p_der1.clone().cross(p_der2).length(), 2);
        return torsion;
    }
    
}

// Create a geometry
const range = [-10, 10];
const dist = range[1] - range[0];
let num_points = dist / DT;
let points = [];
let attributes = [];
for (let i = 0; i < num_points; i++) {
    const t = range[0] + (i / num_points) * dist;
    points.push(curve(t));
    const attr = getAttribute(curve, t, "curvature");
    attributes.push(attr);
}



function initFrenetFrame(){
    const frenetFrame = new THREE.Group();
    const pos = new THREE.Vector3(0, 0, 0);
    const TArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), pos, 0.5, 0xff0000);
    const NArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), pos, 0.5, 0x00ff00);
    const BArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), pos, 0.5, 0x0000ff);
    frenetFrame.userData = { T: TArrow, N: NArrow, B: BArrow };
    frenetFrame.add(TArrow);
    frenetFrame.add(NArrow);
    frenetFrame.add(BArrow);
    scene.add(frenetFrame);
    return frenetFrame;
}

const FRENET_FRAME = initFrenetFrame();

function updateFrenetFrame(t){
    const p = curve(t);
    const dt = DT;
    const p1 = curve(t + dt);
    const p2 = curve(t - dt);
    // const T = p1.clone().sub(p2).normalize();
    // const N = new THREE.Vector3(-T.y, T.x, 0).normalize();
    // const B = T.clone().cross(N).normalize();

    // p_der1 = (curve(t+dt) - curve(t)) / dt
    const p_der1 = curve(t + dt).clone().sub(curve(t)).divideScalar(dt);
    // p_der2 = (curve(t+dt) - 2*curve(t) + curve(t-dt)) / dt^2
    const p_der2 = curve(t + dt).clone().sub(curve(t)).sub(curve(t - dt)).divideScalar(dt*dt);
    // p_der3 = (curve(t+2*dt) - 2*curve(t+dt) + 2*curve(t-dt) - curve(t-2*dt)) / (2*dt^3)
    const p_der3 = curve(t + 2*dt).clone().sub(curve(t + dt)).multiplyScalar(2).sub(curve(t - dt)).sub(curve(t - 2*dt)).divideScalar(2*dt*dt*dt);

    const T = p_der1.clone().normalize();
    const B = p_der1.clone().cross(p_der2).divideScalar(p_der1.clone().cross(p_der2).length());
    const N = B.clone().cross(T).normalize();

    FRENET_FRAME.position.copy(p);
    FRENET_FRAME.userData.T.setDirection(T);
    FRENET_FRAME.userData.N.setDirection(N);
    FRENET_FRAME.userData.B.setDirection(B);
}



const geometry = new THREE.BufferGeometry().setFromPoints(points);

const color = new Float32Array(num_points * 3);
const colorRange = [null, null];
colorRange[0] = Math.min(...attributes);
colorRange[1] = Math.max(...attributes);
for (let i = 0; i < num_points; i++) {
    const c = new THREE.Color(0xffffff);
    c.setHSL(0,(attributes[i] - colorRange[0]) / (colorRange[1] - colorRange[0]), 0.5);
    c.toArray(color, i * 3);

}
geometry.setAttribute('color', new THREE.BufferAttribute(color, 3));

// Create a material
const material = new THREE.LineBasicMaterial({ color:  0xffffff, vertexColors: true });

// Create a line based on the geometry and material
const line = new THREE.Line(geometry, material);

// Add the line to the scene
scene.add(line);

// draw grid
const size = 10;
const grid = new THREE.GridHelper(size, size, 0xffffff, 0xffffff);
grid.material.opacity = 0.2;
grid.material.transparent = true;
grid.rotation.x = Math.PI / 2;
// grid.position.z = -0.01;
scene.add(grid);



// draw axes
const axes = new THREE.AxesHelper(50);
axes.material.opacity = 0.2;
axes.material.transparent = true;
axes.position.z = -0.01;
scene.add(axes);



// Resize the renderer when the window is resized
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();
});


// Animation loop
function animate(now) {
  requestAnimationFrame(animate);

  // Update the frenet frame (time between range[0] and range[1])
  updateFrenetFrame(range[0] + (now/500 % dist));

  // Render the scene with the camera
  renderer.render(scene, camera);
  controls.update();
}

// Start the animation loop
animate();