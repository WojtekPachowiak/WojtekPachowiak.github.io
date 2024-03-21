import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { g } from "./globals.js";
import * as THREE from "three";
import {createPS1Material} from "./materials.js";



function processMesh(mesh){
  mesh.layers.set(g.LAYERS.DEFAULT);

  // console.log(mesh.position);
  // console.log(mesh.rotation);

  if (mesh.name === "land") {
    g.OBJECT_GROUPS.DECALABLES.push(mesh);
  }
  if (mesh.name !== "water") {
    g.OBJECT_GROUPS.COLLIDABLES.push(mesh);
  }
  if (mesh.name === "player") {
    g.OBJECT_GROUPS.INTERACTABLES.push(mesh);
  }

  // if it has a texture, then set it on the material
  let map;
  if (mesh.material.map) {
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
  } else {
    mesh.material = g.MATERIALS.PS1;
  }
}

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
        console.log(child);

        if (child.isMesh) {
          processMesh(child);
        }

        if (child.isGroup) {
          child.children.forEach((c) => {
            // 
            processMesh(c);
          });
        }
      });

      g.SCENE.add(gltf.scene);
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
      console.log("An error happened while loading:", error);
    }
  );
}
