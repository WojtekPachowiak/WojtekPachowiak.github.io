import { g } from "./globals.js";
import { drawText } from "./text.js";
import { drawStartScreen } from "./startScreen.js";

//////////////////////////////////////////////////////////////////////////////////////

async function initFont() {
  const f = new FontFace("ARCADECLASSIC", "url(./assets/ARCADECLASSIC.TTF)");
  await f.load().then((font) => {
    document.fonts.add(font);
  });
}

//////////////////////////////////////////////////////////////////////////////////////

function initCtx() {
  g.UI.CTX = g.UI.CANVAS.getContext("2d", {
    antialias: false,
    colorSpace: "display-p3",
  });
  // g.UI.CTX.imageSmoothingEnabled = false;
}

function setCanvasSize() {
  g.UI.CANVAS.width = g.SCREEN.WINDOW_RESOLUTION.x * g.UI.SCALE;
  g.UI.CANVAS.height = g.SCREEN.WINDOW_RESOLUTION.y * g.UI.SCALE;
  g.UI.CANVAS.style.width = g.SCREEN.WINDOW_RESOLUTION.x + "px";
  g.UI.CANVAS.style.height = g.SCREEN.WINDOW_RESOLUTION.y + "px";
}

export async function initUI() {
  // init fonts
  await initFont();

  //// set scaling factor (to pixelate canvas)
  g.UI.SCALE = g.SCREEN.RESOLUTION.y / g.SCREEN.WINDOW_RESOLUTION.y ;
  
  //// assign canvas to global
  const canvas = document.getElementById("ui_canvas");
  g.UI.CANVAS = canvas;

  //// set canvas size
  setCanvasSize();

  //// Pixelating
  // g.UI.CANVAS.style.imageRendering = "pixelated";

  initCtx();
}

//////////////////////////////////////////////////////////////////////////////////////



export async function renderUI() {
  if (!g.UI.CANVAS) return;

  // clear
  g.UI.CTX.clearRect(
    0,
    0,
    g.SCREEN.WINDOW_RESOLUTION.x * g.UI.SCALE,
    g.SCREEN.WINDOW_RESOLUTION.y * g.UI.SCALE
  );



    if (g.IS_START_SCREEN){
      drawStartScreen(g.UI.SCALE);
      return;
    }

  // blinking
  if (g.UI.TEXT.BLINKING) {
    const visible =
      g.TIME % (g.UI.TEXT.BLINKING_RATE * 2) < g.UI.TEXT.BLINKING_RATE;
    if (!visible) return;
  }

  // draw characters one by one according to the g.GLOBALS.UI.TEXT_T (0,1); rest pad with spaces
  const full_text = g.UI.TEXT.TEXT;
  const t = g.UI.TEXT.TEXT_T;

  drawText(
    full_text,
    g.SCREEN.WINDOW_RESOLUTION.x / 2 * g.UI.SCALE,
    (g.SCREEN.WINDOW_RESOLUTION.y  - g.UI.TEXT.HEIGHT)*g.UI.SCALE,
  );
}




//////////////////////////////////////////////////////////////////////////////////////

export function resizeUI() {
  if (!g.UI.CANVAS) return;

  setCanvasSize();
  initCtx();
}
