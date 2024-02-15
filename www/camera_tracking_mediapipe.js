// Copyright 2023 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";


let poseLandmarker = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoHeight = "360px";
const videoWidth = "480px";
const video = document.getElementById("webcam");
let averageEyePosition = { x: 0.5, y: 0.5, z: 0.5 };
let lastAverageEyePositions = []; 
let lastAverageEyePositionsLength = 30;
let faceNormalVector = { x: 0, y: 0, z: 0 };
let lastFaceNormalVectors = [];
let lastFaceNormalVectorsLength = 30;

export function initWebcamTracking() {
  createPoseLandmarker().then(() => {
    console.log("PoseLandmarker is ready!");
    enableCam();
  });
}

export function getAverageEyePosition() {
  return averageEyePosition;
}

export function getFaceNormalVector() {
  return faceNormalVector;
}


// Before we can use PoseLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`,
      delegate: "GPU"
    },
    runningMode: runningMode,
    numPoses: 2
  });
};


// // Check if webcam access is supported.
// const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

// // If webcam supported, add event listener to button for when user
// // wants to activate it.
// if (hasGetUserMedia()) {
//   enableWebcamButton = document.getElementById("webcamButton");
//   enableWebcamButton.addEventListener("click", enableCam);
// } else {
//   console.warn("getUserMedia() is not supported by your browser");
// }




// Enable the live webcam view and start detection.
function enableCam(event) {
  
    console.log("enableCam");

  if (webcamRunning === true) {
    webcamRunning = false;
  } else {
    webcamRunning = true;
  }

  // getUsermedia parameters.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

async function predictWebcam() {
  const canvasElement = document.getElementById("output_canvas");
  const canvasCtx = canvasElement.getContext("2d");
  const drawingUtils = new DrawingUtils(canvasCtx);
  let lastVideoTime = -1;

  canvasElement.style.height = videoHeight;
  video.style.height = videoHeight;
  canvasElement.style.width = videoWidth;
  video.style.width = videoWidth;
  // Now let's start detecting the stream.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await poseLandmarker.setOptions({ runningMode: "VIDEO" });
  }
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
      if (result.landmarks.length === 0) {
        return;
      }

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // draw landmarks
      for (const landmark of result.landmarks) {
        // console.log(result);
        // wait indefinataely

        drawingUtils.drawLandmarks(landmark, {
          radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 0.5, 0.1),
        });
        drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
      }

      // get head position by averaging the position of the eyes
      const eyesLandmarks = [0];

      const eyePositions = eyesLandmarks.map(
        (index) => result.landmarks[0][index]
      );

      averageEyePosition = eyePositions.reduce(
        (acc, position) => {
          acc.x += position.x;
          acc.y += position.y;
          acc.z += position.z;
          return acc;
        },
        { x: 0, y: 0, z: 0 }
      );
      averageEyePosition.x /= eyePositions.length;
      averageEyePosition.y /= eyePositions.length;
      averageEyePosition.z /= eyePositions.length;
      
      // clamp max distance from last position
      const maxDifference = 0.3;
      const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
      if (lastAverageEyePositions.length !== 0) {
        averageEyePosition.x = clamp(
          averageEyePosition.x,
          lastAverageEyePositions[lastAverageEyePositions.length - 1].x - maxDifference,
          lastAverageEyePositions[lastAverageEyePositions.length - 1].x + maxDifference
        );
        averageEyePosition.y = clamp(
          averageEyePosition.y,
          lastAverageEyePositions[lastAverageEyePositions.length - 1].y - maxDifference,
          lastAverageEyePositions[lastAverageEyePositions.length - 1].y + maxDifference
        );
        averageEyePosition.z = clamp(
          averageEyePosition.z,
          lastAverageEyePositions[lastAverageEyePositions.length - 1].z - maxDifference,
          lastAverageEyePositions[lastAverageEyePositions.length - 1].z + maxDifference
        );

      }


      lastAverageEyePositions.push(averageEyePosition);
      if (lastAverageEyePositions.length > lastAverageEyePositionsLength) {
        lastAverageEyePositions.shift();
      }

      // moving average
      averageEyePosition = lastAverageEyePositions.reduce(
        (acc, position) => {
          acc.x += position.x;
          acc.y += position.y;
          acc.z += position.z;
          return acc;
        },
        { x: 0, y: 0, z: 0 }
      );
      averageEyePosition.x /= lastAverageEyePositions.length;
      averageEyePosition.y /= lastAverageEyePositions.length;
      averageEyePosition.z /= lastAverageEyePositions.length;


        // face normal vector out of eyes and nose
        const nose = 0;
        const leftEye = 5;
        const rightEye = 2;
        
        // cross product of the vector between the eyes and the nose
        const vector1 = {
          x: result.landmarks[0][leftEye].x - result.landmarks[0][nose].x,
          y: result.landmarks[0][leftEye].y - result.landmarks[0][nose].y,
          z: result.landmarks[0][leftEye].z - result.landmarks[0][nose].z
        };
        const vector2 = {
          x: result.landmarks[0][rightEye].x - result.landmarks[0][nose].x,
          y: result.landmarks[0][rightEye].y - result.landmarks[0][nose].y,
          z: result.landmarks[0][rightEye].z - result.landmarks[0][nose].z
        };
        faceNormalVector = {
          x: vector1.y * vector2.z - vector1.z * vector2.y,
          y: vector1.z * vector2.x - vector1.x * vector2.z,
          z: vector1.x * vector2.y - vector1.y * vector2.x
        };
        const magnitude = Math.sqrt(
          faceNormalVector.x * faceNormalVector.x +
          faceNormalVector.y * faceNormalVector.y +
          faceNormalVector.z * faceNormalVector.z
        );
        faceNormalVector.x /= magnitude;
        faceNormalVector.y /= magnitude;
        faceNormalVector.z /= magnitude;
          
        lastFaceNormalVectors.push(faceNormalVector);
        if (lastFaceNormalVectors.length > lastFaceNormalVectorsLength) {
          lastFaceNormalVectors.shift();
        }
        faceNormalVector = lastFaceNormalVectors.reduce(
          (acc, position) => {
            acc.x += position.x;
            acc.y += position.y;
            acc.z += position.z;
            return acc;
          },
          { x: 0, y: 0, z: 0 }
        );
        faceNormalVector.x /= lastFaceNormalVectors.length;
        faceNormalVector.y /= lastFaceNormalVectors.length;
        faceNormalVector.z /= lastFaceNormalVectors.length;
        // faceNormalVector.x = -faceNormalVector.x;
        // faceNormalVector.y = -faceNormalVector.y;
          



        

      canvasCtx.restore();
    });
  }

  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}
