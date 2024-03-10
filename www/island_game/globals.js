import * as THREE from "three";
import soundFootstep from "./assets/footsteps_sand.mp3";


const textureLoader = new THREE.TextureLoader();

export const g = {
  DEBUG_MODE: false,

  SCREEN: {
    DPI: 1,
    TARGET_Y_RESOLUTION: 256,
    ASPECT_RATIO: window.innerWidth / window.innerHeight,
    RESOLUTION: new THREE.Vector2(),
  },

  GRAVITY: 5,

  CLOCK: null,
  FPS: 60,
  DELTA_TIME: 0,
  TIME: 0,
  TIME_SINCE_LAST_FRAME: 0,

  OBJECT_GROUPS: {
    DECALABLES: [],
    COLLIDABLES: [],
    INTERACTABLES: [],
  },
  RENDER_TARGET: null,

  MOUSE: new THREE.Vector2(),
  PLAYER: {
    OBJECT: null,
    START_POSITION: new THREE.Vector3(9, 13, 15),
    MOVE_STOP_DAMPING: 0.1,
    MOVE_STOP_DAMPING_THRESHOLD: 0.008,
    MOUSE_SENSITIVITY: 0.2,
    LOOK_AROUND_SPEED: 1,
    COLLIDER: null,
    VELOCITY: new THREE.Vector3(),
    DIRECTION: new THREE.Vector3(),
    JUMP_SPEED: 30,
    JUMP_DAMPING: 0.01,
    MOVE_SPEED: 2,
    JUMP_COOLDOWN: 0.6,
    JUMP_COOLDOWN_TIMER: new THREE.Clock({ autoStart: true }),
    ON_FLOOR: false,
    CONTROL_TYPE: "FPS",
  },
  SNOWFLAKES: {
    PARTICLES_POSITIONS: [],
    PARTICLES_VELOCITIES: [],
    PARTICLES_COLLISION_SPHERES: [],
    SPAWN_HEIGHT: 6,
    SPAWN_RADIUS: 20,
    SPAWN_VELOCITY_MAX_SPEED: 3,
    DYING_DURATION: 0.5,
    OPACITY: 0.1,
    SIZE: 40,
    NUM: 1000,
    GEOMETRY: null,
  },

  KEY_STATES: {},

  LAYERS: {
    DEFAULT: 0,
    TEXT: 1,
    SNOWFLAKES: 2,
  },

  CUTSCENES: null,
  CUTSCENE: null,
  CUTSCENE_GLOBAL_STATE: {
    ACTIVE: false,
    KEYFRAME: 0,
    TIME: 0,
  },

  CURSOR: null,
  CURSOR_DEFAUTL_OPACITY: 0.1,
  CURSOR_HOVER_OPACITY: 0.5,

  UI: {
    FULLSCREEN_QUAD: null,
    TEXTURE: null,
    CANVAS: null,

    TEXT: {
      TEXT: "Silent Hill 1",
      BLINKING: true,
      BLINKING_RATE: 0.5,
      TEXT_T: 1,
      SIZE: 70,
      HEIGHT: 120,
      GRADIENT_SPREAD: 19,
    },
  },

  MAIN_LOOP_CALLBACKS: {},

  LIGHTS: {
    GLOBAL_AMBIENT_INTENSITY: 10,
    GLOBAL_DIRECTIONAL_INTENSITY: 0,
    FLASHLIGHT_INTENSITY: 10,
  },
  // three.js internal vars
  SCENE: null,
  RENDERER: null,
  CAMERA: null,
  CAMERA_FAR: 100,
  CAMERA_LAST_ORIENTATION: new THREE.Euler(),
  OCTREE: null,
  ORBIT_CONTROLS: null,
  WORLD_AXES_HELPER: null,

  FOG_COLOR: 0x9b9b9b,
  FOG: null,

  POSTPROCESSING_COMPOSERS: {
    UI: null,
    MAIN: null,
  },
  POSTPROCESSING_PASSES: {
    PS1: null,
    PS1_UI: null,
  },

  MATERIALS: {
    PS1: null,
  },

  SOUNDS: {
    FOOTSTEP: new Audio(soundFootstep),
  },

  TEXTURES: {
    BLOOD: textureLoader.load("./assets/blood.png"),
    FOOTSTEP: textureLoader.load("./assets/footstep.png"),
    FOOTSTEP_NOALPHA: textureLoader.load("./assets/footstep_noalpha.png"),
  },

  PHYSICS: {
    GRAVITY: -9.8,
    RAPIER: null,
    WORLD: null,
    CHARACTER_CONTROLLER : null,
  },
};

g.SOUNDS.FOOTSTEP.volume = 0.05;




export const m = {
  OBJECT_NAME_TO_POSITION: new Map(),


};

