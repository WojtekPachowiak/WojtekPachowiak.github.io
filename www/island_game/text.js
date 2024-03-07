import { Text } from "troika-three-text";
import { g } from "./globals.js";
import * as THREE from "three";

class FullscreenTriangleGeometry extends THREE.BufferGeometry {
  constructor() {
    super();

    this.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)
    );
    this.setAttribute(
      "uv",
      new THREE.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2)
    );
  }
}
const _camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const _geometry = new FullscreenTriangleGeometry();

class FullScreenQuad {
  constructor(material) {
    this._mesh = new THREE.Mesh(_geometry, material);
  }

  dispose() {
    this._mesh.geometry.dispose();
  }

  render(renderer) {
    renderer.render(this._mesh, _camera);
  }

  get material() {
    return this._mesh.material;
  }

  set material(value) {
    this._mesh.material = value;
  }
}

export async function initText() {
  //create image
  var bitmap = document.createElement("canvas");
  var ctx = bitmap.getContext("2d", {
    antiAlias: false,
  });
  bitmap.width = window.innerWidth;
  bitmap.height = window.innerHeight;

  var f = new FontFace("ARCADECLASSIC", "url(./assets/ARCADECLASSIC.TTF)");

  const font = await f.load();
  // Add font on the html page
  document.fonts.add(font);

  ctx.font = "80px ARCADECLASSIC";

  // ctx.fillStyle = "white";

  // ctx.textRendering = "geometricPrecision";

  // ctx.globalAlpha = 0.5;

  const bottom = 80;
  let left = 40;
  const center = true;
  if (center) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    left = window.innerWidth / 2;
  }

  // fill with vertical gradient from gray to white to gray
  const spread = 19;
  var gradient = ctx.createLinearGradient(
    0,
    window.innerHeight - bottom -spread,
    0,
    window.innerHeight - bottom + spread
  );
  gradient.addColorStop(0, "hsl(0, 0%, 66%)");
  gradient.addColorStop(0.5, "hsl(0, 0%, 94%)");
  gradient.addColorStop(1, "hsl(0, 0%, 66%)");
  ctx.fillStyle = gradient;

  // ctx.letterSpacing = 30;
  // ctx.wordSpacing = 10;
  // ctx.fontStretch = "ultra-expanded";

  // ctx.strokeStyle = "";
  // ctx.lineWidth = 5;
  // ctx.strokeText("Silent hill 1", left, window.innerHeight - bottom);
  // canvas contents will be used for a texture

  // shadow
  ctx.shadowColor = "hsl(0, 0%, 6%)";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 6;

  ctx.fillText("Silent hill 1", left, window.innerHeight - bottom);

  var texture = new THREE.Texture(bitmap);
  // filters turn off
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  const pixelateShader = {
    uniforms: {
      tDiffuse: { value: texture },
      uResolution: { value: g.SCREEN.RESOLUTION },
      // uMainTexture: { value: null },
    },

    vertexShader: /* glsl */ `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`,

    fragmentShader: /* glsl */ `
            uniform sampler2D tDiffuse;
            uniform vec2 uResolution;
            varying vec2 vUv;

            vec2 pixelate(vec2 uv, vec2 res){
                          return floor(uv  * res ) / res;
                        }

              vec3 posterize(vec3 color, float levels) {
                            color *= levels;
                            color = floor(color);
                            color /= levels;
                            return color;
                        }

            void main() {
                vec2 pos = gl_FragCoord.xy / uResolution.y;

                vec2 uv = vUv;
                // uv = pixelate(uv, uResolution);
                vec4 uiTex = texture2D( tDiffuse, uv );

                // posterize
                float posterizeLevels = 10.0;
                float posterizeThreshold = 0.1;
                if (uiTex.r > posterizeThreshold || uiTex.g > posterizeThreshold || uiTex.b > posterizeThreshold) {
                  uiTex.rgb = posterize(uiTex.rgb, posterizeLevels);
                }

                gl_FragColor = uiTex;
                // gl_FragColor = vec4(uv.x, uv.y, 0.0,1.0);

            }`,
  };

  const material = new THREE.ShaderMaterial({
    uniforms: pixelateShader.uniforms,
    vertexShader: pixelateShader.vertexShader,
    fragmentShader: pixelateShader.fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  // const material = new THREE.MeshBasicMaterial({
  //   map: texture,
  //   transparent: true,
  // });

  console.log(g.SCREEN.ASPECT_RATIO);
  const fsq = new FullScreenQuad(material);

  g.CUTSCENE.TEXT = fsq;
}




export function initText2() {
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
  // g.CUTSCENE.TEXT.outlineWidth = 0.005 * zOffset;
  // g.CUTSCENE.TEXT.outlineColor = 0x000000;
  // myg.CUTSCENE.TEXT.outlineOpacity = 0.5
  // g.CUTSCENE.TEXT.outlineOffsetX = (0.01 * zOffset) / 2;
  // g.CUTSCENE.TEXT.outlineOffsetY = (0.01 * zOffset * 3) / 5;

  // myg.CUTSCENE.TEXT.strokeWidth = 0.01
  console.log(g.CUTSCENE.TEXT.material);

  // depth test is disabled by default, so enable it for this g.CUTSCENE.TEXT:
  g.CUTSCENE.TEXT.material.depthTest = false;
  g.CUTSCENE.TEXT.material.transparent = true;
  g.CUTSCENE.TEXT.material.depthWrite = false;
  g.CUTSCENE.TEXT.renderOrder = 999;
  console.log(g.CUTSCENE.TEXT.material.uniforms);
  g.CUTSCENE.TEXT.material.uniforms.uTroikaSDFTexture.minFilter =
    THREE.NearestFilter;
  g.CUTSCENE.TEXT.material.uniforms.uTroikaSDFTexture.magFilter =
    THREE.NearestFilter;
  g.CUTSCENE.TEXT.material.uniforms.uTroikaSDFTexture.needsUpdate = true;
  

  
  // Update the rendering:
  g.CUTSCENE.TEXT.sync();
}
