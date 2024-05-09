# Lorem ipsum?

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus pellentesque porta nibh in molestie. Nullam fringilla purus sed hendrerit bibendum. Maecenas non nunc tristique nulla laoreet venenatis vel quis urna. Etiam eget velit non risus posuere aliquet in in velit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Ut id neque urna. Etiam tellus nisl, tincidunt eget leo nec, iaculis pharetra mi. Aenean ornare tempor rutrum. In tristique nibh vel venenatis auctor. Mauris eu purus ligula. Sed ac dolor non nulla semper rhoncus. In et lorem at nisl pretium tincidunt a quis enim. Ut ultrices dui ac justo suscipit iaculis. Proin rutrum ex vel nulla tempor feugiat. Nullam pretium odio purus, ac rhoncus tellus lacinia et.

Sed nunc orci, euismod ut dui eget, mattis iaculis orci. Nullam non tristique sapien. Maecenas aliquam massa eu odio placerat dapibus. Fusce ultricies mauris in turpis hendrerit, eget mollis risus viverra. Phasellus et sagittis leo. Donec hendrerit, dolor sit amet scelerisque feugiat, risus magna venenatis arcu, ut aliquam augue nunc vitae lectus. Duis vulputate euismod lorem, eu volutpat enim faucibus vel. Morbi cursus, augue nec tincidunt accumsan, velit nisl tincidunt mauris, quis rhoncus arcu augue nec lorem.

```python
#python scripts/png-to-jpg.py c:\Users\wojtek\Desktop\Programming\Web\WojtekPachowiak.github.io\image 

from PIL import Image
import sys
import os


images_path = r"www\resources\image"

#list all files in the directory
for f in os.listdir(images_path):
    if f.endswith('.png'):
        i = Image.open(os.path.join(images_path, f))
        i = i.convert('RGB')
        fn, fext = os.path.splitext(f)
        i.save(f'{images_path}/{fn}.jpg')
```


Donec sem orci, volutpat quis felis eget, rutrum eleifend nisl. Nulla rutrum, eros vel pharetra vulputate, nulla purus facilisis enim, eu hendrerit tellus dolor eget sem. Aliquam in ante eget sapien tempor consectetur. Quisque tempor porttitor ultricies. Fusce rhoncus ipsum mollis felis ultrices ullamcorper. Curabitur commodo erat eu commodo blandit. Ut tristique imperdiet tortor eu bibendum. Aenean molestie at libero non sodales. Vivamus et augue ornare, volutpat sem ac, luctus felis. Nulla sit amet mi quis felis feugiat accumsan vel non lorem. Nunc in blandit libero. Curabitur ac felis ut ligula varius congue in ut dui. Suspendisse eros tortor, maximus luctus ullamcorper a, tincidunt sollicitudin dui.

Praesent porta sed ipsum ut convallis. Curabitur tristique volutpat massa in consequat. Curabitur libero metus, luctus eget augue nec, rhoncus mollis leo. Integer ac ullamcorper risus, in aliquam arcu. Nunc at pulvinar lectus. Ut fringilla nec diam vitae sagittis. Praesent vel aliquet sapien. Suspendisse quis lacinia velit. Nunc tempus eu urna a sagittis. Nam in condimentum justo. Suspendisse sed arcu mollis urna maximus imperdiet et ac quam. Cras lorem ante, molestie in viverra non, auctor nec tortor. Nulla facilisi. Duis ultricies mi et scelerisque condimentum. Vivamus accumsan ut quam ut sodales.

```js
let dpi = 1;

let w = 1827; 
let h = 959;

if (WebGL.isWebGL2Available() === false) {
  document.body.appendChild(WebGL.getWebGL2ErrorMessage());
}


// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(
  window.innerWidth,
  window.innerHeight,
  dpi
);
renderer.setPixelRatio(dpi);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.width = "100%";
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "-1";


// scene
const scene = new THREE.Scene();

// shader background
const plane_geometry = new THREE.PlaneGeometry(10, 10);
const plane_material = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 1 },
    resolution: {
      value: new THREE.Vector2(
        w * dpi,
        h * dpi
      ),
    },
    zoom: { value: 1 },
  },
  fragmentShader: backgroundShader,
});
plane_material.depthWrite = false;

const plane_mesh = new THREE.Mesh(plane_geometry, plane_material);
scene.add(plane_mesh);



// camera
const aspect = window.innerWidth / window.innerHeight
const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.001, 1000);

camera.position.set(0, 0, 10);
scene.add(camera);


// MAIN LOOP
function animate() {
  requestAnimationFrame(animate);

  plane_material.uniforms.time.value = performance.now() / 1000 +0;
  plane_material.uniforms.resolution.value.set(
    w * dpi,
    h * dpi
  );

  renderer.clear();
  renderer.render(scene, camera);
}
animate();




// onresize
function updateViewport() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(
    window.innerWidth,
    window.innerHeight,
    dpi
  );
  renderer.setPixelRatio(dpi);

}
window.onresize = updateViewport;
```

In auctor nibh lorem, vulputate laoreet eros consectetur pharetra. Nam vehicula lorem id felis maximus placerat. Curabitur ex arcu, commodo ac ornare et, venenatis vel dolor. Integer urna arcu, tincidunt nec fermentum nec, varius in mauris. Vestibulum mattis mauris sit amet odio hendrerit ultrices. Suspendisse faucibus maximus accumsan. Praesent molestie, neque ac mollis molestie, diam arcu venenatis leo, vel eleifend felis mauris a risus. Duis accumsan lectus dapibus risus suscipit varius.