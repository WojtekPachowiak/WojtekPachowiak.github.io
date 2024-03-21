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

let grid = document.getElementsByClassName("container")[0];
images.forEach((img) => {
  let path = img[0];
  let cell = document.createElement("div");
  cell.className = "cell";

  let content;
  if (path.endsWith(".mp4")) {
    if (img.length == 3) {
      // add time offset to video source
      path = path + "#t=" + img[2];
    } 
    content = `
            <div>
            <img class="video-icon" src="${playIcon}"></span>
            <video class="media">
            <source src="${path}" type="video/mp4">
            
            Your browser does not support the video tag.
            </video>
            <span class="media-title">${img[1]}</span>

            </div>
      
      `;
  } else if (path.endsWith(".jpg")) {
    content = `
        <div>
        <img class="media" loading="lazy" src="${path}" alt="image" />
        <span class="media-title">${img[1]}</span>
        </div>
      `;
  } else {
    throw "Unknown path type";
  }

  if (matchMedia("(pointer:fine)").matches) {
    console.log("fine pointer");
    // on hover show title
    cell.onmouseover = () => {
      cell.getElementsByClassName("media-title")[0].style.display = "block";
    };
    cell.onmouseout = () => {
      cell.getElementsByClassName("media-title")[0].style.display = "none";
    };
  }
  

  cell.innerHTML = content;
  grid.appendChild(cell);
});

// ///

document.querySelectorAll(".cell .media").forEach((media) => {
  media.onclick = () => {
    // show popup window
    document.querySelector(".popup-image").style.display = "block";
    // set image in popup window
    if (media.tagName == "VIDEO") {
      media = media.cloneNode(true);
      media.controls = true;
      media.autoplay = true;
      media.loop = true;
      // remove time offset from video source
      media.getElementsByTagName("source")[0].src = media
        .getElementsByTagName("source")[0]
        .src.split("#")[0];
    }

    document.querySelector(".popup-image").innerHTML = media.outerHTML;
  };
});

// // "X" button to close popup window
// let s = document.querySelector(".popup-image span")
// if (s != null) {
//   s.onclick = () => { document.querySelector(".popup-image").style.display = "none"; }
// };

// hide popup window on click anywhere
document.querySelector(".popup-image").onclick = () => {
  document.querySelector(".popup-image").style.display = "none";
};
