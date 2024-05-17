import { g,m } from "./globals.js";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    test: new Cutscene(
      [
        new Keyframe("□□□□□□ □□□□ □□! □□□ □□□□□?", 2),
        new Keyframe("□□□□ □□□□...", 3),
      ]
    ),
  };
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class CutsceneTriggerCondition {
  constructor() {
    this.condition = () => true;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Single keyframe of a cutscene
 */
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Stores cutscene info
 */
export class Cutscene {
  /**
   * @param {Keyframe[]} keyframes
   * @param {string | null} cameraTargetName
   * @param {CutsceneTriggerCondition | null} triggerCondition
   */
  constructor(keyframes, cameraTargetName=null, triggerCondition=null) {
    this.keyframes = keyframes;
    this.cameraTarget =
      cameraTargetName ? m.OBJECT_NAME_TO_POSITION[cameraTargetName] : null;
    this.triggerCondition = triggerCondition;
    this.duration = keyframes.reduce((acc, kf) => acc + kf.time, 0);
    /** @type {"waiting" | "playing" | "finished"} */
    this.state = "finished";
    this.currentKeyframe = 0;
    this.currentKeyframeTime = 0;
    this.timeout = null;
  }

  // check if cutscene should start
  checkTrigger() {
    if (this.triggerCondition.condition()) {
      this.start();
    }
  }

  scheduleNextKeyframe() {
    const offset =1;
    this.timeout = setTimeout(() => {
      this.currentKeyframe++;
      if (this.currentKeyframe >= this.keyframes.length) {
        this.state = "finished";
      } else {
        this.state = "waiting";
      }
    }, (this.keyframes[this.currentKeyframe].time + offset) * 1000);
    
    this.currentKeyframeTime = 0;
    this.state = "playing";
    g.UI.TEXT.TEXT = this.keyframes[this.currentKeyframe].text;
  }

  start() {    
    this.reset();
    this.state = "waiting";
    

    // if camera target is set, look at it
    if (this.cameraTarget) {
      g.CAMERA_LAST_ORIENTATION.copy(g.CAMERA.rotation);
      g.CAMERA.lookAt(this.cameraTarget);
      g.PLAYER.CONTROL_TYPE = "CUTSCENE";
    }
  }

  end() {
    if (this.cameraTarget) {
      g.CAMERA.rotation.copy(g.CAMERA_LAST_ORIENTATION);
      g.PLAYER.CONTROL_TYPE = "FPS";
    }
    this.reset();

    
  }

  reset() {
    this.state = "finished";
    this.currentKeyframe = 0;
    this.currentKeyframeTime = 0;
    g.UI.TEXT.TEXT = "";
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  update() {
    if (this.state === "finished") {
      this.end();
    }

    
    if (this.state === "waiting") {
      this.scheduleNextKeyframe();
    }

    this.currentKeyframeTime += g.DELTA_TIME;
    // typing text effect (instead of just showing it all at once)
    g.UI.TEXT.TEXT_T =
      this.currentKeyframeTime / this.keyframes[this.currentKeyframe].time ;
  }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




