import JSZip from "jszip";
const globals = {
  ZOOM_SPEED: 1.1,
  ZOOM_LEVEL: 1,
  DOMINANT_COLOR: null,
  MOUSE_POS: { x: 0, y: 0 },
  BOUDING_BOXES: [],
  IMAGE_MATRIX: null,
  IMAGE_NAME: null,
};

window.globals = globals;


// on file drop event or select file hide "spritesheetCanvasBeforeUpload" and show "spritesheetCanvasAfterUpload"\
const LEFT_PANE = document.getElementById("leftPane");

const CANVAS_ELE_BEFORE_UPLOAD = document.getElementById(
  "spritesheetCanvasBeforeUpload"
);
const CANVAS_ELE_AFTER_UPLOAD = document.getElementById(
  "spritesheetCanvasAfterUpload"
);
const FILE_PICKER = document.getElementById("filePicker");
const CANVAS_ELE = document.getElementById("spritesheetCanvas");
const CTX = CANVAS_ELE.getContext("2d", {
  antialias: false,
  willReadFrequently: true,
});


function getDominantColor(imageMatrix) {
  const colorCounts = {};
  for (let i = 0; i < imageMatrix.data.length; i += 4) {
    const color = `#${imageMatrix.data[i]
      .toString(16)
      .padStart(2, "0")}${imageMatrix.data[i + 1]
      .toString(16)
      .padStart(2, "0")}${imageMatrix.data[i + 2]
      .toString(16)
      .padStart(2, "0")}`;
    if (colorCounts[color]) {
      colorCounts[color]++;
    } else {
      colorCounts[color] = 1;
    }
  }
  let maxCount = 0;
  let dominantColor = null;
  for (const color in colorCounts) {
    if (colorCounts[color] > maxCount) {
      maxCount = colorCounts[color];
      dominantColor = color;
    }
  }
  return dominantColor;
}


function readFile(file) {

  // if file is not an image  throw an error
  if (!file.type.startsWith("image/")) {
    alert("File is not an image");
    throw new Error("File is not an image");
  }
  

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      CANVAS_ELE.width = img.width;
      CANVAS_ELE.height = img.height;

      // get the ration between LEFT_PANE width/height and img width/height
      const ratio = Math.min(
        LEFT_PANE.offsetWidth / img.width,
        LEFT_PANE.offsetHeight / img.height
      );
      globals.ZOOM_LEVEL = ratio *0.9;
      const transform = `scale(${globals.ZOOM_LEVEL})`;
      CANVAS_ELE.style.transform = transform;

      CTX.drawImage(img, 0, 0);
      
      // //draw red on center
      // CTX.strokeStyle = "red";
      // CTX.strokeRect(img.width / 2 - 1, img.height / 2 - 1, 2, 2);

      globals.IMAGE_NAME = file.name.split(".")[0];

      globals.IMAGE_MATRIX = CTX.getImageData(0, 0, img.width, img.height);

      globals.DOMINANT_COLOR = getDominantColor(globals.IMAGE_MATRIX);
      // update color picker
      document.getElementById("colorPicker").value = globals.DOMINANT_COLOR;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  setButtonsActive(true);
  

}

function setButtonsActive(active) {
  const buttons = document.querySelectorAll("button");
  console.log("buttons", buttons);
  buttons.forEach((button) => {
    button.disabled = !active;
  });
}


FILE_PICKER.addEventListener("change", (e) => {
  const file = e.target.files[0];
  readFile(file);

  CANVAS_ELE_BEFORE_UPLOAD.classList.add("hidden");
  CANVAS_ELE_AFTER_UPLOAD.classList.remove("hidden");
});

CANVAS_ELE.addEventListener("dragover", (e) => {
  e.preventDefault();
});

CANVAS_ELE.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  readFile(file);
  CANVAS_ELE_BEFORE_UPLOAD.classList.add("hidden");
  CANVAS_ELE_AFTER_UPLOAD.classList.remove("hidden");
});



function zoomInView() {
    const scale = globals.ZOOM_LEVEL /1.1;
    globals.ZOOM_LEVEL = scale;

    const transform = `scale(${scale})`;
    CANVAS_ELE.style.transform = transform;
}

function zoomOutView() {
  const scale = globals.ZOOM_LEVEL * 1.1;
  globals.ZOOM_LEVEL = scale;
  
  const transform = `scale(${scale})`;
  CANVAS_ELE.style.transform = transform;
  console.log("scale", CANVAS_ELE.style.transform);
  
 
}

// zoom in zoom out spritesheet
const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");
zoomIn.addEventListener("click", () => {
  zoomInView();
});

zoomOut.addEventListener("click", () => {
  zoomOutView();
});

// on mouse scroll also zoom
CANVAS_ELE.addEventListener("wheel", (e) => {
  if (e.deltaY < 0) {
    zoomInView();
  } else {
    zoomOutView();
  }
});


// remove spritesheet
const removeSpritesheet = document.getElementById("removeSpritesheet");
removeSpritesheet.addEventListener("click", () => {
  CTX.clearRect(0, 0, CANVAS_ELE.width, CANVAS_ELE.height);
  CANVAS_ELE_BEFORE_UPLOAD.classList.remove("hidden");
  CANVAS_ELE_AFTER_UPLOAD.classList.add("hidden");
  setButtonsActive(false);
});




function downloadJSON(data, filename) {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

// parseable coordinates
const parseableCoordinates = document.getElementById("parseableCoordinates");
parseableCoordinates.addEventListener("click", () => {
  // download a .json file with the coordinates of the sprites
  const data = JSON.stringify(globals.BOUDING_BOXES);
  downloadJSON(data, `SC-coord-sprites-${globals.IMAGE_NAME}.json`);
});

// seperate images
const seperateImages = document.getElementById("seperateImages");
seperateImages.addEventListener("click", () => {
  
  //extract images from bounding boxes and download them as a zip
  const images = [];

  // get data from globals.IMAGE_MATRIX by creating temporary canvas and context
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = globals.IMAGE_MATRIX.width;
  tmpCanvas.height = globals.IMAGE_MATRIX.height;
  const tmpCtx = tmpCanvas.getContext("2d");
  tmpCtx.putImageData(globals.IMAGE_MATRIX, 0, 0);

  // iterate over the bounding boxes and extract the images
  globals.BOUDING_BOXES.forEach((bound) => {

    const image = tmpCtx.getImageData(
      bound.left,
      bound.top,
      bound.right - bound.left,
      bound.bottom - bound.top
    );
    
    // const image = CTX.getImageData(
    //   bound.left,
    //   bound.top,
    //   bound.right - bound.left,
    //   bound.bottom - bound.top
    // );
    const tmpcanvas = document.createElement("canvas");
    tmpcanvas.width = bound.right - bound.left;
    tmpcanvas.height = bound.bottom - bound.top;
    const tmpctx = tmpcanvas.getContext("2d");
    tmpctx.putImageData(image, 0, 0);
    images.push(tmpcanvas.toDataURL("image/png"));
  });
  //download as zip
  const zip = new JSZip();
  images.forEach((image, index) => {
    zip.file(`image${index}.png`, image.split("base64,")[1], { base64: true });
  });
  zip.generateAsync({ type: "blob" }).then((content) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `SC-sep-sprites-${globals.IMAGE_NAME}.zip`;
    a.click();
  });
});


// calculate bounds
const calculateBounds = document.getElementById("calculateBounds");
calculateBounds.addEventListener("click", () => {
  let backgroundColor = document.getElementById("colorPicker").value;
  backgroundColor = [
    parseInt(backgroundColor.slice(1, 3), 16),
    parseInt(backgroundColor.slice(3, 5), 16),
    parseInt(backgroundColor.slice(5, 7), 16),
  ];
  const imageMatrix = CTX.getImageData(
    0,
    0,
    CANVAS_ELE.width,
    CANVAS_ELE.height
  );

  function getBounds(imageMatrix, backgroundColor) {
    // an array of tuples (bottomLeft, topRight) identifying the bounds of each sprite
    const bounds = [];

    // reset the canvas with global.IMAGE_MATRIX
    // const tmpCanvas = document.createElement("canvas");
    // tmpCanvas.width = globals.IMAGE_MATRIX.width;
    // tmpCanvas.height = globals.IMAGE_MATRIX.height;
    // const tmpCtx = tmpCanvas.getContext("2d");
    // tmpCtx.putImageData(globals.IMAGE_MATRIX, 0, 0);
    CTX.putImageData(globals.IMAGE_MATRIX, 0, 0);
    
    
    

    // a fixed-size array of booleans to keep track of which pixels have been visited
    const visited = new Array(imageMatrix.data.length / 4).fill(false);

    // Algorithm:
    // 1. Iterate over the imageMatrix.data and find the first non-background pixel
    // 2. From this pixel, perform a flood fill (using a queue) to find the bounds of the sprite
    //    - keep track of the min and max x and y values of the pixels in the sprite
    //    - keep track of the pixels that have been visited
    // 3. when finished add these bounds to the bounds array
    // 4. repeat until all sprites are found

    for (let i = 0; i < imageMatrix.data.length; i += 4) {
      const checkBackground = (i) => {
        const epsilon = 30;
        return (
          Math.abs(imageMatrix.data[i] - backgroundColor[0]) < epsilon &&
          Math.abs(imageMatrix.data[i + 1] - backgroundColor[1]) < epsilon &&
          Math.abs(imageMatrix.data[i + 2] - backgroundColor[2]) < epsilon
        );
      };

      if (checkBackground(i) || visited[i / 4]) {
        continue;
      }

      const queue = [i / 4];
      let minx = Infinity;
      let miny = Infinity;
      let maxx = -Infinity;
      let maxy = -Infinity;

      while (queue.length > 0) {
        const index = queue.shift();
        if (visited[index]) {
          continue;
        }
        visited[index] = true;
        const x = index % imageMatrix.width;
        const y = Math.floor(index / imageMatrix.width);
        minx = Math.min(minx, x);
        miny = Math.min(miny, y);
        maxx = Math.max(maxx, x);
        maxy = Math.max(maxy, y);
        if (x > 0 && !visited[index - 1] && !checkBackground((index - 1) * 4)) {
          queue.push(index - 1);
        }
        if (
          x < imageMatrix.width - 1 &&
          !visited[index + 1] &&
          !checkBackground((index + 1) * 4)
        ) {
          queue.push(index + 1);
        }
        if (
          y > 0 &&
          !visited[index - imageMatrix.width] &&
          !checkBackground((index - imageMatrix.width) * 4)
        ) {
          queue.push(index - imageMatrix.width);
        }
        if (
          y < imageMatrix.height - 1 &&
          !visited[index + imageMatrix.width] &&
          !checkBackground((index + imageMatrix.width) * 4)
        ) {
          queue.push(index + imageMatrix.width);
        }
      }
      // make sure the bounds are not empty, singel pixel, etc
      if (maxx - minx > 0 && maxy - miny > 0)
        bounds.push({ left: minx, top: miny, right: maxx, bottom: maxy });


    }
    // draw these bounds on the canvas
    CTX.strokeStyle = "red";
    CTX.lineWidth = 1;
    bounds.map((bound) => {
      CTX.strokeRect(
        bound.left,
        bound.top,
        bound.right - bound.left,
        bound.bottom - bound.top
      );
    });
    return bounds;
  }

  globals.BOUDING_BOXES = getBounds(imageMatrix, backgroundColor);
});
