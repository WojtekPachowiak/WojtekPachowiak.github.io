import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { g } from "./globals.js";
import * as THREE from "three";
import {createPS1Material} from "./materials.js";
import {initStaticColliders} from "./physics.js";


function processMesh(mesh){
  mesh.layers.set(g.LAYERS.DEFAULT);

  // console.log(mesh.position);
  // console.log(mesh.rotation);

  g.OBJECT_GROUPS.DECALABLES.push(mesh);
  // if (mesh.name === "land") {
  // }
  g.OBJECT_GROUPS.COLLIDABLES.push(mesh);
  // if (mesh.name !== "water") {
  // }
  if (mesh.name === "player") {
    g.OBJECT_GROUPS.INTERACTABLES.push(mesh);
  }

  mesh.castShadow = true; //default is false
  mesh.receiveShadow = true; //default

  // if it has a texture, then set it on the material
  let map;
  if (mesh.material && mesh.material.map) {
    // console.log(mesh.name, mesh.material);
    // console.log(mesh.name, "has", mesh.material.map);
    
    map = mesh.material.map.clone();

    // map.minFilter = THREE.NearestFilter;
    // map.magFilter = THREE.NearestFilter;
    // color space
    map.colorSpace = THREE.LinearSRGBColorSpace;
    const mat = createPS1Material();
    mat.map = map;
    map.minFilter = THREE.NearestFilter;
    map.magFilter = THREE.NearestFilter;
    // g.MATERIALS.PS1.map = map;
    mesh.material = mat;
    mesh.material.map = map;
    if (mesh.name.startsWith("oilspill")) {
      mesh.material.transparent = true;
      mesh.material.opacity = 0.5;
    }
    if (mesh.name.startsWith("water")) {
      // 2.*abs(x/1 - floor(x/1 +1/2) )
      const triangle_wave = (t,p) => {
        return 2 * Math.abs(t/p - Math.floor(t/p + 0.5));
      };

        // move mesh sinusoidally left and right to simulate waves
        (g.MAIN_LOOP_CALLBACKS["water_wave"] = () => {
          if (mesh.material.userData.shader) {
            mesh.material.userData.shader.uniforms.uTexOffset.value =
              new THREE.Vector2(
                g.TIME * 0.001,
                triangle_wave(g.TIME/10, 1) * 0.003
              );
          }

        });
    }

    // mat.needsUpdate = true;
  } else {
    mesh.material = g.MATERIALS.PS1;
  }

  // apply position and rotation transforms to geometry
  // mesh.geometry.applyMatrix4(mesh.matrix);
  // mesh.position.set(0, 0, 0);
  // mesh.rotation.set(0, 0, 0);
  // mesh.scale.set(1, 1, 1);
  // mesh.updateMatrix();
  // mesh.updateWorldMatrix();
  // console.log(mesh.position);
  // console.log(mesh.rotation);
}

// function getMeshesFromGroup(group){
//   let meshes = [];
//   group.children.forEach((child) => {
//     if (child.isMesh) {
//       meshes.push(child);
//     }
//     if (child.isGroup) {
//       meshes = meshes.concat(getMeshesFromGroup(child));
//     }
//   });
//   return meshes;
// }

export function init3DModels() {
  // 3d models
  const loader = new GLTFLoader();

  // // Optional: Provide a DRACOLoader instance to decode compressed mesh data
  // const dracoLoader = new DRACOLoader();
  // dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
  // loader.setDRACOLoader( dracoLoader );

  loader.load(
    "./assets/island_scene.glb",
    function (gltf) {
      gltf.scene.traverse(function (child) {
        // console.log(child.name);
        
        child.updateWorldMatrix(true, true);
        child.updateMatrixWorld(true);
        
        if (child.isMesh) {
          processMesh(child);
        }

        // if (child.isGroup) {
        //   const meshes = getMeshesFromGroup(child);
        //   meshes.forEach((m) => {
        //     processMesh(m);
        //   });
        // }
      });

      g.SCENE.add(gltf.scene);
      initStaticColliders();
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
      console.log("An error happened while loading:", error);
    }
  );
}
