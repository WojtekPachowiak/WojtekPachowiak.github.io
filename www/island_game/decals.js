import * as THREE from "three";
import { g } from "./globals.js";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";





export function projectDecal(intrsct) {
  // get the interseted mesh from intrsct
  const mesh = intrsct.object;

  const pos = intrsct.point;
  const normal = intrsct.face.normal;

  const projectorOrientation = new THREE.Euler().setFromVector3(
    new THREE.Vector3().copy(normal).negate()
  );
  const size = new THREE.Vector3(1, 1, 1);

  const decalMaterial = new THREE.MeshStandardMaterial({
    // map: baseMap,
    // normalMap: normalMap,
    color: 0xffffff,
    depthTest: true,
    depthWrite: false,
    normalScale: new THREE.Vector2(1, 1),
    polygonOffset: true,
    polygonOffsetFactor: -4,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const geometry = new DecalGeometry(
    mesh,
    pos.clone(),
    projectorOrientation,
    size
  );
  const m = new THREE.Mesh(geometry, decalMaterial);
  g.SCENE.add(m);
}
