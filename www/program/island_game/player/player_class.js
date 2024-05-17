import * as THREE from "three";
import {g} from "../globals.js";

/**
 * Player class (overrides Capsule just so that Octree can work)
 */
export class Player extends THREE.Group {
  constructor() {
    super();
    this.name = "player";
    // create a group to hold player's meshes
    g.SCENE.add(this);

    // // the player is holding a stick; draw this stick in the player's hand (right side of the screen)
    this.stick = new THREE.Mesh(
      new THREE.BoxGeometry(0.1 / 2, 0.1 / 2, 2),
      new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    );
    this.stick.position.z = -0.5;
    this.stick.position.x = 0.5;
    this.stick.position.y = 0.7;
    this.stick.rotation.x = Math.PI / 2.5;
    // this.stick.rotation.y = Math.PI / 6;
    this.stick.defaultRotation = this.stick.rotation.clone();
    this.add(this.stick);

    // player body
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(
        g.PLAYER.COLLIDER_RADIUS,
        g.PLAYER.COLLIDER_HEIGHT,
        4,
        8
      ),
      new THREE.MeshStandardMaterial({ color: 0xe5ff00 })
    );
    // body.position.y = 0.5;
    this.add(body);

    this.velocity = new THREE.Vector3();
    this.bobTimer = 0;
    this.bobActive = false;

    // setup physics
    let colliderDesc = g.PHYSICS.RAPIER.ColliderDesc.capsule(
      g.PLAYER.COLLIDER_HEIGHT / 2,
      g.PLAYER.COLLIDER_RADIUS
    );

    // Or create the collider and attach it to a rigid-body.
    this.rigidBody = g.PHYSICS.WORLD.createRigidBody(
      g.PHYSICS.RAPIER.RigidBodyDesc.kinematicPositionBased()
        .lockRotations() // prevent rotations along all axes.
        // .setCcdEnabled(true)
        // .setLinearDamping(0.5)
        // // The rigid body rotation, given as a quaternion.
        // // Default: no rotation.
        // .setRotation({ w: 1.0, x: 0.0, y: 0.0, z: 0.0})
        // // The linear velocity of this body.
        // // Default: zero velocity.
        // .setLinvel(1.0, 3.0, 4.0)
        // // The angular velocity of this body.
        // // Default: zero velocity.
        // .setAngvel({ x: 3.0, y: 0.0, z: 1.0 })
        // // The scaling factor applied to the gravity affecting the rigid-body.
        // // Default: 1.0
        // .setGravityScale(0.5)
        // // Whether or not this body can sleep.
        // // Default: true
        // .setCanSleep(true)
        // // Whether or not CCD is enabled for this rigid-body.
        // // Default: false
        .setTranslation(...g.PLAYER.START_POSITION)
    );
    this.collider = g.PHYSICS.WORLD.createCollider(
      colliderDesc,
      this.rigidBody
    );
  }

  ////// METHODS //////

  get forwardVelocity() {
    return this.velocity.clone().projectOnVector(this.forward);
  }

  hit() {
    this.stick.rotation.x = Math.PI / 8;
    setTimeout(() => {
      this.stick.rotation.copy(this.stick.defaultRotation);
    }, 100);
  }

  rotate(y) {
    this.rotation.y += y;
  }

  get forward() {
    // get forward vector from rotation
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyEuler(this.rotation);
    forward.y = 0;
    forward.normalize();
    return forward;
  }

  get right() {
    // TODO: check if this is correct
    return this.up.clone().cross(this.forward);
  }

  translate(x, y, z) {
    const nextPos = g.PLAYER.OBJECT.rigidBody.translation();
    nextPos.x += x;
    nextPos.y += y;
    nextPos.z += z;
    // console.log("nextPos", nextPos);
    g.PLAYER.OBJECT.rigidBody.setNextKinematicTranslation(
      new g.PHYSICS.RAPIER.Vector3(nextPos.x, nextPos.y, nextPos.z)
    );
    g.PLAYER.OBJECT.position.copy(g.PLAYER.OBJECT.rigidBody.translation());
  }

  get camPosition() {
    const pos = this.collider.translation();
    pos.y += g.PLAYER.COLLIDER_HEIGHT / 2;
    return pos;
  }
}
