import * as THREE from "three";
import { g } from "./globals.js";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";
import { worldRaycast } from "./raycast.js";



export function projectBloodDecal(rayOrigin, rayDirection, decalRotation){
  projectDecal(rayOrigin, rayDirection, g.OBJECT_GROUPS.DECALABLES, g.TEXTURES.BLOOD ,0.5);
}

export function projectFootstepDecal(rayOrigin, rayDirection, decalRotation) {
  projectDecal(
    rayOrigin,
    rayDirection,
    decalRotation,
    g.OBJECT_GROUPS.DECALABLES,
    g.TEXTURES.FOOTSTEP,
    0.5
  );
}




export function projectDecal(
  origin,
  direction,
  decalRotation,
  raycastableObjects,
  decalMap,
  decalSize
) {
  const intrsct = worldRaycast(origin, direction, raycastableObjects);
  if (intrsct.length === 0) {
    return;
  }

  // get the interseted mesh from intrsct
  const mesh = intrsct[0].object;

  const pos = intrsct[0].point;
  const normal = intrsct[0].face.normal;

  // define up vector as global forward axis rotated by the decal up rotation
  let decalUp = new THREE.Vector3(0, 0, -1);
  decalUp.applyEuler(decalRotation);
  

  
  const rot = new THREE.Euler().setFromRotationMatrix(
    new THREE.Matrix4().lookAt(pos.clone().add(normal), pos.clone(), decalUp)
  );
  

  const mapAspect = decalMap.image.width / decalMap.image.height;
  const _size = new THREE.Vector3(decalSize * mapAspect, decalSize, decalSize);

  const decalMaterial = new THREE.MeshStandardMaterial({
    map: decalMap,
    color: 0x000000,
    opacity: 0.1,
    depthTest: true,
    depthWrite: false,
    normalScale: new THREE.Vector2(1, 1),
    polygonOffset: true,
    polygonOffsetFactor: -4,
    transparent: true,
    // side: THREE.DoubleSide,
  });

  const geometry = new DecalGeometry(mesh, pos, rot, _size);
  const m = new THREE.Mesh(geometry, decalMaterial);
  g.SCENE.add(m);
}
