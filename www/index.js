import * as THREE from "three";
import backgroundShader from "./resources/shaders/indexbackground.glsl?raw";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import WebGL from "three/addons/capabilities/WebGL.js";

// import headersFont from "/resources/fonts/Mental Health Demo_Regular?url";
// import headersFont from "/resources/fonts/Essential Economy Demo_Bold?url";
// import headersFont from "/resources/fonts/GHOAS_Regular?url";
// import headersFont from "/resources/fonts/Bavex_Regular?url";
// import headersFont from "/resources/fonts/Raleway_Light?url";
import headersFont from "/resources/fonts/Fira Mono_Regular?url";
// import headersFont from "/resources/fonts/Fira Mono Medium_Regular?url";


let globalYOffset = 0.6;
let uppercase = false;
let rot = [0.0, 0.0, 0.0];
let opacity = 1.;
let fontSize = 0.1;



// if mobile device
if (matchMedia("(pointer:coarse)").matches) {
  alert("Mobile devices not supported. Sorry! Only desktop :(");
  throw "Mobile devices not supported. Sorry! Only desktop :(";
}

if (WebGL.isWebGL2Available() === false) {
  document.body.appendChild(WebGL.getWebGL2ErrorMessage());
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


// renderer.autoClear = false;
function animate() {
  requestAnimationFrame(animate);

  plane_material.uniforms.time.value = performance.now() / 1000 +0;


  renderer.clear();
  renderer.render(scene, camera);
}
animate();




// onresize
function updateViewport() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(
    window.innerWidth,
    window.innerHeight,
    window.devicePixelRatio
  );

}
window.onresize = updateViewport;
