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

  loader.load(
    "./assets/island_scene.glb",
    function (gltf) {
      gltf.scene.traverse(function (child) {
        // console.log(child.name);
        if (child.isMesh) {
          child.layers.set(g.LAYERS.DEFAULT);

          if (child.name === "land") {
            g.OBJECT_GROUPS.DECALABLES.push(child);
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
            // g.MATERIALS.PS1.map = map;
            child.material = mat;
            child.material.map = map;
          } else {
            child.material = g.MATERIALS.PS1;
          }

        }
      });

      g.SCENE.add(gltf.scene);

      // iterate over children and add to physical world
      for (let obj of g.OBJECT_GROUPS.COLLIDABLES) {
          const geometry = obj.geometry;
          let colliderDesc = g.PHYSICS.RAPIER.ColliderDesc.trimesh(
            geometry.attributes.position.array,
            geometry.index.array
          );
          g.PHYSICS.WORLD.createCollider(colliderDesc);
          const rigidBody = g.PHYSICS.WORLD.createRigidBody(
            g.PHYSICS.RAPIER.RigidBodyDesc.fixed()
          );
          g.PHYSICS.WORLD.createCollider(colliderDesc, rigidBody);

          
          // translate, scale and rotate the collider to match the object
          rigidBody.setTranslation({x: obj.position.x, y: obj.position.y, z: obj.position.z}, true);
          rigidBody.setRotation({w: obj.quaternion.w, x: obj.quaternion.x, y: obj.quaternion.y, z: obj.quaternion.z}, true);

          // save reference
          obj.userData.rigidBody = rigidBody;
      }

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
