import * as THREE from "three";
import { g } from "../globals.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js"; 
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import HelvetikerFont from "../assets/helvetiker_regular.typeface.json?url";

let FONT;
const loader = new FontLoader();
loader.load(HelvetikerFont, function (font) {
  FONT = font;
});

export class DebugCube extends THREE.Mesh {
  constructor(position, rotation, scale, text = null) {
    super(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshBasicMaterial({
        color: 0xf500fd,
        opacity: 0.2,
        transparent: true,
        depthTest: false,
      })
    );
    this.position.copy(position);
    this.rotation.copy(rotation);
    this.scale.set(scale.x, scale.y, scale.z);

    this.add(new THREE.AxesHelper(1));

    if (text) {
        
      const textMesh = new THREE.Mesh(
        new TextGeometry(text, {
          font: FONT,
          size: 1,
          height: 0.01,
        }),
        new THREE.MeshBasicMaterial({ 
            color: 0xee00ff,
            depthTest: false,
        })
      );
      textMesh.position.set(0, 0.2, 0);
      this.add(textMesh);
    }
  }
}

export class DebugAudioSpere extends THREE.Mesh {
  constructor(position, radius, text = null) {
    super(
      new THREE.SphereGeometry(radius, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        opacity: 0.2,
        transparent: true,
        depthTest: false,
      })
    );
    this.position.copy(position);

    this.add(new THREE.AxesHelper(1));

    if (text) {
      const textMesh = new THREE.Mesh(
        new TextGeometry(text, {
          font: FONT,
          size: 1,
          height: 0.01,
        }),
        new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            depthTest: false,
        })
      );
      textMesh.position.set(0, radius, 0);
      this.add(textMesh);
    }
  }
}
