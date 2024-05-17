import * as THREE from "three";
import {g} from "./globals.js";
import soundFootstep from "./assets/footsteps_sand_single.mp3";
import soundLa from "./assets/drakengard1_la.wav";


class Sound {
  constructor(path, params={}) {
    let { play=false, loop=false, volume=1.0, global=false } = params;
    this.loop = loop;
    this.volume = volume;
    this.play = play;
    this.path = path;
    this.global = global;
  }
}

export const AUDIO = {
  SOUNDS: {
    FOOTSTEP: new Sound(soundFootstep),
    LA: new Sound(soundLa),
    oilspill_engine: new Sound("assets/oilspill_engine.wav", { loop: true, play: true }),
  },
  LISTENER: null,
};


export function initAudio(){
  //// create an AudioListener and add it to the camera
  const listener = new THREE.AudioListener();
  g.CAMERA.add(listener);
  AUDIO.LISTENER = listener;
//   listener.setMasterVolume(0); // mute all sounds DEBUG


  //// load sound files
  __loadAudio();
}

/** loads audio from AUDIO.TRACKS and replaces the paths with sound objects  */
function __loadAudio(){
    //// load audio differently depending on params
    Object.keys(AUDIO.SOUNDS).forEach((key) => {
        let sound = AUDIO.SOUNDS[key];
        let audio = sound.global ? new THREE.Audio(AUDIO.LISTENER) : new THREE.PositionalAudio(AUDIO.LISTENER);
        let audioLoader = new THREE.AudioLoader();
        audioLoader.load(sound.path, function(buffer){
            audio.setBuffer(buffer);
            audio.setLoop(sound.loop);
            audio.setVolume(sound.volume);
            if (!sound.global){
                console.log(sound.path)
                audio.setMaxDistance(10);
            }

            if (sound.play){
                audio.autoplay = true;
            }
        });
        AUDIO.SOUNDS[key] = audio;
        });
} 

export function findSound(name){
    const s = AUDIO.SOUNDS[name];
    if (!s) {
        console.error(`sound '${name}' not found`);
    }
    return s;
}



