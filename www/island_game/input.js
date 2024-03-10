import {g} from "./globals.js";






export function initInput(){
  document.addEventListener("keydown", (event) => {
    g.KEY_STATES[event.code] = true;
  });

  document.addEventListener("keyup", (event) => {
    g.KEY_STATES[event.code] = false;
  });

  // pointer lock
  document.addEventListener("mousedown", () => {
    // document.body.requestPointerLock();
  });

  document.addEventListener("mouseup", () => {
    // if ( document.pointerLockElement !== null ) throwBall();
  });

  // document.body.addEventListener( 'mousemove', ( event ) => {
  //     if ( document.pointerLockElement === document.body ) {
  //         g.CAMERA.rotation.y -= event.movementX * playerMouseSensitivity * deltaTime;
  //         g.CAMERA.rotation.x -= event.movementY * playerMouseSensitivity * deltaTime;

  //         g.CAMERA.rotation.x = Math.max( - Math.PI / 2, Math.min( Math.PI / 2, g.CAMERA.rotation.x ) );

  //     }

  // } );

  document.addEventListener("mousemove", (event) => {
    g.MOUSE.x = (event.clientX / g.RENDERER.domElement.clientWidth) * 2 - 1;
    g.MOUSE.y = -(event.clientY / g.RENDERER.domElement.clientHeight) * 2 + 1;

    // const cursor = document.getElementById("cursor-custom");
    // if (cursor) {
    //   // cursor.style.left = event.clientX + "px";
    //   // cursor.style.top = event.clientY + "px";
    // }
  });

}

