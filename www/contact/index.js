// import myFaceClosed from '/resources/image/myface/my_face_closed.jpg'
// import myFaceOpen from '/resources/image/myface/my_face_open.jpg'
// import lalala from '/resources/sound/drakengard1_lalalala_vhsed.mp3'
 
//  //Get element my_face and switch it to my_face_open on click
//  let my_face = document.getElementById("my_face");
//  let arrow = document.getElementById("arrow");
// let textbox = document.getElementById("text-box");

//  let audio = new Audio(lalala);

//  let isPlaying = false;
//  my_face.addEventListener("click", function () {
//      // if arrow is visible, disable it
//      if (isPlaying) {
        
//        my_face.src = myFaceClosed;
//        audio.pause();
//        arrow.style.visibility = "visible";
//        textbox.style.visibility = "hidden";
//      } else {
//        my_face.src = myFaceOpen;
//        audio.play();
//        arrow.style.visibility = "hidden";
//         textbox.style.visibility = "visible";
//      }
//      isPlaying = !isPlaying;


//  });

//  audio.onended = function () {
//      my_face.src = myFaceClosed;
//      arrow.style.visibility = "visible";
//       textbox.style.visibility = "hidden";
//  };


import backgroundShader from "./background.glsl?raw";

import { initBackground } from "../resources/js/shader_background.js";
const canvas = document.getElementById("background");
// on click randomize hue rotate of background
document.addEventListener("click", (event) => {
  console.log(event.target.tagName);
  // if click on text then ignore
  if (event.target.tagName !== "BODY") return;

  console.log("click");
  canvas.style.filter = `hue-rotate(${parseInt(Math.random() * 360)}deg)`;
});
initBackground(backgroundShader, canvas);
