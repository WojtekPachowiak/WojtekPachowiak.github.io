import * as THREE from "three";
import shader from "./assets/shaders/rainbow.glsl?raw";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(
  window.innerWidth,
  window.innerHeight,
  window.devicePixelRatio
);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const plane_geometry = new THREE.PlaneGeometry();
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
  fragmentShader: shader,
});
const plane_mesh = new THREE.Mesh(plane_geometry, plane_material);
plane_mesh.scale.set(window.innerWidth / window.innerHeight, 1, 1);
scene.add(plane_mesh);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.001,
  1000
);
camera.position.set(0, 0, 1);
scene.add(camera);

window.onresize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(
    window.innerWidth,
    window.innerHeight,
    window.devicePixelRatio
  );
  plane_mesh.scale.set(window.innerWidth / window.innerHeight, 1, 1);
  plane_material.uniforms.resolution.value = new THREE.Vector2(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio
  );
};

// text
function drawItem(text, positionY) {
  const loader = new FontLoader();
  loader.load(
    "/assets/fonts/helvetiker_regular.typeface.json",
    function (response) {
      let font = response;
      let textGeo = new TextGeometry(text, {
        size: 0.1,
        height: 0.0,
        font: font,

        //   curveSegments: 12,
      });
      textGeo.computeBoundingBox();
      const centerOffset =
        -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

      //   const mat = plane_material.clone();
      //     mat.uniforms = {
      //       time: { value: 100 },
      //       resolution: {
      //         value: new THREE.Vector2(
      //           window.innerWidth * window.devicePixelRatio * 0.01,
      //           window.innerHeight * window.devicePixelRatio * 0.01
      //         ),
      //       },
      //     };

      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
      });

      let mesh = new THREE.Mesh(textGeo, mat);

      mesh.position.set(centerOffset - 0.3, positionY, 0.4);
      mesh.lookAt(camera.position);
      //   mesh.rotation.set(0.4, 0.0, 0.0);
      mesh.scale.set(1.5, 0.7, 1);
      mesh.type = "text";
      scene.add(mesh);
    }
  );
}

drawItem("ART", 0.1);
drawItem("ABT", 0);
drawItem("HOR", -0.1);

// oribtal controls
// const controls = new OrbitControls(camera, renderer.domElement);

function remap(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

// light
const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
dirLight.position.set(0, 0, 1).normalize();
scene.add(dirLight);
// hemispheric
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
hemiLight.position.set(0, 0, 1);
scene.add(hemiLight);

const start = Date.now() / 1000;
function animate() {
  requestAnimationFrame(animate);
  plane_material.uniforms.time.value = Date.now() / 1000 - start;

  //  update position of each text
  scene.children.forEach((child) => {
    if (child.type == "text") {
      child.position.y +=
        Math.sin(child.id + Date.now() / 1000 - start) * 0.00001;
      child.lookAt(camera.position);
      child.scale.x = remap(
        Math.sin(child.id + Date.now() / 1000 - start),
        -1,
        1,
        1,
        1.05
      );
      child.scale.y = remap(
        Math.sin(child.id + Date.now() / 1000 - start),
        -1,
        1,
        0.6,
        0.7
      );
    }
  });

  renderer.render(scene, camera);
}
animate();

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
