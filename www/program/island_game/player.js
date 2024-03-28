import { g } from "./globals.js";
import * as THREE from "three";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import { projectFootstepDecal } from "./decals.js";

/**
 * Player class (overrides Capsule just so that Octree can work)
 */
class Player extends THREE.Group{
  constructor() {
    super();
    this.name = "player";
    // create a group to hold player's meshes
    g.SCENE.add(this);

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
    this.add(this.stick);

    // player body
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(
        g.PLAYER.COLLIDER_RADIUS,
        g.PLAYER.COLLIDER_HEIGHT,
        4,
        8
      ),
      new THREE.MeshStandardMaterial({ color: 0xe5ff00 })
    );
    // body.position.y = 0.5;
    this.add(body);

    this.velocity = new THREE.Vector3();
    this.bobTimer = 0;
    this.bobActive = false;

    // setup physics
    let colliderDesc = g.PHYSICS.RAPIER.ColliderDesc.capsule(
      (g.PLAYER.COLLIDER_HEIGHT)/ 2,
      g.PLAYER.COLLIDER_RADIUS,
    );

    // Or create the collider and attach it to a rigid-body.
    this.rigidBody = g.PHYSICS.WORLD.createRigidBody(
      g.PHYSICS.RAPIER.RigidBodyDesc.kinematicPositionBased()
        .lockRotations() // prevent rotations along all axes.
        // .setCcdEnabled(true)
      // .setLinearDamping(0.5)
      // // The rigid body rotation, given as a quaternion.
      // // Default: no rotation.
      // .setRotation({ w: 1.0, x: 0.0, y: 0.0, z: 0.0})
      // // The linear velocity of this body.
      // // Default: zero velocity.
      // .setLinvel(1.0, 3.0, 4.0)
      // // The angular velocity of this body.
      // // Default: zero velocity.
      // .setAngvel({ x: 3.0, y: 0.0, z: 1.0 })
      // // The scaling factor applied to the gravity affecting the rigid-body.
      // // Default: 1.0
      // .setGravityScale(0.5)
      // // Whether or not this body can sleep.
      // // Default: true
      // .setCanSleep(true)
      // // Whether or not CCD is enabled for this rigid-body.
      // // Default: false
      .setTranslation(...g.PLAYER.START_POSITION)
    );
    this.collider = g.PHYSICS.WORLD.createCollider(colliderDesc, this.rigidBody);
    

  }


  ////// METHODS //////

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
    this.rotation.y += y;
  }

  get forward() {
    // get forward vector from rotation
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyEuler(this.rotation);
    forward.y = 0;
    forward.normalize();
    return forward;
  }

  get right() {
    // TODO: check if this is correct
    return this.up.clone().cross(this.forward);
  }

  translate(x, y, z) {
    const nextPos = g.PLAYER.OBJECT.rigidBody.translation();
    nextPos.x += x;
    nextPos.y += y;
    nextPos.z += z;
    // console.log("nextPos", nextPos);
    g.PLAYER.OBJECT.rigidBody.setNextKinematicTranslation(
      new g.PHYSICS.RAPIER.Vector3(nextPos.x, nextPos.y, nextPos.z)
    );
    g.PLAYER.OBJECT.position.copy(g.PLAYER.OBJECT.rigidBody.translation());
  }

  get camPosition() {
    const pos = this.collider.translation();
    pos.y += g.PLAYER.COLLIDER_HEIGHT / 2;
    return  pos;
  }
}

export function initPlayer() {
  // init player as group object and parent capsule and stick to it
  g.PLAYER.OBJECT = new Player();
  // g.PLAYER.OBJECT.setTranslation(10, 30, 10);
}

function updateCamera() {
  g.CAMERA.position.copy(g.PLAYER.OBJECT.camPosition);

  
  // g.CAMERA.position.y += Math.sin(g.PLAYER.OBJECT.bobTimer * 3) * 0.01;
  g.CAMERA.rotation.copy(g.PLAYER.OBJECT.rotation);
  // move camera forward according to player's forward velocity
  g.CAMERA.position.add(g.PLAYER.OBJECT.forwardVelocity.clone().multiplyScalar(0.5));
}

export function playerUpdate(deltaTime) {
  g.PLAYER.OBJECT.velocity.set(0, 0, 0);

  detectControls(deltaTime);

  playerMove(deltaTime);
  // playerCollisions();
  footstep();
  bob(deltaTime);


  if (g.PLAYER.CONTROL_TYPE === "FPS") {
    updateCamera();
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
  // add gravity
   if (
     g.PLAYER.ON_FLOOR && g.PLAYER.WANT_JUMP
   ) {
     g.PLAYER.OBJECT.velocity.y = g.PLAYER.JUMP_SPEED * deltaTime;
      g.PLAYER.WANT_JUMP = false;
   }
   else{
     g.PLAYER.OBJECT.velocity.y = g.PHYSICS.GRAVITY * deltaTime;
   }


  g.PHYSICS.CHARACTER_CONTROLLER.computeColliderMovement(
    g.PLAYER.OBJECT.collider, // The collider we would like to move.
    g.PLAYER.OBJECT.velocity // The movement we would like to apply if there wasn’t any obstacle.
  );    
  let correctedMovement = g.PHYSICS.CHARACTER_CONTROLLER.computedMovement();

  // After the collider movement calculation is done, we can read the
  // collision events.
  // console.log("numComputedCollisions", g.PHYSICS.CHARACTER_CONTROLLER.numComputedCollisions());
  for (let i = 0; i < g.PHYSICS.CHARACTER_CONTROLLER.numComputedCollisions(); i++) {
    let collision = g.PHYSICS.CHARACTER_CONTROLLER.computedCollision(i);
    
    // check if collision normal is within g.PLAYER.MAX_SLOPE_ANGLE of up
    let normal = new THREE.Vector3(collision.normal1.x, collision.normal1.y, collision.normal1.z);
    let angle = g.PLAYER.OBJECT.up.angleTo(normal);
    g.PLAYER.ON_FLOOR = angle < g.PLAYER.MAX_ON_FLOOR_ANGLE;
  }

  g.PLAYER.OBJECT.translate(correctedMovement.x, correctedMovement.y, correctedMovement.z);

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

  // }

  // and not playing audio already
  if (
    g.PLAYER.OBJECT.forwardVelocity.length() > 0 &&
    g.PLAYER.ON_FLOOR &&
    g.SOUNDS.FOOTSTEP.paused
  ) {
    // if moved, then play footstep sound
    g.SOUNDS.FOOTSTEP.play();
      projectFootstepDecal(
        g.PLAYER.OBJECT.position,
        g.PLAYER.OBJECT.up.clone().multiplyScalar(-1),
        g.PLAYER.OBJECT.rotation
      );
  } 
}

function detectControls(deltaTime) {
  // gives a bit of air control
  const speedDelta =
    deltaTime *
    (g.PLAYER.ON_FLOOR ? g.PLAYER.MOVE_SPEED : g.PLAYER.MOVE_SPEED * 0.25);

  if (g.KEY_STATES["KeyW"]) {
    g.PLAYER.OBJECT.velocity = g.PLAYER.OBJECT.forward.multiplyScalar(speedDelta);
      
    

    // g.CAMERA.rotation.x += g.PLAYER.LOOK_AROUND_SPEED * deltaTime;
  }

  if (g.KEY_STATES["KeyS"]) {
    g.PLAYER.OBJECT.velocity = g.PLAYER.OBJECT.forward.multiplyScalar(-speedDelta);
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


  //  if (
  //    g.KEY_STATES["Space"] &&
  //    g.PLAYER.JUMP_COOLDOWN_TIMER.getElapsedTime() > g.PLAYER.JUMP_COOLDOWN
  //  ) {
  //    g.PLAYER.WANT_JUMP = true;
  //    g.PLAYER.JUMP_COOLDOWN_TIMER.start();

  //   }

    
   
}
