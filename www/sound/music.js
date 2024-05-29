import * as THREE from "three";
import backgroundShader from "../resources/shaders/music_background.glsl?raw";
import WebGL from "three/addons/capabilities/WebGL.js";

// tracks
import sirene2 from "./files/sirene2.mp3";
import grimy_sheet_gonges from "./files/grimy_sheet_gonges.mp3";
import nights_kurafiia from "./files/nights_kurafiia.mp3";
import turetibrek from "./files/turetibrek.mp3";

import echoengeles from "./files/echoengeles.mp3";
import footsteps_sand from "./files/footsteps_sand.mp3";
import metroidlike from "./files/metroidlike.mp3";
import plaza_radosna4 from "./files/plaza_radosna4.mp3";
import silenthill from "./files/silenthill.mp3";
import somsiadpuk from "./files/somsiadpuk.mp3";




// if (matchMedia("(pointer:coarse)").matches) {
//   document.body.innerHTML = "";
  
//   alert("Mobile devices not supported yet. Sorry! Only desktop :(");
//   throw "Mobile devices not supported yet. Sorry! Only desktop :(";
// }


let dpi = 1;

function initBackground() {
  // if mobile device
  

  if (WebGL.isWebGL2Available() === false) {
    document.body.appendChild(WebGL.getWebGL2ErrorMessage());
  }

  // renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(
    window.innerWidth,
    window.innerHeight,
    false
  );
  renderer.setPixelRatio(dpi);
  document.body.appendChild(renderer.domElement);
  // renderer.domElement.style.width = "100%";
// absolute position
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.zIndex = "-1";


  // scene
  const scene = new THREE.Scene();
  // shader background
  const plane_geometry = new THREE.PlaneGeometry(10, 10);
  const plane_material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 1 },
      resolution: {
        value: new THREE.Vector2(
          window.innerWidth * dpi,
          window.innerHeight * dpi
        ),
      },
    },
    fragmentShader: backgroundShader,
  });
  plane_material.depthWrite = false;
  const plane_mesh = new THREE.Mesh(plane_geometry, plane_material);
  scene.add(plane_mesh);
  // camera
  const aspect = window.innerWidth / window.innerHeight
  const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.001, 1000);
  camera.position.set(0, 0, 10);
  scene.add(camera);
  // main animate loop
  function animate() {
    requestAnimationFrame(animate);

    plane_material.uniforms.time.value = performance.now() / 1000;

    renderer.clear();
    renderer.render(scene, camera);
  }
  animate();


  // onresize
  function updateViewport() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(
      window.innerWidth,
      window.innerHeight,
      false
    );
    renderer.setPixelRatio(dpi);
    // plane_mesh.scale.set(window.innerWidth / window.innerHeight, 1, 1);
    plane_material.uniforms.resolution.value = new THREE.Vector2(
      window.innerWidth * dpi,
      window.innerHeight * dpi
    );
  }
  window.onresize = updateViewport;

}

function initAudioPlayer(){

  let audio = new Audio();
  audio.loop = false;
  audio.volume = 0.5;
  
  // on audio load, enable slider
  audio.onloadedmetadata = () => {
  
    // change color of play button
    document.querySelector("#play-pause button").classList.remove("disabled");
  
    // time in format 0:00 (minutes:seconds)
    const maxTime = Math.floor(audio.duration / 60) + ":" + Math.floor(audio.duration % 60).toString().padStart(2, "0");
    document.querySelector("#max-time span").innerText = maxTime;
  };
  
  
  // on press loop button change loop value
  document.querySelector("#loop button").onclick = () => {
    audio.loop = !audio.loop;
    if (audio.loop) {
      //   filter: invert(100%) brightness(0.5);
      document.querySelector("#loop button").classList.remove("disabled");
    } else {
      document.querySelector("#loop button").classList.add("disabled");
    }
  };
  
  
  
  // on press play button play audio (or unpause) and change button icon
  document.querySelector("#play-pause button").onclick = () => {
    // if no audio is loaded, do nothing
    if (audio.src == "") {
      return;
    }
    if (audio.paused) {
      audio.play();
      document.querySelector("#play-pause button").innerHTML = "pause";
    } else {
      audio.pause();
      document.querySelector("#play-pause button").innerHTML = "play";
    }
  };
  
  // on audio end, change play button icon
  audio.onended = () => {
    document.querySelector("#play-pause button").innerHTML = "Play";
  };
  
  
  // initial buttons triggering playing a track
  // const playlist_tracks = document.querySelectorAll("#playlist ol li button");
  const tracks = [
    // [track_name, track_year, track_path]

    ["silenthill", 2024, silenthill],
    ["metroidlike", 2024, metroidlike],
    ["echoengeles", 2024, echoengeles],
    ["footsteps_sand", 2024, footsteps_sand],
    ["plaza_radosna4", 2024, plaza_radosna4],
    ["somsiadpuk", 2024, somsiadpuk],

    ["turetibrek", 2023, turetibrek],
    ["nights_kurafiia", 2023, nights_kurafiia],
    ["grimy_sheet_gonges", 2023, grimy_sheet_gonges],
    ["sirene2", 2023, sirene2],
    
  ];


 
    
  const track_buttons = [];
  // iterate over playlist items
  tracks.forEach((track) => {    
    // create row for each track
    let row = document.createElement("div");
    row.innerHTML =
    `
    <li class="table-row">
      <button class="trackBtn table-cell mr-4">
        ${track[0]}
      </button>
      <span class="table-cell pr-4">${track[1]}</span>
      <button class="downloadBtn table-cell bg-white align-middle material-icons-outlined  cursor-pointer">V</button>
    </li>
    `.trim();
    row = row.children[0];
    document.querySelector("#playlist ol").appendChild(row);

    // get button inside li
    const btn = row.querySelector(".trackBtn");
    track_buttons.push(btn);
    btn.onclick = () => {

      // make all the other buttons greyed out (change color's alpha to 0.8)
      track_buttons.forEach((button) => {
        button.classList.remove("active");
      });
      // make this button active
      btn.classList.add("active");

      audio.src = track[2];

      // play audio
      audio.play();
    };

    // on click downloadBtn
    const downloadBtn = row.querySelector(".downloadBtn");
    downloadBtn.onclick = () => {
      // download
      const a = document.createElement("a");
      a.href = track[2];
      a.download = track[0];
      a.click();
      a.remove();
    };
  });



  // change #current-time and #max-time spans
  audio.ontimeupdate = () => {
    console.log("ontimeupdate");
  
    // time in format 0:00 (minutes:seconds)
    const time = Math.floor(audio.currentTime / 60) + ":" + Math.floor(audio.currentTime % 60).toString().padStart(2, "0");
    document.querySelector("#current-time span").innerText = time;
  };
  
  // on pressing spacebar, play/pause audio
  document.body.onkeydown = (e) => {
    if (e.code == "Space") {
      // prevent scrolling
      e.preventDefault();
      // play/pause audio
      document.querySelector("#play-pause button").onclick();
    }
  };
  
  
    
}




initBackground();
initAudioPlayer();