import * as THREE from 'three';

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function getSignedAngle(v1, v2) {
    const angle = v1.angleTo(v2);
    const sign = v1.cross(v2).z > 0 ? 1 : -1;
    return angle * sign;
}

export function drawDebugArrow(scene, from, to, color, name) {
    
    const o = scene.children.find((child) => child.userData.debugName === name);
    if (o) {
        //destroy old arrow
        scene.remove(o); 
    }
    console.log("drawing arrow",name, from, to, to.clone().sub(from));
    const origin = from;
    const dir = to.clone().sub(from);
    const arrow = new THREE.ArrowHelper(dir, origin, dir.length(), color, 0.01, 0.1);
    scene.add(arrow);
    arrow.userData.debugName = name;
}

export function drawDebugPoint(scene, position, color, name) {
    const o = scene.children.find((child) => child.userData.debugName === name);
    if (o) {
        //destroy old point
        scene.remove(o); 
    }
    const geometry = new THREE.SphereGeometry(0.02, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(position);
    scene.add(sphere);
    sphere.userData.debugName = name;
}