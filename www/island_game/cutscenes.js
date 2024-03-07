import {g} from "./globals.js";




export function updateCutscene() {
  if (g.CUTSCENE.ACTIVE) {
    g.PLAYER.CONTROL_TYPE = "CUTSCENE";
    g.CUTSCENE.BLACK_BARS_T += g.CUTSCENE.BLACK_BARS_SPEED * g.DELTA_TIME;
    if (g.CUTSCENE.BLACK_BARS_T > g.CUTSCENE.BLACK_BARS_HEIGHT) {
      g.CUTSCENE.BLACK_BARS_T = g.CUTSCENE.BLACK_BARS_HEIGHT;
    }

    if (g.CUTSCENE.BLACK_BARS_T >= g.CUTSCENE.BLACK_BARS_HEIGHT) {
      g.CUTSCENE.TIME += g.DELTA_TIME;

      if (
        g.CUTSCENE.DATA.CURRENT_KEYFRAME + 1 < g.CUTSCENE.DATA.TEXT.length &&
        g.CUTSCENE.TIME >
          g.CUTSCENE.DATA.TIMES[g.CUTSCENE.DATA.CURRENT_KEYFRAME + 1]
      ) {
        g.CUTSCENE.DATA.CURRENT_KEYFRAME += 1;
        g.CUTSCENE.TEXT =
          g.CUTSCENE.DATA.TEXT[g.CUTSCENE.DATA.CURRENT_KEYFRAME];
        g.CAMERA.position.copy(
          g.CUTSCENE.DATA.CAMERA_POSITIONS[g.CUTSCENE.DATA.CURRENT_KEYFRAME]
        );
        console.log(
          g.CUTSCENE.DATA.CAMERA_TARGETS[g.CUTSCENE.DATA.CURRENT_KEYFRAME]
        );
        console.log(g.CAMERA.rotation);
        g.CAMERA.lookAt(
          g.CUTSCENE.DATA.CAMERA_TARGETS[g.CUTSCENE.DATA.CURRENT_KEYFRAME]
        );
        console.log(
          g.CUTSCENE.DATA.CAMERA_TARGETS[g.CUTSCENE.DATA.CURRENT_KEYFRAME]
        );
        console.log(g.CAMERA.rotation);

        console.log(g.CUTSCENE.TEXT);
      }

      if (g.CUTSCENE.TIME > g.CUTSCENE.DATA.DURATION) {
        console.log("cutscene ended");
        g.CUTSCENE.ACTIVE = false;
        g.CUTSCENE.TIME = 0;
        g.CUTSCENE.DATA.CURRENT_KEYFRAME = -1;
        // bring back players camera pitch
        g.CAMERA.rotation.x = 0;
      }
    }
  } else {
    g.CUTSCENE.BLACK_BARS_T -= g.CUTSCENE.BLACK_BARS_SPEED * g.DELTA_TIME;
    if (g.CUTSCENE.BLACK_BARS_T <= 0) {
      g.CUTSCENE.BLACK_BARS_T = 0;
    }
    g.PLAYER.CONTROL_TYPE = "FPS";
  }
  g.POSTPROCESSING_PASSES.PS1.uniforms.uBlackBarsT.value =
    g.CUTSCENE.BLACK_BARS_T;
}
