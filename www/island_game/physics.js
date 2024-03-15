import {g} from './globals.js';

export function initStaticColliders(){
    for (let obj of g.OBJECT_GROUPS.COLLIDABLES) {
    const geometry = obj.geometry;
    let colliderDesc = g.PHYSICS.RAPIER.ColliderDesc.trimesh(
    geometry.attributes.position.array,
    geometry.index.array
    );
    g.PHYSICS.WORLD.createCollider(colliderDesc);
    const rigidBody = g.PHYSICS.WORLD.createRigidBody(
    g.PHYSICS.RAPIER.RigidBodyDesc.fixed()
    );
    g.PHYSICS.WORLD.createCollider(colliderDesc, rigidBody);

    // translate, scale and rotate the collider to match the object
    rigidBody.setTranslation(
    { x: obj.position.x, y: obj.position.y, z: obj.position.z },
    true
    );
    rigidBody.setRotation(
    {
        w: obj.quaternion.w,
        x: obj.quaternion.x,
        y: obj.quaternion.y,
        z: obj.quaternion.z,
    },
    true
    );

    // save reference
    obj.userData.rigidBody = rigidBody;
    }
    
}


export async function initPhysics() {
  return new Promise((resolve, reject) => {
    import("@dimforge/rapier3d")
      .then((RAPIER) => {
        const gravity = { x: 0.0, y: 10, z: 0.0 };
        g.PHYSICS.WORLD = new RAPIER.World(gravity);

        const characterController =
          g.PHYSICS.WORLD.createCharacterController(0.01);
        // // Change the character controller’s up vector to the positive Z axis.
        // characterController.setUp({ x: 0.0, y: 0.0, z: 1.0 });
        // // Don’t allow climbing slopes larger than 45 degrees.
        characterController.setMaxSlopeClimbAngle(g.PLAYER.MAX_ON_FLOOR_ANGLE);
        // // Automatically slide down on slopes smaller than 30 degrees.
        // // characterController.setMinSlopeSlideAngle((30 * Math.PI) / 180);
        // // Autostep if the step height is smaller than 0.5, its width is larger than 0.2,
        // // and allow stepping on dynamic bodies.
        characterController.enableAutostep(0.5, g.PLAYER.COLLIDER_RADIUS, true);
        // // Disable autostep.
        // characterController.disableAutostep();
        // // Snap to the ground if the vertical distance to the ground is smaller than 0.5.
        characterController.enableSnapToGround(0.5);
        // // Disable snap-to-ground.
        // // characterController.disableSnapToGround();
        g.PHYSICS.CHARACTER_CONTROLLER = characterController;

        RAPIER.Vector3.prototype.toString = function () {
          return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(
            2
          )})`;
        };

        RAPIER.Quaternion.prototype.toString = function () {
          return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(
            2
          )}, ${this.w.toFixed(2)})`;
        };

        g.PHYSICS.RAPIER = RAPIER;
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}