let paths = [
  "/assets/image/kategoriia",
  "/assets/image/vinyl3",
  "/assets/image/grainy_black_white_sunset_2",
  "/assets/image/pantera_fluid",
  "/assets/image/demon",
  "/assets/image/oldman_bus",
  "/assets/image/dog",
  "/assets/image/starman",
  "/assets/image/gravyard",
  "/assets/image/morrigan",
  "/assets/image/dojo",
  "/assets/image/slyszalas",
  "/assets/image/benten_guwno",
  "/assets/image/desert_giants",
  "/assets/image/gonnn",
  "/assets/image/steve_mao",
  "/assets/image/plnscp",
  "/assets/video/jablon",
  "/assets/image/cherry_island",
  "/assets/image/cherry_island_2",
  "/assets/image/mountain_temple",
  "/assets/image/krystal_halo",
  "/assets/video/rotating_one#t=6.0",
  "/assets/image/potwur",
];

let grid = document.getElementsByClassName("container")[0];
paths.forEach((path) => {
  let cell = document.createElement("div");
  cell.className = "cell";

  let content;
  if (path.includes("/video/")) {
    if (path.split("#").length > 1) {
      // add time offset to video source
      path = path.split("#")[0] + ".mp4" + "#" + path.split("#")[1];
    } else {
      path = path + ".mp4";
    }
    content = `
            <div>
            <img class="video-icon" src="assets/icons/play_arrow_FILL0_wght100_GRAD-25_opsz48.svg"></span>
            <video class="media">
            <source src="${path}" type="video/mp4">
            
            Your browser does not support the video tag.
            </video>
            </div>
      
      `;
  } else if (path.includes("/image/")) {
    content = `
        <div>
        <img class="media" loading="lazy" src="${path}.jpg" alt="image" />
        </div>
      `;
  } else {
    throw "Unknown path type";
  }
  cell.innerHTML = content;
  grid.appendChild(cell);
});

// ///

document.querySelectorAll(".cell img, .cell video").forEach((media) => {
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
