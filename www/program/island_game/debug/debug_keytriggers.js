import {g} from "../globals.js";
import {AUDIO} from "../audio.js";



g.MAIN_LOOP_CALLBACKS["debug_keytriggers"] = () => {
    if (g.KEY_STATES["KeyK"]) {
    console.log("cutscene");
    g.CUTSCENE = g.CUTSCENES.test;
    g.CUTSCENE.start();
    // g.CUTSCENE = new Cutscene();
    // g.CUTSCENE.keyframes = [
    //   { time: 2, text: "Hello, World!" },
    //   { time: 4, text: "Goodbye, World!" },
    // ];
    // g.CUTSCENE.scheduleNextKeyframe();
    // startCutscene(g.CUTSCENE);
    }
    const audio = AUDIO.SOUNDS.LA;
    if (g.KEY_STATES["KeyL"]) {
    // play sound La
    //   const thresholdStart = audio.duration * 0.8;
    //   const thresholdEnd = audio.duration * 0.2;
    //   audio.loop = true;
    // if (audio.paused || audio.currentTime > thresholdEnd) {
    console.log("play");
    // seek to 0.2
    audio.currentTime = 0;
    if (audio.isPlaying === false){
        audio.play();

    }
    // }
    g.UI.TEXT.TEXT = "La";
    g.UI.TEXT.TEXT_T = 1;
    } else {

    g.UI.TEXT.TEXT = "";
    g.UI.TEXT.TEXT_T = 1;
    }
};
