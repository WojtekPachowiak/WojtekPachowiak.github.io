


let cell_paths = [
    "image/grainy_black_white_sunset_2.png",
    "image/demon.jpg",
    "image/preman.jpg",
    "image/dog.jpg",
    "image/gravyard.png",
    "image/morrigan.png",
    "image/dojo.png",
    "image/pantera_fluid.png",
    "image/slyszalas.png",
    "image/benten_guwno.png",
    "image/starman.jpg",
    "image/desert_giants.jpg",
    "image/gonnn.jpg",
    "image/steve_mao.jpg",
    "image/plnscp.jpg",
    "image/mundo.png",
    "video/jablon.mp4",
    "image/cherry_island.jpg",
    "image/cherry_island_2.jpg",
    "image/mountain_temple.jpg",
    "image/krystal_halo.jpg",
    "video/rotating_one.mp4#t=6.0",
    "image/potwur.jpg",
    
];



let grid = document.getElementsByClassName("image-container")[0];
console.log(grid);
cell_paths.forEach(path => {
    let cell = document.createElement("div");
    cell.className = "cell";

    let content;
    if (path.startsWith("video")) {
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
      <img class="media" src="${path}" alt="" />
      `;
    }
    else {
        throw "Unknown path type";
    }
    cell.innerHTML = content;
    grid.appendChild(cell);
});
