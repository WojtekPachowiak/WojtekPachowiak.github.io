export function initSpritesheetLoader() {
  //create image
  var bitmap = document.createElement("canvas");
  var ctx = bitmap.getContext("2d", {});
  bitmap.width = window.innerWidth;
  bitmap.height = window.innerHeight;
  ctx.font = "60px monospace";
  ctx.fillStyle = "white";
  ctx.textRendering = "geometricPrecision";
}