let paths = [
  "/resources/image/kategoriia",
  "/resources/image/vinyl3",
  "/resources/image/grainy_black_white_sunset_2",
  "/resources/image/pantera_fluid",
  "/resources/image/demon",
  "/resources/image/oldman_bus",
  "/resources/image/dog",
  "/resources/image/starman",
  "/resources/image/gravyard",
  "/resources/image/morrigan",
  "/resources/image/dojo",
  "/resources/image/slyszalas",
  "/resources/image/benten_guwno",
  "/resources/image/desert_giants",
  "/resources/image/gonnn",
  "/resources/image/steve_mao",
  "/resources/image/plnscp",
  "/resources/video/jablon",
  "/resources/image/cherry_island",
  "/resources/image/cherry_island_2",
  "/resources/image/mountain_temple",
  "/resources/image/krystal_halo",
  "/resources/video/rotating_one#t=6.0",
  "/resources/image/potwur",
];
let images = [
  ["/resources/image/kategoriia", "kategoriia"],
  ["/resources/image/vinyl3", "vinyl3"],
  ["/resources/image/grainy_black_white_sunset_2", "grainy_black_white_sunset_2"],
  ["/resources/image/pantera_fluid", "pantera_fluid"],
  ["/resources/image/demon", "demon"],
  ["/resources/image/oldman_bus", "oldman_bus"],
  ["/resources/image/dog", "dog"],
  ["/resources/image/starman", "starman"],
  ["/resources/image/gravyard", "gravyard"],
  ["/resources/image/morrigan", "morrigan"],
  ["/resources/image/dojo", "dojo"],
  ["/resources/image/slyszalas", "slyszalas"],
  ["/resources/image/benten_guwno", "benten_guwno"],
  ["/resources/image/desert_giants", "desert_giants"],
  ["/resources/image/gonnn", "gonnn"],
  ["/resources/image/steve_mao", "steve_mao"],
  ["/resources/image/plnscp", "plnscp"],
  ["/resources/video/jablon", "jablon"],
  ["/resources/image/cherry_island", "cherry_island"],
  ["/resources/image/cherry_island_2", "cherry_island_2"],
  ["/resources/image/mountain_temple", "mountain_temple"],
  ["/resources/image/krystal_halo", "krystal_halo"],
  ["/resources/video/rotating_one", "rotating_one"],
  ["/resources/image/potwur", "potwur"],
];

let grid = document.getElementsByClassName("container")[0];
images.forEach((img) => {
  let path = img[0];
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
            <img class="video-icon" src="resources/icons/play_arrow_FILL0_wght100_GRAD-25_opsz48.svg"></span>
            <video class="media">
            <source src="${path}" type="video/mp4">
            
            Your browser does not support the video tag.
            </video>
            <span class="media-title">${img[1]}</span>

            </div>
      
      `;
  } else if (path.includes("/image/")) {
    content = `
        <div>
        <img class="media" loading="lazy" src="${path}.jpg" alt="image" />
        <span class="media-title">${img[1]}</span>
        </div>
      `;
  } else {
    throw "Unknown path type";
  }
  
  // on hover show title
  cell.onmouseover = () => {
    cell.getElementsByClassName("media-title")[0].style.display = "block";
  };
  cell.onmouseout = () => {
    cell.getElementsByClassName("media-title")[0].style.display = "none";
  };

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
