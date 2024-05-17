//   const square = [
//     [1, 1, 1, 1],
//     [1, 0, 0, 1],
//     [1, 0, 0, 1],
//     [1, 0, 0, 1],
//     [1, 1, 1, 1],
//   ];

//   const space = [
//     [0, 0, 0, 0],
//     [0, 0, 0, 0],
//     [0, 0, 0, 0],
//     [0, 0, 0, 0],
//     [0, 0, 0, 0],
//   ];

//   const exclamation = [
//     [0, 1, 0, 0],
//     [0, 1, 0, 0],
//     [0, 1, 0, 0],
//     [0, 0, 0, 0],
//     [0, 1, 0, 0],
//   ];

//   const question = [
//     [1, 1, 1, 0],
//     [0, 0, 1, 0],
//     [0, 1, 0, 0],
//     [0, 0, 0, 0],
//     [0, 1, 0, 0],
//   ];

//   let data =[];
//   let data_black = [];
//   for (let i = 0; i < text.length; i++) {
//     let char = text[i];
//     let char_matrix = [];
//     switch (char) {
//       case " ":
//         char_matrix = space;
//         break;
//       case "!":
//         char_matrix = exclamation;
//         break;
//       case "?":
//         char_matrix = question;
//         break;
//       default:
//         char_matrix = square;
//         break;
//     }

//     const bo = 40;
//     data = data.concat(
//       char_matrix
//         .reduce((a, b) => [...a, ...b], [])
//         .reduce((a, b) => [...a, 255 - bo, 255 - bo, 255 - bo, 255 * b], [])
//     );
//     data_black = data_black.concat(
//       char_matrix
//         .reduce((a, b) => [...a, ...b], [])
//         .reduce((a, b) => [...a, 0 + bo, 0 + bo, 0 + bo, 255 * b], [])
//     );
//   }

//   if (data.length === 0) return;

//   const imgData = new ImageData(Uint8ClampedArray.from(data), 4*text.length);
//   const imgData_black = new ImageData(Uint8ClampedArray.from(data_black), 4*text.length);

//   // shadow (offset 1 pixel to the right and down)
//   g.UI.CTX.putImageData(
//     imgData_black,
//     (g.SCREEN.WINDOW_RESOLUTION.x / 2) * scale - text.length * 2 + 1,
//     g.SCREEN.WINDOW_RESOLUTION.y * scale - g.UI.TEXT.HEIGHT - 4 + 1
//   );

//   // white text
//   g.UI.CTX.putImageData(
//     imgData,
//     (g.SCREEN.WINDOW_RESOLUTION.x / 2) * scale - text.length * 2,
//     g.SCREEN.WINDOW_RESOLUTION.y * scale - g.UI.TEXT.HEIGHT -4
//   );

// }


  // g.UI.CTX.scale(1 / scale, 1 / scale);

  // const img = await createImageBitmap(
  //   g.UI.CANVAS,
  //   0,
  //   0,
  //   g.SCREEN.WINDOW_RESOLUTION.x * scale * scale,
  //   g.SCREEN.WINDOW_RESOLUTION.y * scale * scale
  // );

  // // clear
  // g.UI.CTX.clearRect(
  //   0,
  //   0,
  //   g.SCREEN.WINDOW_RESOLUTION.x * scale * scale,
  //   g.SCREEN.WINDOW_RESOLUTION.y * scale * scale
  // );

  // draw circle
  // g.UI.CTX.beginPath();
  // g.UI.CTX.arc(
  //   g.SCREEN.WINDOW_RESOLUTION.x / 2 *scale,
  //   g.SCREEN.WINDOW_RESOLUTION.y / 2 * scale,
  //   100,
  //   0,
  //   2 * Math.PI
  // );
  // g.UI.CTX.fillStyle = "red";
  // g.UI.CTX.fill();

  // g.UI.CTX.drawImage(img, 0, 0, g.SCREEN.WINDOW_RESOLUTION.x*scale, g.SCREEN.WINDOW_RESOLUTION.y*scale);



  //////////////////////////////////////////////////////////////////////////////////////

// export function TMPP() {
//   // blinking
//   if (g.UI.TEXT.BLINKING) {
//     const visible =
//       g.TIME % (g.UI.TEXT.BLINKING_RATE * 2) < g.UI.TEXT.BLINKING_RATE;
//     if (!visible) return;
//   }

//   // draw characters one by one according to the g.GLOBALS.UI.TEXT_T (0,1); rest pad with spaces
//   const full_text = g.UI.TEXT.TEXT;
//   const t = g.UI.TEXT.TEXT_T;
//   const text = full_text.substring(0, full_text.length * t);
//   // g.UI.CTX.fillText(
//   //   text + "-".repeat(full_text.length - text.length),
//   //   (g.SCREEN.WINDOW_RESOLUTION.x / 2) * scale,
//   //   (g.SCREEN.WINDOW_RESOLUTION.y - g.UI.TEXT.HEIGHT) * scale
//   //   // g.SCREEN.WINDOW_RESOLUTION.x * scale * 2/3
//   // );

//   for (let i = 0; i < text.length; i++) {
//     const letterWidth = drawLetter(
//       g.UI.CTX,
//       "A",
//       (g.SCREEN.WINDOW_RESOLUTION.x / 2) * scale - text.length * 2 + i * 4,
//       g.SCREEN.WINDOW_RESOLUTION.y * scale - g.UI.TEXT.HEIGHT - 4
//     );
//   }

///////////////////////////////////////

// export function drawLetter(canvasCtx, letter, x, y) {
//     const l = letters[letter];
//     if (!l) {
//         console.error(`Letter ${letter} not found`);
//         return;
//     }

//     const imgWidth = img.width;
//     const imgHeight = img.height;

//     // get random x
//     const lx = Math.floor(Math.random() * (imgWidth-letterWidth));
//     const offsetX = Math.floor(20*(Math.random()-0.5));

//     canvasCtx.drawImage(
//       img,
//       //   l.x, l.y, l.width, l.height,
//       lx,
//       0,
//       letterWidth,
//       letterHeight,
//       x,
//       y + offsetX,
//       //   l.width, l.height,
//       letterWidth * 1,
//       letterHeight * 1
//     );
    
// }

   // drawLetter(
    //   canvasCtx,
    //   "R",
    //   x + i * letterWidth - (text.length * letterWidth) / 2,
    //   y
    // );