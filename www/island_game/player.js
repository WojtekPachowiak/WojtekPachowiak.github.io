import { g } from "./globals.js";
import * as THREE from "three";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import { projectFootstepDecal } from "./decals.js";

/**
 * Player class (overrides Capsule just so that Octree can work)
 */
class Player extends Capsule {
  constructor() {
    super(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);

    this.group = new THREE.Group();
    g.SCENE.add(this.group);

    // // the player is holding a stick; draw this stick in the player's hand (right side of the screen)
    this.stick = new THREE.Mesh(
      new THREE.BoxGeometry(0.1 / 2, 0.1 / 2, 2),
      new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    );
    this.stick.position.z = -0.5;
    this.stick.position.x = 0.5;
    this.stick.position.y = 0.7;
    this.stick.rotation.x = Math.PI / 2.5;
    // this.stick.rotation.y = Math.PI / 6;
    this.stick.defaultRotation = this.stick.rotation.clone();
    this.group.add(this.stick);

    // player body
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 2, 6),
      new THREE.MeshStandardMaterial({ color: 0xe5ff00 })
    );
    body.position.y = 0.5;
    this.group.add(body);

    this.velocity = new THREE.Vector3();
    this.bobTimer = 0;
    this.bobActive = false;
  }

  get position() {
    return this.group.position;
  }

  get rotation() {
    return this.group.rotation;
  }

  get forwardVelocity() {
    return this.velocity.clone().projectOnVector(this.forward);
  }

  hit() {
    this.stick.rotation.x = Math.PI / 8;
    setTimeout(() => {
      this.stick.rotation.copy(this.stick.defaultRotation);
    }, 100);
  }

  rotate(y) {
    this.group.rotation.y += y;
  }

  get forward() {
    // get forward vector from rotation
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyEuler(this.group.rotation);
    forward.y = 0;
    forward.normalize();
    return forward;
  }

  get up() {
    return this.group.up;
  }

  get right() {
    // TODO: check if this is correct
    return this.group.up.clone().cross(this.forward);
  }

  translate(x, y, z) {
    super.translate(new THREE.Vector3(x, y, z));
    this.group.position.x += x;
    this.group.position.y += y;
    this.group.position.z += z;
  }
}

export function initPlayer() {
  // init player as group object and parent capsule and stick to it
  g.PLAYER.OBJECT = new Player();
  g.PLAYER.OBJECT.translate(10, 10, 10);

}

function playerCollisions() {
  const result = g.OCTREE.capsuleIntersect(g.PLAYER.OBJECT);

  g.PLAYER.ON_FLOOR = false;
  if (result) {
    g.PLAYER.ON_FLOOR = result.normal.y > 0;
    // if (!g.PLAYER.ON_FLOOR) {
    //   g.PLAYER.OBJECT.velocity.addScaledVector(
    //     result.normal,
    //     -result.normal.dot(g.PLAYER.OBJECT.velocity)
    //   );
    // }

    if (g.PLAYER.ON_FLOOR){
      g.PLAYER.OBJECT.velocity.y = 0;
    }

    if (result.depth > 0){
      g.PLAYER.OBJECT.translate(
        ...result.normal.multiplyScalar(result.depth).multiply(new THREE.Vector3(0, 1, 0))
      );

    }



    // result.normal.multiplyScalar(result.depth);
    // g.PLAYER.OBJECT.translate(...result.normal);
  }
}

export function playerUpdate(deltaTime) {
  detectControls(deltaTime);

  playerMove(deltaTime);
  playerCollisions();
  footstep();
  // bob(deltaTime);


  if (g.PLAYER.CONTROL_TYPE === "FPS") {
    g.CAMERA.position.copy(g.PLAYER.OBJECT.end);
    g.CAMERA.rotation.copy(g.PLAYER.OBJECT.rotation);
    g.CAMERA.position.y += Math.sin(g.PLAYER.OBJECT.bobTimer * 5) * 0.01;
  } else if (g.PLAYER.CONTROL_TYPE === "ORBIT") {
    g.ORBIT_CONTROLS.update();
  } else {
    throw new Error("Invalid control type");
  }
}

export function setPlayerControlType(controlType) {
  g.PLAYER.CONTROL_TYPE = controlType;

  if (controlType === "FPS") {
    g.CAMERA.rotation.copy(g.CAMERA_LAST_ORIENTATION);
    g.ORBIT_CONTROLS.enabled = false;
  } else if (controlType === "ORBIT") {
    g.CAMERA_LAST_ORIENTATION.copy(g.CAMERA.rotation);
    g.ORBIT_CONTROLS.enabled = true;
  }
}

function playerMove(deltaTime) {

  let damping = 0.5;

  if (!g.PLAYER.ON_FLOOR) {
    g.PLAYER.OBJECT.velocity.y -= g.GRAVITY * deltaTime;
    
    // small air resistance
    // damping *= g.PLAYER.JUMP_DAMPING;

  }

  let deltaPosition = g.PLAYER.OBJECT.velocity.clone();
  // if delta position small enough, then stop
  // if (deltaPosition.length() < g.PLAYER.MOVE_STOP_DAMPING_THRESHOLD) {
  //   deltaPosition = deltaPosition.multiplyScalar(g.PLAYER.MOVE_STOP_DAMPING);
  // }
  g.PLAYER.OBJECT.translate(...deltaPosition);

  // damping
  g.PLAYER.OBJECT.velocity.x *= (damping );
  g.PLAYER.OBJECT.velocity.z *= (damping );

}

  
function bob(deltaTime) {
  // console.log(g.PLAYER.ON_FLOOR, g.PLAYER.OBJECT.forwardVelocity.length());
  if (g.PLAYER.OBJECT.forwardVelocity.length() != 0 && g.PLAYER.ON_FLOOR) {
    g.PLAYER.OBJECT.bobActive = true;
  }

  if (g.PLAYER.OBJECT.bobActive) {
    const wavelength = Math.PI;
    const nextStep =
      1 + Math.floor(((g.PLAYER.OBJECT.bobTimer + 0.000001) * 10) / wavelength);
    const nextStepTime = (nextStep * wavelength) / 10;
    g.PLAYER.OBJECT.bobTimer = Math.min(
      g.PLAYER.OBJECT.bobTimer + deltaTime,
      nextStepTime
    );

    if (g.PLAYER.OBJECT.bobTimer == nextStepTime) {
      g.PLAYER.OBJECT.bobActive = false;
    }
  }
}

function footstep() {
  // if (g.PLAYER.ON_FLOOR) {
  //   projectFootstepDecal(
  //     g.PLAYER.OBJECT.position,
  //     g.PLAYER.OBJECT.up.clone().multiplyScalar(-1)
  //   );
  // }

  if (g.PLAYER.OBJECT.velocity.length() > 1 && g.PLAYER.ON_FLOOR) {
    // if moved, then play footstep sound
    g.SOUNDS.FOOTSTEP.play();
  } else {
    g.SOUNDS.FOOTSTEP.pause();
    g.SOUNDS.FOOTSTEP.currentTime = 0;
  }
}

function detectControls(deltaTime) {
  // gives a bit of air control
  const speedDelta =
    deltaTime *
    (g.PLAYER.ON_FLOOR ? g.PLAYER.MOVE_SPEED : g.PLAYER.MOVE_SPEED * 0.25);

  if (g.KEY_STATES["KeyW"]) {
    g.PLAYER.OBJECT.velocity.add(
      g.PLAYER.OBJECT.forward.multiplyScalar(speedDelta)
    );

    // g.CAMERA.rotation.x += g.PLAYER.LOOK_AROUND_SPEED * deltaTime;
  }

  if (g.KEY_STATES["KeyS"]) {
    g.PLAYER.OBJECT.velocity.add(
      g.PLAYER.OBJECT.forward.multiplyScalar(-speedDelta)
    );
    // g.CAMERA.rotation.x -= g.PLAYER.LOOK_AROUND_SPEED * deltaTime;
  }

  if (g.KEY_STATES["KeyA"]) {
    // g.PLAYER.OBJECT.velocity.add( getSideVector().multiplyScalar( - speedDelta ) );
    g.PLAYER.OBJECT.rotation.y += g.PLAYER.LOOK_AROUND_SPEED * deltaTime;
  }

  if (g.KEY_STATES["KeyD"]) {
    // g.PLAYER.OBJECT.velocity.add( getSideVector().multiplyScalar( speedDelta ) );
    g.PLAYER.OBJECT.rotation.y -= g.PLAYER.LOOK_AROUND_SPEED * deltaTime;
  }

  // if enter, hit
  if (g.KEY_STATES["Enter"]) {
    g.PLAYER.OBJECT.hit();
  }

  // g.CAMERA.rotation.x = Math.max(
  //   -Math.PI / 2,
  //   Math.min(Math.PI / 2, g.CAMERA.rotation.x)
  // );

  if (
    g.PLAYER.ON_FLOOR &&
    g.PLAYER.JUMP_COOLDOWN_TIMER.getElapsedTime() > g.PLAYER.JUMP_COOLDOWN
  ) {
    if (g.KEY_STATES["Space"]) {
      g.PLAYER.OBJECT.velocity.y += g.PLAYER.JUMP_SPEED * deltaTime;
      g.PLAYER.JUMP_COOLDOWN_TIMER.start();
    }
  }
}
