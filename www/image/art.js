import kategoriia from "/resources/image/kategoriia.jpg";
import vinyl3 from "/resources/image/vinyl3.jpg";
import grainy_black_white_sunset_2 from "/resources/image/grainy_black_white_sunset_2.jpg";
import pantera_fluid from "/resources/image/pantera_fluid.jpg";
import demon from "/resources/image/demon.jpg";
import oldman_bus from "/resources/image/oldman_bus.jpg";
import dog from "/resources/image/dog.jpg";
import starman from "/resources/image/starman.jpg";
import gravyard from "/resources/image/gravyard.jpg";
import morrigan from "/resources/image/morrigan.jpg";
import dojo from "/resources/image/dojo.jpg";
import slyszalas from "/resources/image/slyszalas.jpg";
import benten_guwno from "/resources/image/benten_guwno.jpg";
import desert_giants from "/resources/image/desert_giants.jpg";
import gonnn from "/resources/image/gonnn.jpg";
import steve_mao from "/resources/image/steve_mao.jpg";
import plnscp from "/resources/image/plnscp.jpg";
import jablon from "/resources/video/jablon.mp4";
import cherry_island from "/resources/image/cherry_island.jpg";
import cherry_island_2 from "/resources/image/cherry_island_2.jpg";
import mountain_temple from "/resources/image/mountain_temple.jpg";
import krystal_halo from "/resources/image/krystal_halo.jpg";
import rotating_one from "/resources/video/rotating_one.mp4";
import potwur from "/resources/image/potwur.jpg";
import mefisto from "/resources/image/mefisto.jpg";
import playIcon from "/resources/icons/play_arrow_FILL0_wght100_GRAD-25_opsz48.svg";
import sunsetmary6 from "/resources/image/sunsetmary6.jpg";
import marystajenka from "/resources/image/marystajenka.jpg";

let images = [
  [sunsetmary6, "sunsetmary6 (2023)"],
  [mefisto, "mefisto (2023)"],
  [kategoriia, "kategoriia (2023)"],
  [vinyl3, "vinyl3 (2023)"],
  // [grainy_black_white_sunset_2, "grainy_black_white_sunset_2"],
  [pantera_fluid, "pantera_fluid (2023)"],
  [demon, "demon (2023)"],
  [oldman_bus, "oldman_bus (2023)"],
  // [dog, "dog"],
  [starman, "starman (2023)"],
  [gravyard, "gravyard (2023)"],
  [morrigan, "morrigan (2023)"],
  [marystajenka, "marystajenka (2022)"],
  [dojo, "dojo (2022)"],
  [slyszalas, "slyszalas (2022)"],
  [benten_guwno, "benten_guwno (2022)"],
  [desert_giants, "desert_giants (2022)"],
  [gonnn, "gonnn (2022)"],
  [steve_mao, "steve_mao (2022)"],
  [plnscp, "plnscp (2022)"],
  [jablon, "jablon (2022)"],
  [cherry_island, "cherry_island (2021)"],
  [cherry_island_2, "cherry_island_2 (2021)"],
  [mountain_temple, "mountain_temple (2021)"],
  [krystal_halo, "krystal_halo (2021)"],
  [rotating_one, "rotating_one (2021)", "6.0"],
  [potwur, "potwur (2020)"],
];

let grid = document.getElementById("gridContainer");
images.forEach((img, i) => {
  let path = img[0];

  let content;
  if (path.endsWith(".mp4")) {
    
    if (img.length == 3) {
      // add time offset to video source
      path = path + "#t=" + img[2];
    } 
    
    content = `
      <div class="cell group">
        <video class="cell-media group-hover:scale-105 transition" loading="lazy" src="${path}" alt="video" /></video>
        <span class="material-symbols-outlined play-icon">play_arrow</span>
        <span class="cell-subtitle invisible group-hover:visible ">${img[1]}</span>
      </div>
      `;
  } else if (path.endsWith(".jpg")) {
    content = `
      <div class="cell group">
        <img class="cell-media group-hover:scale-105 transition" loading="lazy" src="${path}" alt="image" /></img>
        <span class="cell-subtitle invisible group-hover:visible ">${img[1]}</span>
      </div>
      `;
  } else {
    throw "Unknown path type";
  }

  // create element with html of content
  let cell = document.createElement("div");
  cell.innerHTML = content;  
  cell = cell.children[0];

  grid.appendChild(cell);
});

initPopup();


// /// POPUP
function initPopup(){

  document.querySelectorAll(".cell-media").forEach((media) => {
    media.onclick = () => {
      console.log(media);
      // show popup window
      console.log("showing");
      document.querySelector("#popup-background").style.display = "flex";

      const image =document.querySelector("#popup-image");
      const video = document.querySelector("#popup-video");

      // if media is image, hide video
      if (media.tagName == "IMG") {
        image.src = media.src;
        image.style.display = "flex";
        video.style.display = "none";
        
      }
      else if (media.tagName == "VIDEO") {
        image.style.display = "none";
        video.style.display = "flex";
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        // remove time offset from video source before setting it
        video.src = media.src.split("#")[0];
      }      
    };
  });
  
  // hide popup window on click anywhere
  document.querySelector("#popup-background").onclick = () => {
    document.querySelector("#popup-background").style.display = "none";
  };
  
}
