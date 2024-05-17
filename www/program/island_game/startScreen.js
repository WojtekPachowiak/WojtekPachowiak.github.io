import startScreenSound from "./assets/menubbutonclick_lg_echo.wav";
import startScreenImg from "./assets/start_screen.jpg";
import { drawText } from "./text.js";
import { g } from "./globals.js";

const startScreenAudio = new Audio(startScreenSound);
const startScreenImage = new Image();
startScreenImage.src = startScreenImg;
let brightness = 1;
let saturation = 1;
let drawMenuText = true;
let blinkPressEnterText = true;
let firstDraw = true;

  const lerp = (start, end, t) => {
    t = Math.min(1, Math.max(0, t));
    return start * (1 - t) + end * t;
  };


function setBlackScreen(on) {
    const blackScreen = document.getElementById("blackScreen");
    blackScreen.style.backgroundColor = on ? "rgba(0,0,0,1)" : "rgba(0,0,0,0)";
}



function onPressStart() {

    //// stop drawin text
    blinkPressEnterText = false;

  //// play sound
  startScreenAudio.play();

  //// lerp blur effect for 3 seconds
  const start = Date.now();
  const update = () => {
    const now = Date.now();
    const t = (now - start) / 1000;
    brightness = lerp(10, 0, t/4.5 );
    saturation = lerp(1, 0, t-1);
    console.log(brightness, saturation);

    if (g.IS_START_SCREEN) {
      requestAnimationFrame(update);
    }
  };
  update();

    // setBlackScreen(true);

  //// set start screen to false after 3 seconds upon clicking
  setTimeout(() => {
    g.IS_START_SCREEN = false;
    setBlackScreen(false);
    // startScreenAudio.pause();
  }, 5000);
}

export function drawStartScreen(uiScale) {

    //// set filter
    g.UI.CTX.filter = `brightness(${brightness}) saturate(${saturation})`;

    //// draw image
  g.UI.CTX.drawImage(
    startScreenImage,
    0,
    0,
    g.SCREEN.WINDOW_RESOLUTION.x * uiScale,
    g.SCREEN.WINDOW_RESOLUTION.y * uiScale
  );

    //// draw text
    if (drawMenuText){
        const x = g.SCREEN.WINDOW_RESOLUTION.x / 2 * uiScale;
        const y = g.SCREEN.WINDOW_RESOLUTION.y / 1.1 * uiScale;
        drawText(
          "Press Enter to Start",
          x,
          y,
          { fontSize: 15, blinking: blinkPressEnterText}
        );
    }


    if (firstDraw){
        //// interpolate black screen to transparent (when the menu is displayed)
        setBlackScreen(false);
        firstDraw = false;
    }

  //// if enter pressed go to game
  if (g.KEY_STATES["Enter"]) {
    onPressStart();
    g.KEY_STATES["Enter"] = false;
  }
}
