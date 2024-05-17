// import { initBackground } from "/www/resources/js/shader_background.js";
// import backgroundShaderFrag from "./mouse_fun_frag.glsl?raw";
import { Vector2 } from "three";
const CANVAS = document.getElementById("2dcanvas");

// pink blue
// let color1 = "oklab(75% 97% -31%)";
// let color2 = "oklab(1% -17% -90%)";
// let gradientSpread = 1.2;

// yellow orange
// let color1 = "oklab(90% 10% 70%)";
// let color2 = "oklab(32% 61% -10%)";
// let gradientSpread = 1.1;

// let color1 = "oklab(99% -52% -92%)";
// let color2 = "oklab(25% 64% -53%)";
// let gradientSpread = 1.1;

// let color1 = "oklab(90% 10% 70%)";
// let color2 = "oklab(32% 41% -30%)";
// let gradientSpread = 1.1;

// draw a red ball every frame at the mouse position
const CTX = CANVAS.getContext("2d");
CANVAS.width = window.innerWidth;
CANVAS.height = window.innerHeight;
let THEN = 0;
let DELTA = 0;
let MOUSE_POS = new Vector2(window.innerWidth / 2, window.innerHeight / 2);

/////////////////////////////////////////////////////////////////////////////////////////////////////

class BallTrace {
  constructor() {
    this.pos = new Vector2(window.innerWidth / 2, window.innerHeight / 2);
    this.radius = 100;

    this.positionHistory = [];
    this.gradientsHistory = [];

    this.maxHistory = 500;

    // physcis
    this.velocity = new Vector2(0, 0);
    this.velocityMax = 300;
    this.acceleration = new Vector2(0, 0);
    this.accelerationMult = 3;
    this.accelerationMax = 9909;


    this.currentGradientIndex = 4;

    this.gridentInfos = [
      {
        color1: "oklab(21% -57% -50%)",
        color2: "oklab(76% -7% 24%)",
        gradientSpread: 1.2,
      },
      {
        color1: "oklab(90% 10% 70%)",
        color2: "oklab(32% 41% -30%)",
        gradientSpread: 1.1,
      },
      {
        color1: "oklab(99% -52% -92%)",
        color2: "oklab(25% 64% -53%)",
        gradientSpread: 2,
      },
      {
        color1: "oklab(75% 97% -31%)",
        color2: "oklab(1% -17% -90%)",
        gradientSpread: 1.2,
      },
      {
        color1: "oklab(90% 10% 70%)",
        color2: "oklab(32% 61% -10%)",
        gradientSpread: 1.7,
      },
    ];

  }

  drawBall(i) {
    const pos = this.positionHistory[i];
    CTX.beginPath();
    CTX.arc(pos.x, pos.y, this.radius, 0, Math.PI * 2);
    CTX.fillStyle = this.gradientsHistory[i];
    // CTX.globalAlpha = i / this.positionHistory.length;
    CTX.fill();
    CTX.closePath();
  }

  drawTrace() {
    // draw the history of mouse positions
    for (let i = 1; i < this.positionHistory.length; i++) {
      this.drawBall(i);
    }
  }

  addBall() {
    // define gradient
    const currentGradientInfo =
      this.gridentInfos[this.currentGradientIndex];

    const x1 = new Vector2(
      this.pos.x - this.radius * currentGradientInfo.gradientSpread,
      this.pos.y - this.radius * currentGradientInfo.gradientSpread
    );
    const x2 = new Vector2(
      this.pos.x + this.radius * currentGradientInfo.gradientSpread,
      this.pos.y + this.radius * currentGradientInfo.gradientSpread
    );

    // rotate both points
    let angle = 90;
    angle = (angle * Math.PI) / 180;
    x1.rotateAround(this.pos, angle);
    x2.rotateAround(this.pos, angle);

    const grd = CTX.createLinearGradient(
      x1.x,
      x1.y,
      x2.x,
      x2.y
    );
    grd.addColorStop(0, currentGradientInfo.color1);
    grd.addColorStop(1, currentGradientInfo.color2);

    // add to history
    this.positionHistory.push(this.pos.clone());
    this.gradientsHistory.push(grd);
    if (this.positionHistory.length > this.maxHistory) {
      this.positionHistory.shift();
      this.gradientsHistory.shift();
    }
  }
  

  updatePos(delta) {
    // lerp mouse position
    let offsetVector = MOUSE_POS.clone().sub(this.pos);

    const offsetLength = offsetVector.length();

    if (offsetLength === 0) {
      return;
    }

    this.acceleration = offsetVector.multiplyScalar(this.accelerationMult);
    this.acceleration.clampLength(0, this.accelerationMax);

    this.velocity.add(this.acceleration.clone().multiplyScalar(delta));
    this.velocity.clampLength(0, this.velocityMax);
    
    this.pos.add(this.velocity.clone().multiplyScalar(delta));

    this.acceleration = new Vector2(0, 0);
  }
}

const BALL_TRACE = new BallTrace();



/////////////////////////////////////////////////////////////////////////////////////////////////////

// DRAW
function draw(now) {
  
  requestAnimationFrame(draw);
  CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
  DELTA = (now - THEN) / 1000;
  THEN = now;
  // if delta nan return
  if (DELTA !== DELTA) {
    return;
  }
  
  
  BALL_TRACE.updatePos(DELTA);
  BALL_TRACE.addBall();
  BALL_TRACE.drawTrace();
  //   drawDebugBall(realMousePos, "red");
}

draw();



/////////////////////////////////////////////////////////////////////////////////////////////////////

let TIMER;
CANVAS.addEventListener(`mousemove`, (e) => {
  MOUSE_POS.x = e.clientX;
  MOUSE_POS.y = e.clientY;
  clearTimeout(TIMER);
  TIMER = setTimeout(() => {
  }, 100);
});

// resize
function resizeCanvas() {
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// disable context menu
window.addEventListener("contextmenu", (e) => e.preventDefault());

// onclick change color
CANVAS.addEventListener("mousedown", (event) => {
  console.log("=============================");

  // //   right click
  // if (event.button == 0) {
  //   console.log("clicked2");
  //   BALL_TRACE.currentGradientInfo.color1 = `oklab(
  //   ${Math.random() * 100}% 
  //   ${(Math.random() - 0.5) * 2 * 100}% 
  //   ${(Math.random() - 0.5) * 2 * 100}%)`;
  //   BALL_TRACE.currentGradientInfo.color2 = `oklab(
  //   ${Math.random() * 100}% 
  //   ${(Math.random() - 0.5) * 2 * 100}% 
  //   ${(Math.random() - 0.5) * 2 * 100}%)`;
  // }

  // if (event.button == 2) {
  //   console.log("clicked0");
  //   BALL_TRACE.currentGradientInfo.gradientSpread = Math.random() * 5;
  // }

  if (event.button == 0) {
    // swap gradient for the next one
    BALL_TRACE.currentGradientIndex = (BALL_TRACE.currentGradientIndex + 1) % BALL_TRACE.gridentInfos.length;
    BALL_TRACE.currentGradientInfo =
      BALL_TRACE.gridentInfos[BALL_TRACE.currentGradientIndex];
  }

  console.log("gradientSpread", BALL_TRACE.currentGradientInfo.gradientSpread);
  console.log("color1", BALL_TRACE.currentGradientInfo.color1);
  console.log("color2", BALL_TRACE.currentGradientInfo.color2);
});
