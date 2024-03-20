import { initBackground } from "../shader_background.js";
import backgroundShaderFrag from "./mouse_fun_frag.glsl?raw";

const canvas = document.getElementById("2dcanvas");

// initBackground(backgroundShaderFrag, canvas, 0.1);

// draw a red ball every frame at the mouse position
const ctx = canvas.getContext("2d");

let mousePos = { x: 0, y: 0 };
let realMousePos = { x: 0, y: 0 };

// a queue of mouse positions
const mousePosHistory = [];
const gradientsHistory = [];

const maxHistory = 300;
const radius = 150;

const mouseLerpFactor = 0.1;
let mouseMoved = false;
let mouseVelocity = { x: 0, y: 0 };
let mouseAcceleration = { x: 0, y: 0 };

// pink blue
let color1 = "oklab(75% 97% -31%)";
let color2 = "oklab(1% -17% -90%)";
let gradientSpread = 1.2;

// yellow orange
// let color1 = "oklab(90% 10% 70%)";
// let color2 = "oklab(32% 61% -10%)";
// let gradientSpread = 1.1;




// fill with a gradient from left to right of the ball

function drawBall(pos, grd) {
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.closePath();
}

function draw(delta) {
  requestAnimationFrame(draw);

  // lerp mouse position
  const mouseSpeed = 5;

  let offsetVector = {
    x: realMousePos.x - mousePos.x,
    y: realMousePos.y - mousePos.y,
  };
  const offsetLength = Math.sqrt(
    offsetVector.x * offsetVector.x + offsetVector.y * offsetVector.y
  );

//   if (offsetLength < 0.1) {
//     return;
//   }
  // console.log(offsetLength);

  // normalize vectors
  offsetVector.x = offsetVector.x / offsetLength;
  offsetVector.y = offsetVector.y / offsetLength;

  // multiply by speed with min
  offsetVector.x = offsetVector.x * Math.min(offsetLength, mouseSpeed);
  offsetVector.y = offsetVector.y * Math.min(offsetLength, mouseSpeed);





  // if the offsetVector is too small, reduce the speed
  if (offsetLength < 50) {
    const slowdown = 0.01;
    offsetVector.x = offsetVector.x * slowdown;
    offsetVector.y = offsetVector.y * slowdown;
  }

  // add to mousePos
  mousePos = {
    x: offsetVector.x + mousePos.x,
    y: offsetVector.y + mousePos.y,
  };

  


  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw the history of mouse positions
  for (let i = 0; i < mousePosHistory.length; i++) {
    const pos = mousePosHistory[i];
    const grd = gradientsHistory[i];
    drawBall(pos, grd);
  }

  ctx.fill();
  mousePosHistory.push({ x: mousePos.x, y: mousePos.y });
  const grd = ctx.createLinearGradient(
    mousePos.x - radius * gradientSpread,
    mousePos.y - radius * gradientSpread,
    mousePos.x + radius * gradientSpread,
    mousePos.y + radius * gradientSpread
  );
  grd.addColorStop(0, color1);
  grd.addColorStop(1, color2);
  gradientsHistory.push(grd);

  if (mousePosHistory.length > maxHistory) {
    mousePosHistory.shift();
    gradientsHistory.shift();
  }
}

draw();

let timer;
canvas.addEventListener(`mousemove`, (e) => {
  realMousePos = { x: e.clientX, y: e.clientY };
  mouseMoved = true;
  clearTimeout(timer);
  timer = setTimeout(() => {
    mouseMoved = false;
  }, 100);
});

// resize
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// disable context menu
window.addEventListener("contextmenu", (e) => e.preventDefault());

// onclick change color
canvas.addEventListener("mousedown", (event) => {
    console.log("=============================");

  //   right click
  if (event.button == 0) {
    console.log("clicked2");
    color1 = `oklab(
    ${Math.random() * 100}% 
    ${(Math.random() - 0.5) * 2 * 100}% 
    ${(Math.random() - 0.5) * 2 * 100}%)`;
    color2 = `oklab(
    ${Math.random() * 100}% 
    ${(Math.random() - 0.5) * 2 * 100}% 
    ${(Math.random() - 0.5) * 2 * 100}%)`;
  }

  if (event.button == 2) {
    console.log("clicked0");
    gradientSpread = Math.random()*5;
  }

  console.log("gradientSpread", gradientSpread);
  console.log("color1", color1);
  console.log("color2", color2);
});


