import * as THREE from "three";
import { AudioDisplacementShader } from "./shaders";
import ExampleAudio from "./example_audio.mp3";


const g = {
    FREQ_SAMPLES: 512,
    TIME_SAMPLES: 1200,
    DATA: null,
    PLANE_WIDTH: 12,
    PLANE_HEIGHT: 5,
    HAS_STARTED: false,
};
g.NUM_VERTICES = (g.TIME_SAMPLES + 1) * (g.FREQ_SAMPLES + 1);
g.DISPLACEMENTS_ARRAY = new Uint8Array(g.NUM_VERTICES);
g.FREQ_TIME_RATION = g.FREQ_SAMPLES / g.TIME_SAMPLES;


export function initThree() {

    g.DPI = 1;
  const canvas = document.getElementById("canvas3d");
  g.RENDERER = new THREE.WebGLRenderer({ antialias: true, canvas: canvas});
  g.RENDERER.setSize(window.innerWidth, window.innerHeight, false);
  g.RENDERER.setPixelRatio(g.DPI);

  // colorspace
  g.RENDERER.outputColorSpace = THREE.LinearSRGBColorSpace;

  // scene
  const scene = new THREE.Scene();
  g.SCENE = scene;
  g.SCENE.background = new THREE.Color(0x000000);

  // g.CAMERA
  g.CAMERA = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    g.CAMERA_FAR
  );
  g.CAMERA.position.set(0, 0, 9);
  scene.add(g.CAMERA);


    //// draw plane facing camera   
    const geometry = new THREE.PlaneGeometry(g.PLANE_WIDTH, g.PLANE_HEIGHT, g.TIME_SAMPLES, g.FREQ_SAMPLES);
    const material = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(AudioDisplacementShader.uniforms),
        vertexShader: AudioDisplacementShader.vertexShader,
        fragmentShader: AudioDisplacementShader.fragmentShader,
        side: THREE.DoubleSide,
        wireframe: false,
    });
    //// fill vDisplacement attribute with random value from 0 to 1
    const displacement = new Float32Array(geometry.attributes.position.count);
    for (let i = 0; i < displacement.length; i++) {
        displacement[i] = Math.random();
    }
    geometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 1));
    geometry.computeVertexNormals();
    //// create mesh
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(0, 0, 0);
    plane.lookAt(g.CAMERA.position);
    scene.add(plane);
    g.MESH = plane;

    // // audiocontext and fft analyser
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 4*g.FREQ_SAMPLES;
    analyser.smoothingTimeConstant = 0.5;
    g.ANALYSER = analyser;
    g.AUDIO_CONTEXT = audioContext;
    g.EXAMPLE_AUDIO = new Audio(ExampleAudio);
    g.EXAMPLE_AUDIO.loop = true;
    
    g.DATA = new Uint8Array(g.FREQ_SAMPLES);   
    const exampleBtn = document.getElementById("exampleBtn");
    
    exampleBtn.onclick = playAudioFile;

    // g.SOURCE = g.AUDIO_CONTEXT.createMediaStreamSource(stream);
    // g.SOURCE.connect(g.ANALYSER);
    // navigator.mediaDevices.getUserMedia({ audio: {echoCancellation:false} }).then(processAudio); 
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function updateGeometry() {
    g.ANALYSER.getByteFrequencyData(g.DATA);

    //// fill 1 column of the plane with 1s
    for (let i = 0; i < g.FREQ_SAMPLES; i++) {
        g.DISPLACEMENTS_ARRAY[i*(g.TIME_SAMPLES+1)-1 ] = g.DATA[g.FREQ_SAMPLES-i-1];
        g.DISPLACEMENTS_ARRAY.copyWithin(i*(g.TIME_SAMPLES+1), i*(g.TIME_SAMPLES+1)+1, (i+1)*(g.TIME_SAMPLES+1));
    }

    g.MESH.geometry.setAttribute('displacement', new THREE.Uint8BufferAttribute(g.DISPLACEMENTS_ARRAY, 1));
}

// onresize
function updateViewport() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    g.RENDERER.setSize(width, height, false);
    g.RENDERER.setPixelRatio(g.DPI);
}

function animate() {
    requestAnimationFrame(animate);
    updateGeometry();
    g.RENDERER.render(g.SCENE, g.CAMERA);
    
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const showInfoPanel = () => {
    const infoPanel = document.getElementById("infoPanel");
    infoPanel.style.visibility = "visible";
};
export const hideInfoPanel = () => {
    const infoPanel = document.getElementById("infoPanel");
    infoPanel.style.visibility = "hidden";
};


function initAudioFileSource() {
    //// load audio to audio context
    g.AUDIO_CONTEXT.createMediaElementSource(g.EXAMPLE_AUDIO)
    .connect(g.ANALYSER) // pass audio through analyser
    .connect(g.AUDIO_CONTEXT.destination); //play audio to speakers
    
}

async function initMicrophoneSource() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: {echoCancellation:false} }); 
    g.AUDIO_CONTEXT.createMediaStreamSource(stream).connect(g.ANALYSER);
}

function resumeAudioContext() {
    if (g.ANALYSER.context.state === 'suspended') {
        g.ANALYSER.context.resume();
    }
    if (g.ANALYSER.context.state === 'suspended') {
        g.ANALYSER.context.resume();
    }
}

const playAudioFile = () => {
        
    resumeAudioContext();

        g.EXAMPLE_AUDIO.currentTime = 0;
        g.EXAMPLE_AUDIO.play();
        
        if (g.HAS_STARTED) {
            return;
        }
        g.HAS_STARTED = true;
        
};

//// on click body hide startPanel
document.body.addEventListener("click", () => {
    const startPanel = document.getElementById("startPanel");
    startPanel.style.visibility = "hidden";
    if (!g.HAS_STARTED) {
        playAudioFile();
    }
    
});

// on click "uploaded" button file pick and replace example audio
const uploadBtn = document.getElementById("uploadBtn");
uploadBtn.onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.click();
    input.onchange = () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            g.EXAMPLE_AUDIO.src = reader.result;
            playAudioFile();
        };
        reader.readAsDataURL(file);
    };

    input.remove();
};




initThree();
animate();


window.onresize = updateViewport;