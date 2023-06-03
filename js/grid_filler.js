


let cell_paths = [
    "image/kategoriia",
    "image/vinyl3",
    "image/grainy_black_white_sunset_2",
    "image/pantera_fluid",
    "image/demon",
    "image/oldman_bus",
    "image/dog",
    "image/starman",
    "image/gravyard",
    "image/morrigan",
    "image/dojo",
    "image/slyszalas",
    "image/benten_guwno",
    "image/desert_giants",
    "image/gonnn",
    "image/steve_mao",
    "image/plnscp",
    "video/jablon",
    "image/cherry_island",
    "image/cherry_island_2",
    "image/mountain_temple",
    "image/krystal_halo",
    "video/rotating_one#t=6.0",
    "image/potwur",
    
];



let grid = document.getElementsByClassName("image-container")[0];
console.log(grid);
cell_paths.forEach(path => {
    let cell = document.createElement("div");
    cell.className = "cell";

    let content;
    if (path.startsWith("video")) {
        if (path.split("#").length > 1) {
            // add time offset to video source
            path = path.split("#")[0] + ".mp4" + "#" + path.split("#")[1];
        }
        else{ 
            path = path + ".mp4";
        }
        content =
            `
            <img class="video-icon" src="icons/play_arrow_FILL0_wght400_GRAD0_opsz48.svg"></span>
            <video class="media">
            <source src="${path}" type="video/mp4">
            
            Your browser does not support the video tag.
            </video>
      
      `;
    }
    else if (path.startsWith("image")) {
        content =
            `
      <img class="media" src="${path}.jpg" alt="" />
      `;
    }
    else {
        throw "Unknown path type";
    }
    cell.innerHTML = content;
    grid.appendChild(cell);
});
