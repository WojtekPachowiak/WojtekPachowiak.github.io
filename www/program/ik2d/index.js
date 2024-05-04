import * as THREE from 'three';
import * as utils from './utils.js';
const g = {};


export function initThree() {

g.DPI = 1;
  const canvas = document.getElementById("canvas3d");
  g.RENDERER = new THREE.WebGLRenderer({ antialias: true, canvas: canvas});
  g.RENDERER.setSize(window.innerWidth, window.innerHeight);
  g.RENDERER.setPixelRatio(g.DPI);

  // colorspace
  g.RENDERER.outputColorSpace = THREE.LinearSRGBColorSpace;

  // scene
  const scene = new THREE.Scene();
  g.SCENE = scene;
  g.SCENE.background = new THREE.Color(0xfffced);

  // g.CAMERA
  g.CAMERA = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
  g.CAMERA.position.set(0, 0, 1);
  scene.add(g.CAMERA);
  
  // mouse pointer (yellow circle)
    g.MOUSE_POS = new THREE.Vector2();
    const mousePointer = new THREE.Mesh(
        new THREE.CircleGeometry(0.05, 32),
        new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    scene.add(mousePointer);
    g.MOUSE_POINTER = mousePointer;


    g.DELTA_TIME = 0;
    g.LAST_TIME = 0;

    //grid
    const gridSize = 5;
    const grid = new THREE.GridHelper(1*gridSize, 10*gridSize, 0xffffff, 0xffffff);
    grid.material.opacity = 0.5;
    grid.material.transparent = true;
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);

    
}

class Joint extends THREE.Mesh {
    constructor(length, endeffector = false) {
        // if (endeffector){
        //     const geometry = new THREE.SphereGeometry(0.02, 32, 32);
        //     const material = new THREE.MeshBasicMaterial({ color: 0xff000d });
        //     super(geometry, material);
        // }else{
            const geometry = new THREE.BoxGeometry(0.02, length, 0.1);
            // translate geometry so that the pivot point is at the bottom
            geometry.translate(0, length / 2, 0);
            const material = new THREE.MeshBasicMaterial({ color: 0xffdddd });
            super(geometry, material);
        // }
        this.length = length;

    }
}

class IKArm {
    constructor(limbLengths, startingPos = new THREE.Vector3(0, 0, 0)) {
        if (limbLengths.length < 2) {
            throw new Error('IKArm must have at least 2 joints');
        }

        this.group = new THREE.Group();
        this.group.position.copy(startingPos);
        this.joints = [];
        // add 0 length joint as end effector
        limbLengths.push(0);
        let offset = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < limbLengths.length; i++) {
            const joint = new Joint(limbLengths[i]);
            joint.position.copy(offset);
            this.group.add(joint);
            this.joints.push(joint);

            // parent
            if (i > 0) {
                joint.parent = this.joints[i - 1];
            }

            // draw speheres
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.02, 32, 32),
                new THREE.MeshBasicMaterial({ color: 0xffdddd })
            );
            joint.add(sphere);
            
            // draw joint axes
            const axes = new THREE.AxesHelper(0.1);
            axes.material.depthTest = false;
            joint.add(axes);
            
            offset = new THREE.Vector3(0, limbLengths[i], 0);
        }
        // // add endeffector
        // const endEffector = new Joint(0, true);
        // endEffector.position.copy(jointPos);
        // endEffector.parent = this.joints[this.joints.length - 1];
        // this.group.add(endEffector);
        // this.joints.push(endEffector);

    }

    /**
     * stretches the arm towards a direction
     * @param {THREE.Vector3} direction 
     */
    stretchTowards(direction){
        for (let i = 0; i < this.joints.length - 2; i++) {
            const joint = this.joints[i];
            const jointChild = this.joints[i + 1];
            const jointPos = joint.getWorldPosition(new THREE.Vector3());
            const jointChildPos = jointChild.getWorldPosition(new THREE.Vector3());
            const angle = utils.getSignedAngle(jointChildPos.clone().sub(jointPos), direction);
            joint.rotation.z += angle;
        }

    }

    /**
     * 
     * @param {THREE.Vector3} targetPos 
     * @param {boolean} rootFixed 
     * @returns 
     */
    reachAnalytic(targetPos, rootFixed = true) {
        if (this.joints.length > 3) { //3rd joint is end effector joint so it should not be counted
            throw new Error('analytic IK only works for 2-joint arm');
        }
        const joint0 = this.joints[0];
        const joint1 = this.joints[1];
        const limb0Length = joint0.length;
        const limb1Length = joint1.length;
        
        const targetDistance = targetPos.distanceTo(joint0.position);
        
        //// if not rootFixed and  target is out of reach, move the end effector to the target
        if (!rootFixed && targetDistance > limb0Length + limb1Length) {
            const forward = targetPos.clone().sub(joint0.position.clone());
            joint0.position.add(forward.normalize().multiplyScalar(g.DELTA_TIME ));
        }

        //// convert target position from global space to local (with respect to root) space
        targetPos = targetPos.clone().sub(joint0.position);
        
        // don't reach if target is too close to the base (prevent division by zero error)
        if (targetDistance < 0.01) {
            return;
        }
        
        // (0,1,0) because the arm's rest pose (initial pose) is pointing upwards
        const targetAngle = utils.getSignedAngle(new THREE.Vector3(0, 1, 0), targetPos);

        ////  cosine law for joint0
        let angle0 = (limb0Length ** 2 + targetDistance ** 2 - limb1Length ** 2) / (2 * limb0Length * targetDistance);
        angle0 = utils.clamp(angle0, -1, 1);
        angle0 = Math.acos(angle0); 
        joint0.rotation.z = targetAngle - angle0;

        ////  cosine law for joint1
        let angle1 = (limb1Length ** 2 + limb0Length ** 2 - targetDistance ** 2) / (2 * limb1Length * limb0Length);
        angle1 = utils.clamp(angle1, -1, 1);
        angle1 = Math.acos(angle1);
        joint1.rotation.z = Math.PI - angle1;
    }

    reachFABRIK(target) {
        const armLength = this.joints.reduce((acc, joint) => acc + joint.length, 0);
        const rootPos = this.joints[0].getWorldPosition(new THREE.Vector3());
        const targetDistance = target.distanceTo(rootPos);
        if (targetDistance > armLength) {
            this.stretchTowards(target.clone().sub(rootPos));
        }
        
        //// forward reaching
        let goalPos = target.clone();
        for (let i = this.joints.length - 2; i >= 0; i--) {
            const joint = this.joints[i];
            const jointPos = joint.getWorldPosition(new THREE.Vector3());
            const jointChild = this.joints[i + 1];
            const jointChildPos = jointChild.getWorldPosition(new THREE.Vector3());

            // rotate jointChildPos-jointPos towards goalPos-jointPos
            const angle = utils.getSignedAngle(jointChildPos.clone().sub(jointPos), goalPos.clone().sub(jointPos));
            joint.rotation.z += angle;
            
            

        }

        
    }

    reachCCD(targetPos) {
        //// starting from the base joint rotate each joint towards the target
        for (let i = this.joints.length-2; i >= 0; i--) {
            const joint = this.joints[i];            
            const jointPos = joint.getWorldPosition(new THREE.Vector3());
            const endeffectorPos = this.joints[this.joints.length - 1].getWorldPosition(new THREE.Vector3());

            //// calculate angle between childPos-jointPos and targetPos-jointPos
            const angle = utils.getSignedAngle(endeffectorPos.clone().sub(jointPos), targetPos.clone().sub(jointPos));
            joint.rotation.z += angle;
        }
        // //// rotate leaf joint towards target
        // const leafJoint = this.joints[this.joints.length - 1];
        // const leafPos = leafJoint.getWorldPosition(new THREE.Vector3());
        // const angle = utils.getSignedAngle(leafPos.clone().sub(jointPos), targetPos.clone().sub(jointPos));
        // leafJoint.rotation.z += angle;
    }

}


function animate(now) {
    //// calculate delta time
    now = now || 0;
    g.DELTA_TIME = (now - (g.LAST_TIME || now))/1000;
    g.LAST_TIME = now;

    //// update mouse pointer position
    g.MOUSE_POINTER.position.set(g.MOUSE_POS.x, g.MOUSE_POS.y, 0);
    
    //// update arm
    // g.ARM.reachAnalytic(new THREE.Vector3(g.MOUSE_POS.x, g.MOUSE_POS.y, 0), false);
    g.ARM.reachCCD(new THREE.Vector3(g.MOUSE_POS.x, g.MOUSE_POS.y, 0));

    g.RENDERER.render(g.SCENE, g.CAMERA);
    requestAnimationFrame(animate);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

initThree();
const arm = new IKArm([0.3, 0.2,0.2,0.2,0.1]);
g.ARM = arm;
g.SCENE.add(arm.group);
animate();


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//// on resize screen
function onResize() {
    g.RENDERER.setSize(window.innerWidth, window.innerHeight);
    g.ASPECT_RATIO = window.innerWidth / window.innerHeight;
    // set orthographic camera aspect ratio
    g.CAMERA.left = -g.ASPECT_RATIO;
    g.CAMERA.right = g.ASPECT_RATIO;
    g.CAMERA.top = 1;
    g.CAMERA.bottom = -1;

    g.CAMERA.updateProjectionMatrix();
}
onResize();
window.addEventListener('resize', onResize);

//// get mouse position in normalized device coordinates
function getNDCCoords(event) {
    let x = (event.clientX / window.innerWidth) * 2 - 1;
    x *= g.ASPECT_RATIO;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    g.MOUSE_POS.set(x, y);
}
document.addEventListener('mousemove', getNDCCoords);
