import { g,m } from "./globals.js";



export function initCutscenes() {
  g.CUTSCENES = {
    harry1: new Cutscene(
      [
        new Keyframe("", 1),
        new Keyframe("Hello.", 1),
        new Keyframe("I'm the narrator of this story.", 2),
        new Keyframe("I didn't want to scare you,", 2),
        new Keyframe("but here I am,", 2),
        new Keyframe("doing just fine.", 2),
        new Keyframe("", 1),
      ],
      "harry_mason"
    ),
    harry2: new Cutscene(
      [
        new Keyframe("", 0.5),
        new Keyframe("I have nothing more to tell you.", 2),
        new Keyframe("", 1),
      ],
      "harry_mason"
    ),
  };
}

export class CutsceneTriggerCondition {
  constructor() {
    this.condition = () => true;
  }
}

class Keyframe {
  /**
   * @param {string} text 
   * @param {number} time 
   */
  constructor(text, time) {
    this.text = text;
    this.time = time;
  }
}


export class Cutscene {
  /**
   * @param {Keyframe[]} keyframes
   * @param {string} cameraTargetName
   * @param {CutsceneTriggerCondition} triggerCondition
   */
  constructor(keyframes, cameraTargetName, triggerCondition) {
    this.keyframes = keyframes;
    this.cameraTarget = m.OBJECT_NAME_TO_POSITION[cameraTargetName];
    this.triggerCondition = triggerCondition;
    this.duration = keyframes.reduce((acc, kf) => acc + kf.time, 0);
    /** @type {"waiting" | "playing" | "finished"} */
    this.state = "waiting";
    this.currentKeyframe = 0;
    this.currentTime = 0;
  }

  // check if cutscene should start
  checkTrigger() {
    if (this.triggerCondition.condition()) {
      startCutscene(this);
    }
  }

  scheduleNextKeyframe() {
    setTimeout(() => {
      this.currentKeyframe++;
      if (this.currentKeyframe >= this.keyframes.length) {
        this.state = "finished";
      } else {
        this.state = "waiting";
      }
    }, this.keyframes[this.currentKeyframe].time * 1000);
    
    this.state = "playing";
    g.UI.TEXT = this.keyframes[this.currentKeyframe].text;
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/** @param {Cutscene} cutscene */
function startCutscene(cutscene) {
  g.CUTSCENE = cutscene;
  g.CAMERA_LAST_ORIENTATION.copy(g.CAMERA.rotation);
  g.CAMERA.lookAt(cutscene.cameraTarget);
  g.PLAYER.CONTROL_TYPE = "CUTSCENE";
}


function endCutscene() {
  g.CAMERA.rotation.copy(g.CAMERA_LAST_ORIENTATION);
  g.CUTSCENE = null;
  g.PLAYER.CONTROL_TYPE = "FPS";
  g.UI.TEXT = "";
}


export function updateCutscene() {

  if (g.CUTSCENE.state === "finished") {
    endCutscene();
  }

  g.CUTSCENE.currentTime += g.DELTA_TIME;

  if (g.CUTSCENE.state === "waiting") {
    g.CUTSCENE.scheduleNextKeyframe();
  }
}



