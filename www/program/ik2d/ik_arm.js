import * as THREE from 'three';
import * as utils from './utils.js';
import {g} from './globals.js';

class Joint {

    /**
     * 
     * @param {float} length 
     * @param {Joint} parent 
     * @param {[Joint]} children 
     * @param {THREE.Matrix4} matrix 
     * @param {THREE.Mesh} mesh
     * @param {THREE.Matrix4} worldMatrix
     */
    constructor(index, length, parent, children, matrix) {

        const geometry = new THREE.BoxGeometry(0.02, length, 0.1);
        // translate geometry so that the pivot point is at the bottom
        geometry.translate(0, length / 2, 0);   
        const material = new THREE.MeshBasicMaterial({ color: 0xffdddd });
        
        this.index = index;
        this.length = length;
        this.parent = parent;
        this.children = children;
        this.matrix = matrix;
        this.mesh = new THREE.Mesh(geometry, material);
        this.worldMatrix = new THREE.Matrix4();

        // draw speheres
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0xffdddd })
        );
        this.mesh.add(sphere);
        
        // draw joint axes
        const axes = new THREE.AxesHelper(0.1);
        axes.material.depthTest = false;
        this.mesh.add(axes);

        // //draw joint index as text
        // const text = new TextGeometry(index.toString(), {
        //     font: g.FONT,
        //     size: 0.03,
        //     height: 0.01
        // });
        // const textMesh = new THREE.Mesh(text, new THREE.MeshBasicMaterial({ color: 0x000000 }));
        // textMesh.position.set(0.01, 0.01, 0);
        // textMesh.material.depthTest = false;
        // this.mesh.add(textMesh);


    }

    getWorldPosition(){
        const vec = new THREE.Vector3();
        vec.setFromMatrixPosition( this.worldMatrix );
        return vec;
    }    

    getPosition(){
        const vec = new THREE.Vector3();
        vec.setFromMatrixPosition( this.matrix );
        return vec;
    }

    getRotation(){
        const rot = new THREE.Quaternion();
        rot.setFromRotationMatrix(this.matrix);
        return rot;
    }

    getWorldRotation(){
        const rot = new THREE.Quaternion();
        rot.setFromRotationMatrix(this.worldMatrix);
        return rot;
    }

    getEndPosition(){
        if (this.children.length == 0) {
            throw new Error('Joint has no children. You cant get its end position!');
        }
        return this.children[0].getPosition(); //we don't expect multiple children yet
    }

    getEndWorldPosition(){
        if (this.children.length == 0) {
            throw new Error('Joint has no children. You cant get its end position!');
        }
        return this.children[0].getWorldPosition(); //we don't expect multiple children yet
    }

    //// this is probably useless. commenting out to avoid confusion
    // getDirection(){
    // if (this.children.length == 0) {
    //     throw new Error('Joint has no children. You cant get its direction!');
    // }
    //     return this.getEndPosition().clone().sub(this.getPosition()).normalize();
    // }

    getWorldDirection(){
        if (this.children.length == 0) {
            throw new Error('Joint has no children. You cant get its direction!');
        }
        return this.getEndWorldPosition().clone().sub(this.getWorldPosition()).normalize();
    }


    __updateWorldMatrix(recursive = true){
        if (this.parent) {
            this.worldMatrix.multiplyMatrices(this.parent.worldMatrix, this.matrix);
        } else {
            this.worldMatrix.copy(this.matrix);
        }
        //// update mesh
        this.mesh.position.setFromMatrixPosition(this.worldMatrix);
        this.mesh.quaternion.setFromRotationMatrix(this.worldMatrix);
        //// update world matrices recursively for all children
        if (recursive) {
            this.children.forEach(child => {
                child.__updateWorldMatrix(true);
            });
        }
    }

    // __updateMatrix(recursive = true){
    //     if (this.parent) {
    //         this.matrix.multiplyMatrices(this.parent.matrix, this.matrix);
    //     }
    // }

    setMatrix(matrix){
        this.matrix = matrix;
        //// update world matrices recursively for all children
        this.__updateWorldMatrix(true);        
    }


    // setWorldMatrix(worldMatrix){
    //     //// store transformation from old world matrix to new world matrix
    //     const trs = new THREE.Matrix4().multiplyMatrices(worldMatrix, this.worldMatrix.clone().invert());
    //     // this.worldMatrix = worldMatrix;
    //     this.matrix.multiply(trs);

    //     //// update matrix  recursively for all children
    //     // this.__updateMatrix(true);
    //     //// update this matrix
    //     // this.matrix.multiplyMatrices(this.parent.worldMatrix.clone().invert(), this.worldMatrix);

    //     //// update world matrices recursively for all children
    //     this.__updateWorldMatrix(true);     
    // }

    addRotation(angle){
        const rot = new THREE.Matrix4();
        rot.makeRotationZ(angle);
        this.matrix.multiply(rot);
        //// update world matrices recursively for all children
        this.__updateWorldMatrix(true);
    }

    setRotation(angle){
        const rot = new THREE.Quaternion();
        rot.setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
        const newMatrix = new THREE.Matrix4().compose(this.getPosition(), rot, new THREE.Vector3(1, 1, 1));
        this.setMatrix(newMatrix);
    }

    rotateTowards(vec){
        const angle = utils.getSignedAngle(this.getWorldDirection(), vec);
        this.addRotation(angle);
    }

    addPosition(vec){
        const trs = new THREE.Matrix4();
        trs.makeTranslation(vec.x, vec.y, vec.z);
        const newMatrix = trs.clone().multiply(this.matrix);
        this.setMatrix(newMatrix);
    }

    moveTo(vec){
        const diff = vec.clone().sub(this.getWorldPosition());
        this.addPosition(diff);
    }


    // addWorldPosition(vec){
    //     const trs = new THREE.Matrix4();
    //     trs.makeTranslation(vec.x, vec.y, vec.z);
    //     const newWorldMatrix = trs.clone().multiply(this.worldMatrix);
    //     this.setWorldMatrix(newWorldMatrix);
    // }

    // setWorldPosition(vec){
    //     const newWorldMatrix = new THREE.Matrix4().compose(vec, this.getWorldRotation(), new THREE.Vector3(1, 1, 1));
    //     this.setWorldMatrix(newWorldMatrix);
    // }
}


export class IKArm extends THREE.Group {
    /**
     * 
     * @param {float} limbLengths 
     * @param {THREE.Vector3} startingPos
     */
    constructor(limbLengths, startingPos = new THREE.Vector3(0, 0, 0), fixedRoot = true) {
        if (limbLengths.length < 1) {
            throw new Error('IKArm must have at least 2 joints');
        }
        super();
        this.joints = [];
        this.fixedRoot = fixedRoot;
        this.armLength = limbLengths.reduce((acc, len) => acc + len, 0);
        // add 0 length joint as end effector
        limbLengths.push(0);
        let offset = startingPos;
        for (let i = 0; i < limbLengths.length; i++) {
            const matrix = new THREE.Matrix4();
            matrix.makeTranslation(offset.x, offset.y, offset.z);
            const parent = i == 0 ? null : this.joints[i - 1];
            const children = i == limbLengths.length - 1 ? [] : [i + 1];
            const joint = new Joint(i, limbLengths[i],parent, children, matrix);
            this.joints.push(joint);
            this.add(joint.mesh);
            offset = new THREE.Vector3(0, limbLengths[i], 0);
        }

        //// convert indices to joint objects
        this.joints.forEach(joint => {
            joint.children = joint.children.map(child => this.joints[child]);
            // joint.parent = joint.parent ? this.joints[joint.parent] : null;
        });

        //// update world matrices recursively starting from the base joint
        this.joints[0].__updateWorldMatrix(true);

        this.endeffector = this.joints[this.joints.length - 1];

        
    }

    /**
     * stretches the arm towards a direction
     * @param {THREE.Vector3} worldTarget 
     */
    stretchTowards(worldTarget){

        const toWorldTarget = worldTarget.clone().sub(this.joints[0].getWorldPosition());

        for (let i = this.joints.length-2; i >=0 ; i--) {
            const joint = this.joints[i];
            joint.rotateTowards(toWorldTarget);

            //// translate joint by toWorldTarget-toWorldTarget.normalized().multiplyScalar(joint.length)
            // joint.addWorldPosition(toWorldTarget.clone());
        }

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @param {THREE.Vector3} targetPos 
     */
    reachAnalytic(targetPos) {
        if (this.joints.length > 3) { //3rd joint is end effector joint so it should not be counted
            throw new Error('analytic IK only works for 2-joint arm');
        }
        if (this.joints.length == 2) { //if only 1 joint then just stretch towards the target
            this.stretchTowards(targetPos.clone().sub(this.joints[0].getWorldPosition()));
            return;
        }

        const joint0 = this.joints[0];
        const limb0Length = joint0.length;
        const joint1 = this.joints[1];
        const limb1Length = joint1.length;

        const targetDistance = targetPos.distanceTo(joint0.getWorldPosition());
        
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
        joint0.setRotation(targetAngle - angle0);

        ////  cosine law for joint1
        let angle1 = (limb1Length ** 2 + limb0Length ** 2 - targetDistance ** 2) / (2 * limb1Length * limb0Length);
        angle1 = utils.clamp(angle1, -1, 1);
        angle1 = Math.acos(angle1);
        joint1.setRotation(Math.PI - angle1);
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @param {THREE.Vector3} targetPos 
     */
    reachFABRIK(targetPos) {

        //////////////////////////////////////////////////
        //////// BUG: produces jerk ///////////////////////
        //////////////////////////////////////////////////
        //// don't reach if target is farther that the arm's length
        // const rootPos = this.joints[0].getWorldPosition();
        // const targetDistance = targetPos.distanceTo(rootPos);
        // if (targetDistance > this.armLength) {
        //     this.stretchTowards(targetPos.clone().sub(rootPos));
        //     return;
        // }
        
        const positions = this.joints.map(joint => joint.getWorldPosition());

        const eps = 0.001;
        let iters = 100;
        const targetReached = (pos) => pos[pos.length - 1].distanceTo(targetPos) > eps;

        while (targetReached(positions) && iters > 0) {
            // Forward.
            positions[positions.length - 1] = targetPos.clone();
            for (let i = positions.length - 2; i >= 0; i--) {
                positions[i] = positions[i].clone().sub(positions[i+1]).normalize().multiplyScalar(this.joints[i].length).add(positions[i+1]);            
            }

            if (!this.fixedRoot) {
                console.log('root');
                break;
            }

            // // Backward.
            positions[0] = this.joints[0].getWorldPosition();
            for (let i = 1; i < this.joints.length; i++) {
                positions[i] = positions[i].clone().sub(positions[i-1]).normalize().multiplyScalar(this.joints[i-1].length).add(positions[i-1]);
            }
            iters--;
        }

        // DEBUGGING
        // for (let i = 0; i < this.joints.length; i++) {
        //     utils.drawDebugPoint(g.SCENE, positions[i], 0xff0000, "pos"+i);
        // }


        // apply new positions to joints
        for (let i = 0; i < this.joints.length-1; i++) {
            if (i === 0 && !this.fixedRoot) {
                this.joints[i].moveTo(positions[i]);
            }
            this.joints[i].rotateTowards(positions[i+1].clone().sub(this.joints[i].getWorldPosition()));
        
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @param {THREE.Vector3} targetPos 
     */
    reachCCD(targetPos) {
        //// starting from the base joint rotate each joint towards the target
        for (let i = this.joints.length-2; i >= 0; i--) {
            const joint = this.joints[i];            
            const jointPos = joint.getWorldPosition();
            const endeffectorPos = this.joints[this.joints.length - 1].getWorldPosition();

            //// calculate angle between childPos-jointPos and targetPos-jointPos
            const angle = utils.getSignedAngle(endeffectorPos.clone().sub(jointPos), targetPos.clone().sub(jointPos));
            joint.addRotation(angle);
        }
    }

}