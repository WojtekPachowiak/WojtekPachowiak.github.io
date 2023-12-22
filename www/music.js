import * as THREE from "three";
import backgroundShader from "./resources/shaders/music_background.glsl?raw";
import WebGL from "three/addons/capabilities/WebGL.js";

// buttons
import volume from "./resources/icons/sound-player-timeline/volume.svg";
import nosound from "./resources/icons/sound-player-timeline/nosound.svg";
import play from "./resources/icons/sound-player-timeline/play.svg";
import pause from "./resources/icons/sound-player-timeline/pause.svg";


// tracks
import sirene2 from "./resources/sound/sirene2.mp3";
import grimy_sheet_gonges from "./resources/sound/grimy_sheet_gonges.mp3";
import nights_kurafiia from "./resources/sound/nights_kurafiia.mp3";
if (matchMedia("(pointer:coarse)").matches) {
  document.body.innerHTML = "";
  
  alert("Mobile devices not supported yet. Sorry! Only desktop :(");
  throw "Mobile devices not supported yet. Sorry! Only desktop :(";
}

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
    window.devicePixelRatio
  );
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.width = "100%";
  // scene
  const scene = new THREE.Scene();
  // shader background
  const plane_geometry = new THREE.PlaneGeometry(10, 10);
  const plane_material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 1 },
      resolution: {
        value: new THREE.Vector2(
          window.innerWidth * window.devicePixelRatio,
          window.innerHeight * window.devicePixelRatio
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
      window.devicePixelRatio
    );
    // plane_mesh.scale.set(window.innerWidth / window.innerHeight, 1, 1);
    plane_material.uniforms.resolution.value = new THREE.Vector2(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    );
  }
  window.onresize = updateViewport;

}

function initAudioPlayer(){

  let audio = new Audio();
  audio.loop = false;
  audio.volume = 0.5;
  
  // slider fll color
  const s = document.querySelector("#timeline-slider")
  function progressColorFill() {
    const sVal = s.value;
    s.style.background = `linear-gradient(to right, #fff ${sVal}%, #555 ${sVal}%)`;
  }
  // by default disable the slider (no audio loaded)
  s.disabled = true;
  // by default play button is greyed out because no audio is loaded
  document.querySelector("#play-pause button").style.filter = "invert(100%) brightness(0.5)";
  // on audio load, enable slider
  audio.onloadedmetadata = () => {
    // change slider value
    s.value = 0;
  
    // change slider color
    progressColorFill();
  
    // enable interaction with slider
    if (s.disabled) {
      s.disabled = false;
    }
  
    // change background-color of #timeline-slider::-webkit-slider-thumb to white
    const style = document.createElement("style");
    style.innerHTML = `
      #timeline-slider::-webkit-slider-thumb {
        background-color: white;
      }
    `;
    document.head.appendChild(style);
  
    // change color of play button
    document.querySelector("#play-pause button").style.filter = "brightness(1.0)";
  
  
  
    // time in format 0:00 (minutes:seconds)
    const maxTime = Math.floor(audio.duration / 60) + ":" + Math.floor(audio.duration % 60).toString().padStart(2, "0");
    document.querySelector("#max-time span").innerText = maxTime;
  };
  
  
  
  
  
  // on press loop button change loop value
  document.querySelector("#loop button").onclick = () => {
    audio.loop = !audio.loop;
    if (audio.loop) {
      //   filter: invert(100%) brightness(0.5);
      document.querySelector("#loop").style.filter = "invert(100%) brightness(1.0)";
    } else {
      document.querySelector("#loop").style.filter = "invert(100%) brightness(0.5)";
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
      document.querySelector("#play-pause button img").src = pause;
    } else {
      audio.pause();
      document.querySelector("#play-pause button img").src = play;
    }
  };
  
  // on audio end, change play button icon
  audio.onended = () => {
    document.querySelector("#play-pause button img").src = play;
  };
  
  
  // audio playing logic
  s.oninput = () => {
    // change audo time
    audio.currentTime = audio.duration * (s.value / 100);
    // change slider color
    progressColorFill();
  };
  
  
  
  const tracks = [
    ["nights_kurafiia", nights_kurafiia],
    ["grimy_sheet_gonges", grimy_sheet_gonges],
    ["sirene2", sirene2],
  ]
  // initial buttons triggering playing a track
  const playlist = document.querySelector("#playlist ol")
  const trackButtons = []
  tracks.forEach((track) => {
    // create li with button inside and inner text track name
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.innerText = track[0];
    trackButtons.push(button);
    // on click play audio
    button.onclick = () => {
      // make all the other buttons greyed out (change color's alpha to 0.8)
      trackButtons.forEach((button) => {
        button.style.color = "";
      });
      // make this button white
      button.style.color = "rgba(255, 255, 255, 1.0)";
  
      // change audio source
      audio.src = track[1];

  
      // play audio
      audio.play();
  
    };
    li.appendChild(button);
    playlist.appendChild(li);
  });
  
  // change #current-time and #max-time spans
  audio.ontimeupdate = () => {
    console.log("ontimeupdate");
  
    // time in format 0:00 (minutes:seconds)
    const time = Math.floor(audio.currentTime / 60) + ":" + Math.floor(audio.currentTime % 60).toString().padStart(2, "0");
    document.querySelector("#current-time span").innerText = time;
  
    // change slider value
    s.value = (audio.currentTime / audio.duration) * 100;
  
    // change slider color
    progressColorFill();
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
  
  
  // on pressing #volume buton, mute/unmute audio
  document.querySelector("#volume button").onclick = () => {
    if (audio.muted) {
      audio.muted = false;
      document.querySelector("#volume button img").src = volume;
    } else {
      audio.muted = true;
      document.querySelector("#volume button img").src = nosound;
    }
  };
    
}




initBackground();
initAudioPlayer();