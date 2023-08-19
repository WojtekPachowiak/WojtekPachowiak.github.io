import myFaceClosed from '/assets/image/myface/my_face_closed.jpg'
import myFaceOpen from '/assets/image/myface/my_face_open.jpg'
import lalala from '/assets/sound/drakengard1_lalalala_vhsed.mp3'
 
 
 //Get element my_face and switch it to my_face_open on click
 let my_face = document.getElementById("my_face");
 let arrow = document.getElementById("arrow");


 let audio = new Audio(lalala);

 my_face.addEventListener("click", function () {
     // if arrow is visible, disable it
     if (my_face.src.split("/")[my_face.src.split("/").length - 1] == "my_face_open.jpg") {
         my_face.src = myFaceClosed;
         audio.pause();
         arrow.style.visibility = "visible";

     } else {
         my_face.src = myFaceOpen;
         audio.play();
         arrow.style.visibility = "hidden";
     }


 });

 audio.onended = function () {
     my_face.src = myFaceClosed;
     arrow.style.visibility = "visible";
 };
