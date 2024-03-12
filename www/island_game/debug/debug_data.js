const DEFAULT_NONDEBUG_STATES = {
  camera: "FPS",
  cameraGizmo : false,
  wireframe: false,
  postprocessing: true,
  loweredOpacity: false,
  octree: false,
  fog: true,
  variableTracking: false,
  worldAxes: false,
  cutscene: false,
  debug_material: false,
};

const DEFAULT_DEBUG_STATES = {
  camera: "FPS",
  cameraGizmo : false,
  wireframe: false,
  postprocessing: false,
  loweredOpacity: false,
  octree: false,
  fog: true,
  variableTracking: true,
  worldAxes: false,
  cutscene: false,
  debug_material: false,
};

let CURRENT_DEBUG_STATES = { ...DEFAULT_NONDEBUG_STATES };


export const DEBUG_STATES = {
  CURRENT: CURRENT_DEBUG_STATES,
  DEFAULT_NONDEBUG: DEFAULT_NONDEBUG_STATES,
  DEFAULT_DEBUG: DEFAULT_DEBUG_STATES,
};