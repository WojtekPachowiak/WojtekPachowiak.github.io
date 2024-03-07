import * as THREE from "three";
import { Capsule } from "three/addons/math/Capsule.js";
import soundFootstep from "./assets/footsteps_sand.mp3";

export const g = {
  SCREEN: {
    DPI: 1,
    TARGET_Y_RESOLUTION: 256,
    ASPECT_RATIO: window.innerWidth / window.innerHeight,
    RESOLUTION: new THREE.Vector2(),
  },

  GRAVITY: 30,

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

  RAYCASTER: null,

  MOUSE: new THREE.Vector2(),
  PLAYER: {
    MOVE_STOP_DAMPING: 0.1,
    MOVE_STOP_DAMPING_THRESHOLD: 0.008,
    MOUSE_SENSITIVITY: 0.2,
    LOOK_AROUND_SPEED: 1,
    COLLIDER: new Capsule(
      new THREE.Vector3(0, 0.35, 0),
      new THREE.Vector3(0, 1, 0),
      0.35
    ),
    VELOCITY: new THREE.Vector3(),
    DIRECTION: new THREE.Vector3(),
    JUMP_SPEED: 5,
    JUMP_DAMPING: 0.0001,
    MOVE_SPEED: 10,
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
  },

  CUTSCENE: {
    ACTIVE: false,
    DATA: {
      DURATION: 8,
      TIMES: [0.2, 2.0, 5.0],
      TEXT: [
        "Hello, this is a test",
        "I didn't want to scare you, but here I am. Doing fine.",
        "Shall we go?",
      ],
      CAMERA_POSITIONS: [
        new THREE.Vector3(8.14, 6.61, 13.34),
        new THREE.Vector3(8.14, 7.61, 13.34),
        new THREE.Vector3(8.14, 8.61, 13.34),
      ],
      CAMERA_TARGETS: [
        new THREE.Vector3(11.14, 5.61, 11.34),
        new THREE.Vector3(11.14, 5.61, 11.34),
        new THREE.Vector3(11.14, 5.61, 11.34),
      ],
      CURRENT_KEYFRAME: -1,
    },
    BLACK_BARS_T: 0,
    BLACK_BARS_HEIGHT: 0.15,
    BLACK_BARS_SPEED: 0.25,
    TIME: 0,
  },
  BOTTOM_TEXT: null,
  BOTTOM_TEXT_SETTINGS: {
    BLINKING: true,
    SIZE : "80px",
    HEIGHT : 60,
    GRADIENT_SPREAD : 19,
    
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
};

g.PLAYER.COLLIDER.translate(new THREE.Vector3(9, 13, 15));
g.SOUNDS.FOOTSTEP.volume = 0.05;

