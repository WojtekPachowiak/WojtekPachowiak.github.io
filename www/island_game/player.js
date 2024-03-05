import {g} from "./globals.js";




export function initPlayer() {

}


function playerCollisions() {
  const result = g.OCTREE.capsuleIntersect(g.PLAYER.COLLIDER);

  g.PLAYER.ON_FLOOR = false;
  if (result) {
    g.PLAYER.ON_FLOOR = result.normal.y > 0;
    if (!g.PLAYER.ON_FLOOR) {
      g.PLAYER.VELOCITY.addScaledVector(
        result.normal,
        -result.normal.dot(g.PLAYER.VELOCITY)
      );
    }
    result.normal.multiplyScalar(result.depth);
    g.PLAYER.COLLIDER.translate(result.normal);
  }
}

export function playerUpdate(deltaTime) {

    if (g.PLAYER.CONTROL_TYPE === "FPS") {
        fpsControl(deltaTime);
    }
    if (g.PLAYER.CONTROL_TYPE === "ORBIT") {
        g.ORBIT_CONTROLS.update();
    }
}

export function setPlayerControlType(controlType) {
    g.PLAYER.CONTROL_TYPE = controlType;
    if (controlType === "FPS") {
        g.ORBIT_CONTROLS.enabled = false;
    }
    if (controlType === "ORBIT") {
        g.ORBIT_CONTROLS.enabled = true;
    }
}




function fpsControl(deltaTime) {
  detectFPSControls(deltaTime);

  let damping = Math.exp(-4 * deltaTime) - 1;

  if (!g.PLAYER.ON_FLOOR) {
    g.PLAYER.VELOCITY.y -= g.GRAVITY * deltaTime;

    // small air resistance
    damping *= g.PLAYER.JUMP_DAMPING;
  }

  g.PLAYER.VELOCITY.addScaledVector(g.PLAYER.VELOCITY, damping);

  let deltaPosition = g.PLAYER.VELOCITY.clone().multiplyScalar(deltaTime);
  // if delta position small enough, then stop
  if (deltaPosition.length() < g.PLAYER.MOVE_STOP_DAMPING_THRESHOLD) {
    deltaPosition = deltaPosition.multiplyScalar(g.PLAYER.MOVE_STOP_DAMPING);
  }
  g.PLAYER.COLLIDER.translate(deltaPosition);

  playerCollisions();

  g.CAMERA.position.copy(g.PLAYER.COLLIDER.end);

  if (g.PLAYER.VELOCITY.length() > 1 && g.PLAYER.ON_FLOOR) {
    // if moved, then play footstep sound
    g.SOUNDS.FOOTSTEP.play();
    // bob g.CAMERA
    g.CAMERA.position.y =
      g.CAMERA.position.y + Math.sin(performance.now() * 0.014) * 0.02;
  } else {
    g.SOUNDS.FOOTSTEP.pause();
    g.SOUNDS.FOOTSTEP.currentTime = 0;
  }
}


function getForwardVector() {
  g.CAMERA.getWorldDirection(g.PLAYER.DIRECTION);
  g.PLAYER.DIRECTION.y = 0;
  g.PLAYER.DIRECTION.normalize();

  return g.PLAYER.DIRECTION;
}

// function getSideVector() {
//   g.CAMERA.getWorldDirection(g.PLAYER.DIRECTION);
//   g.PLAYER.DIRECTION.y = 0;
//   g.PLAYER.DIRECTION.normalize();
//   g.PLAYER.DIRECTION.cross(g.CAMERA.up);

//   return g.PLAYER.DIRECTION;
// }


function detectFPSControls(deltaTime) {
  // gives a bit of air control
  const speedDelta =
    deltaTime *
    (g.PLAYER.ON_FLOOR ? g.PLAYER.MOVE_SPEED : g.PLAYER.MOVE_SPEED * 0.25);

  if (g.KEY_STATES["KeyW"]) {
    g.PLAYER.VELOCITY.add(getForwardVector().multiplyScalar(speedDelta));
    // g.CAMERA.rotation.x += g.PLAYER.LOOK_AROUND_SPEED * deltaTime;
  }

  if (g.KEY_STATES["KeyS"]) {
    g.PLAYER.VELOCITY.add(getForwardVector().multiplyScalar(-speedDelta));
    // g.CAMERA.rotation.x -= g.PLAYER.LOOK_AROUND_SPEED * deltaTime;
  }

  if (g.KEY_STATES["KeyA"]) {
    // g.PLAYER.VELOCITY.add( getSideVector().multiplyScalar( - speedDelta ) );
    g.CAMERA.rotation.y += g.PLAYER.LOOK_AROUND_SPEED * deltaTime;
  }

  if (g.KEY_STATES["KeyD"]) {
    // g.PLAYER.VELOCITY.add( getSideVector().multiplyScalar( speedDelta ) );
    g.CAMERA.rotation.y -= g.PLAYER.LOOK_AROUND_SPEED * deltaTime;
  }

  g.CAMERA.rotation.x = Math.max(
    -Math.PI / 2,
    Math.min(Math.PI / 2, g.CAMERA.rotation.x)
  );

  if (
    g.PLAYER.ON_FLOOR &&
    g.PLAYER.JUMP_COOLDOWN_TIMER.getElapsedTime() > g.PLAYER.JUMP_COOLDOWN
  ) {
    if (g.KEY_STATES["Space"]) {
      g.PLAYER.VELOCITY.y = g.PLAYER.JUMP_SPEED;
      g.PLAYER.JUMP_COOLDOWN_TIMER.start();
    }
  }
}
