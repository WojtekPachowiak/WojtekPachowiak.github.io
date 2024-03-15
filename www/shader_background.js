import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";


let dpi = 1;

export function initBackground(shader, canvas) {
  // if mobile device

  if (WebGL.isWebGL2Available() === false) {
    document.body.appendChild(WebGL.getWebGL2ErrorMessage());
  }

  // renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas});
  renderer.setSize(window.innerWidth, window.innerHeight, dpi);
  renderer.setPixelRatio(dpi);
  document.body.appendChild(renderer.domElement);
  // renderer.domElement.style.width = "100%";
  // absolute position
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.zIndex = "-1";

  const aspect = window.innerWidth / window.innerHeight;

  // scene
  const scene = new THREE.Scene();
  // shader background
  const plane_geometry = new THREE.PlaneGeometry(aspect * 2, 2);
  const plane_material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 1 },
      uResolution: {
        value: new THREE.Vector2(
          window.innerWidth * dpi,
          window.innerHeight * dpi
        ),
      },
    },
    fragmentShader: shader,
  });
  plane_material.depthWrite = false;
  const plane_mesh = new THREE.Mesh(plane_geometry, plane_material);
  scene.add(plane_mesh);
  // camera
  const camera = new THREE.OrthographicCamera(
    -aspect,
    aspect,
    1,
    -1,
    0.001,
    1000
  );
  camera.position.set(0, 0, 1);
  scene.add(camera);
  // main animate loop
  function animate() {
    requestAnimationFrame(animate);

    plane_material.uniforms.uTime.value = performance.now() / 1000;

    renderer.clear();
    renderer.render(scene, camera);
  }
  animate();

  // onresize
  function updateViewport() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // plane_mesh.scale.set(window.innerWidth / window.innerHeight, 1, 1);
    plane_material.uniforms.uResolution.value = new THREE.Vector2(
      window.innerWidth * dpi,
      window.innerHeight * dpi
    );
  }
  window.onresize = updateViewport;
}
