import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { g } from "./globals.js";
import * as THREE from "three";
import { VertexNormalsHelper } from "three/addons/helpers/VertexNormalsHelper.js";


export function init3DModels() {
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
          child.layers.set(g.LAYERS.DEFAULT);
          if (child.name === "land") {
            g.OBJECT_GROUPS.DECALABLES.push(child);
            // set layer
            
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
            map.colorSpace = THREE.LinearSRGBColorSpace;
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
