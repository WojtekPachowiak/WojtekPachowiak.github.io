import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { g } from "./globals.js";
import * as THREE from "three";
import {createPS1Material} from "./materials.js";
import {initStaticColliders} from "./physics.js";
import { findSound } from "./audio.js";
import {triangleWave} from "./utils.js";

function processSoundEmitter(object3d){
  // remove suffix and ignore last 3 digits
  const soundName = object3d.name.split("__")[1].slice(0, -3);
    const sound = findSound(soundName);
    object3d.visible = false;
    object3d.userData.sound = sound;
    console.log(object3d);

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function specialMeshProcessing(mesh){


  //// WATER
  if (mesh.name == "WATER"){
    // move mesh sinusoidally left and right to simulate waves
    g.MAIN_LOOP_CALLBACKS["water_wave"] = () => {
      if (mesh.material.userData.shader) {
        mesh.material.userData.shader.uniforms.uTexOffset.value =
          new THREE.Vector2(
            g.TIME * 0.001,
            triangleWave(g.TIME / 10, 1) * 0.003
          );
      }
    };
  }

  //// OILSPILL
  if (mesh.name.startsWith("oilspill")) {
    mesh.material.transparent = true;
    mesh.material.opacity = 0.5;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function processMesh(mesh){
  mesh.layers.set(g.LAYERS.DEFAULT);

  g.OBJECT_GROUPS.DECALABLES.push(mesh);
  g.OBJECT_GROUPS.COLLIDABLES.push(mesh);
  if (mesh.name === "player") {
    g.OBJECT_GROUPS.INTERACTABLES.push(mesh);
  }

  //// set shadow properties
  mesh.castShadow = true; 
  mesh.receiveShadow = true; 

  //// if it has a texture, then create a new material with the texture
  if (mesh.material && mesh.material.map) {
    const map = mesh.material.map.clone();

    //// set color space and texture properies
    map.colorSpace = THREE.LinearSRGBColorSpace;
    map.minFilter = THREE.NearestFilter;
    map.magFilter = THREE.NearestFilter;

    //// create a new material with the texture
    const mat = createPS1Material();
    mat.map = map;

    //// set material properties on the mesh
    mesh.material = mat;
    mesh.material.map = map;

    //// try to apply special processing depending on the mesh name
    specialMeshProcessing(mesh);

  } 
  //// if it has no texture, then simply use the default material
  else {
    mesh.material = g.MATERIALS.PS1;
  }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


export function init3DModels() {
  const loader = new GLTFLoader();

  //// load main scene (containing all the objects)
  loader.load(
    "./assets/island_scene.glb",
    function (gltf) {
      gltf.scene.traverse(function (child) {

        //// update world matrix so that global position independent of parents can be accessed
        child.updateWorldMatrix(true, true);
        child.updateMatrixWorld(true);
        
        if (child.name.startsWith("SOUND__")) {
          processSoundEmitter(child);
        }
        
        if (child.isMesh) {
          processMesh(child);
        }
      });

      g.SCENE.add(gltf.scene);
      initStaticColliders();
    },
    // eslint-disable-next-line no-unused-vars
    function (xhr) {
      // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
      alert("An error happened while loading the 3D models!", error);
    }
  );
}
