document.querySelectorAll(".cell img, .cell video").forEach(media => {
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
      media.getElementsByTagName("source")[0].src = media.getElementsByTagName("source")[0].src.split("#")[0];
    }
    
    document.querySelector(".popup-image .cell").innerHTML = media.outerHTML;
  }
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