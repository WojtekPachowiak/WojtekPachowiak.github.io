import { g } from "./globals.js";
import * as THREE from "three";

//////////////////////////////////////////////////////////////////////////////////////

function initFullScreenQuad() {
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

  class FullScreenQuad {
    constructor(material) {
      this._geometry = new FullscreenTriangleGeometry();
      this._mesh = new THREE.Mesh(this._geometry, material);
      this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    }

    dispose() {
      this._mesh.geometry.dispose();
    }

    render(renderer) {
      renderer.render(this._mesh, this._camera);
    }

    get material() {
      return this._mesh.material;
    }

    get camera() {
      return this._camera;
    }
  }

  const pixelateShader = {
    uniforms: {
      tDiffuse: { value: null },
    },

    vertexShader: /* glsl */ `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`,

    fragmentShader: /* glsl */ `
            uniform sampler2D tDiffuse;
            varying vec2 vUv;

              vec3 posterize(vec3 color, float levels) {
                            color *= levels;
                            color = floor(color);
                            color /= levels;
                            return color;
                        }

            void main() {

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

  return new FullScreenQuad(material);
}


let ctx;

//////////////////////////////////////////////////////////////////////////////////////

async function initFont() {
  const f = new FontFace("ARCADECLASSIC", "url(./assets/ARCADECLASSIC.TTF)");
  await f.load().then((font) => {
    document.fonts.add(font);
  });
}

//////////////////////////////////////////////////////////////////////////////////////

export async function initUI() {
  // init ARCADECLASSIC font
  await initFont();

  //create image
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  g.UI.CANVAS = canvas;

  ctx = canvas.getContext("2d", {
    antialias: false,
    colorSpace: "display-p3",
  });

  drawText();

  const texture = new THREE.Texture(canvas);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  g.UI.TEXTURE = texture;

  g.UI.FULLSCREEN_QUAD = initFullScreenQuad();
  g.UI.FULLSCREEN_QUAD.material.uniforms.tDiffuse.value = texture;
}


//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

export function renderUI() {
  // Initialize the drawing context anew
  const ctx = g.UI.CANVAS.getContext("2d", {
    antialias: false,
    colorSpace: "display-p3",
  });
  ctx.reset();
  drawText();
  g.UI.TEXTURE.needsUpdate = true;
  g.UI.FULLSCREEN_QUAD.render(g.RENDERER);
}

//////////////////////////////////////////////////////////////////////////////////////

export function drawText() {
  ctx.save();

  // placement (text by default centered)
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const left = window.innerWidth / 2;

  // fill with vertical gradient from gray to white to gray
  const gradient = ctx.createLinearGradient(
    0,
    window.innerHeight - g.UI.TEXT.HEIGHT - g.UI.TEXT.GRADIENT_SPREAD,
    0,
    window.innerHeight - g.UI.TEXT.HEIGHT + g.UI.TEXT.GRADIENT_SPREAD
  );
  gradient.addColorStop(0, "hsl(0, 0%, 66%)");
  gradient.addColorStop(0.5, "hsl(0, 0%, 94%)");
  gradient.addColorStop(1, "hsl(0, 0%, 66%)");
  ctx.fillStyle = gradient;

  // shadow
  ctx.shadowColor = "hsl(0, 0%, 6%)";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = (6 * g.UI.TEXT.SIZE) / 80; // 6px at 80px font size
  ctx.shadowOffsetY = (6 * g.UI.TEXT.SIZE) / 80;

  // font and size
  ctx.font = `${g.UI.TEXT.SIZE}px ARCADECLASSIC`;

  // draw characters one by one according to the g.GLOBALS.UI.TEXT_T (0,1); rest pad with spaces
  const full_text = g.UI.TEXT.TEXT;
  const text = full_text.substring(0, full_text.length * g.UI.TEXT.TEXT_T + 1);
  ctx.fillText(
    text + " ".repeat(full_text.length - text.length),
    left,
    window.innerHeight - g.UI.TEXT.HEIGHT
  );

  ctx.restore();
}

//////////////////////////////////////////////////////////////////////////////////////

export function resizeUI() {
  if (!g.UI.CANVAS) return;

  g.UI.CANVAS.width = window.innerWidth;
  g.UI.CANVAS.height = window.innerHeight;
  g.UI.TEXTURE.image = g.UI.CANVAS;
  g.UI.TEXTURE.needsUpdate = true;

}
