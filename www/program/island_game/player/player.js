import { g } from "../globals.js";
import * as THREE from "three";
import { projectFootstepDecal } from "../decals.js";
import {AUDIO} from "../audio.js";
import { Player } from "./player_class.js";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function initPlayer() {
  g.PLAYER.OBJECT = new Player();
}

function updateCamera() {
  //// update camera position and rotation to match player
  g.CAMERA.position.copy(g.PLAYER.OBJECT.camPosition);
  g.CAMERA.rotation.copy(g.PLAYER.OBJECT.rotation);

  //// bob camera up and down
  // g.CAMERA.position.y += Math.sin(g.PLAYER.OBJECT.bobTimer * 3) * 0.01;

  //// move camera forward according to player's forward velocity
  // g.CAMERA.position.add(g.PLAYER.OBJECT.forwardVelocity.clone().multiplyScalar(0.5));
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/** Player's main update loop */
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function footstep() {
  // if (g.PLAYER.ON_FLOOR) {

  // }

  // and not playing audio already
  if (
    g.PLAYER.OBJECT.forwardVelocity.length() > 0 &&
    g.PLAYER.ON_FLOOR &&
    AUDIO.SOUNDS.FOOTSTEP.paused
  ) {
    // if moved, then play footstep sound
    AUDIO.FOOTSTEP.play();
    projectFootstepDecal(
      g.PLAYER.OBJECT.position,
      g.PLAYER.OBJECT.up.clone().multiplyScalar(-1),
      g.PLAYER.OBJECT.rotation
    );
  } 
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
