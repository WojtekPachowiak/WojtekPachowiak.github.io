import { Text } from "troika-three-text";
import {g} from "./globals.js";


export function initText() {
  // text
  g.CUTSCENE.TEXT = new Text();
//   const text_scene = new THREE.Scene();
//   console.log(g.SCENE_TEXT);

  g.CUTSCENE.TEXT.layers.set(g.LAYERS.TEXT);
//   g.SCENE_TEXT = text_scene;
//   g.SCENE_TEXT.add(text);
    g.SCENE.add(g.CUTSCENE.TEXT);
    g.CAMERA.add(g.CUTSCENE.TEXT);
//   console.log(g.SCENE_TEXT);
//   g.SCENE_TEXT.add(g.CAMERA);

  // Set properties to configure:
  g.CUTSCENE.TEXT.text = "Silent hill 1";
  // myg.CUTSCENE.TEXT.font = defaultFont
  const zOffset = 0.1;
  g.CUTSCENE.TEXT.fontSize = 0.1 * zOffset;
  g.CUTSCENE.TEXT.position.z = -zOffset;
  g.CUTSCENE.TEXT.position.y = -0.5 * zOffset;
  g.CUTSCENE.TEXT.position.x = 0 * zOffset;

//   center
g.CUTSCENE.TEXT.anchorX = "center";

//   gradient from white to grey
  g.CUTSCENE.TEXT.color = 0xffffff;
  g.CUTSCENE.TEXT.outlineWidth = 0.005 * zOffset;
  g.CUTSCENE.TEXT.outlineColor = 0x000000;
  // myg.CUTSCENE.TEXT.outlineOpacity = 0.5
  g.CUTSCENE.TEXT.outlineOffsetX = (0.01 * zOffset) / 2;
  g.CUTSCENE.TEXT.outlineOffsetY = (0.01 * zOffset * 3) / 5;
  // myg.CUTSCENE.TEXT.strokeWidth = 0.01

  // depth test is disabled by default, so enable it for this g.CUTSCENE.TEXT:
  g.CUTSCENE.TEXT.material.depthTest = false;
  g.CUTSCENE.TEXT.material.transparent = true;
  g.CUTSCENE.TEXT.material.depthWrite = false;
  g.CUTSCENE.TEXT.renderOrder = 999;

  // Update the rendering:
  g.CUTSCENE.TEXT.sync();
}
