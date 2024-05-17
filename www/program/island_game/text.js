import {g} from "./globals.js";


//////////////////////////////////////////////

export function initText() {
    
    // image-rendering: optimizeSpeed;
    // image-rendering: -moz-crisp-edges;
    // image-rendering: -webkit-optimize-contrast;
    // image-rendering: optimize-contrast;
    // -ms-interpolation-mode: nearest-neighbor;

    // img.style.imageRendering = "pixelated";
    // img.style.msInterpolationMode = "nearest-neighbor";
    // img.style.imageRendering = "optimize-contrast";
    // img.style.imageRendering = "-moz-crisp-edges";
    // img.style.imageRendering = "-webkit-optimize-contrast";
    // img.style.imageRendering = "optimizeSpeed";
    // img.style.imageRendering = "pixelated";

}



/**
 * @param {*} text full text to draw
 * @param {number} x text center x
 * @param {number} y text center y 
 */
export function drawText(text, x, y, params={}) {
  let { 
    fontSize = 10,
     maxWidth = null, 
     blinking = false 
    } = params;

  if (blinking) {
    const visible =
      g.TIME % (g.UI.TEXT.BLINKING_RATE * 2) < g.UI.TEXT.BLINKING_RATE;
    if (!visible) return;
  }

  if (maxWidth === null) {
    maxWidth = g.SCREEN.WINDOW_RESOLUTION.x * g.UI.SCALE;
  }

  g.UI.CTX.letterSpacing = "5px";
  g.UI.CTX.font = `${fontSize}px Times`;
  g.UI.CTX.fillStyle = "white";
  g.UI.CTX.textAlign = "center";
  g.UI.CTX.textBaseline = "middle";
  // shadow
  g.UI.CTX.shadowColor = "black";
  g.UI.CTX.shadowBlur = 1;
  g.UI.CTX.shadowOffsetX = 1;
  g.UI.CTX.shadowOffsetY = 1;

  g.UI.CTX.fillText(text, x, y, maxWidth);
}

