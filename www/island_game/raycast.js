import { g } from "./globals.js";
import * as THREE from "three";

export function screenspaceRaycast(mousePos, objects, near = 0, far = 1000) {
  const raycaster = new THREE.Raycaster();
  raycaster.near = near;
  raycaster.far = far;
  raycaster.setFromCamera(mousePos, g.CAMERA);
  const intersects = raycaster.intersectObjects(objects, false);
  return intersects;
}

export function worldRaycast(origin, direction, objects, near=0, far=1000) {
  const raycaster = new THREE.Raycaster(origin, direction, near, far);
  raycaster.set(origin, direction);
  const intersects = raycaster.intersectObjects(objects, false);
  return intersects;
}
