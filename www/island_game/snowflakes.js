import * as THREE from "three";
import { g } from "./globals.js";

export function snowflakesInit() {
  const snowflakeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uSize: { value: g.SNOWFLAKES.SIZE },
      uOpacity: { value: g.SNOWFLAKES.OPACITY },
    },
    vertexShader: `
                    attribute float lifetime;
                    varying float alpha;
                    uniform float uSize;

                    void main() {
                        alpha = lifetime;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = uSize / gl_Position.w;
                    }
                `,
    fragmentShader: `
                    varying float alpha;
                    uniform float uOpacity;
                    void main() {
                        vec2 xy = gl_PointCoord.xy - vec2(0.4);
                        // pixelate
                        // float pixelSize = 3.0 *2.0;
                        // xy = floor(xy * pixelSize) / pixelSize ;
                        
                        float ll = length(xy);
                        vec3 color = vec3(0.9);
                        float smoothness = 0.5;
                        
                        gl_FragColor = vec4(color, smoothstep(smoothness,0.,ll)*alpha*uOpacity );
                    }
                `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
  });

  // create snowflakes geometries
  for (let i = 0; i < g.SNOWFLAKES.NUM; i++) {
    const position = snowflakesGetPositions();
    g.SNOWFLAKES.PARTICLES_POSITIONS.push(...position);
    const velocity = snowflakesGetVelocities();
    g.SNOWFLAKES.PARTICLES_VELOCITIES.push(...velocity);

    g.SNOWFLAKES.PARTICLES_COLLISION_SPHERES.push(
      new THREE.Sphere(new THREE.Vector3(), 0.1)
    );
  }

g.SNOWFLAKES.GEOMETRY = new THREE.BufferGeometry();
  g.SNOWFLAKES.GEOMETRY.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(g.SNOWFLAKES.PARTICLES_POSITIONS, 3)
  );
  g.SNOWFLAKES.GEOMETRY.setAttribute(
    "velocity",
    new THREE.Float32BufferAttribute(g.SNOWFLAKES.PARTICLES_VELOCITIES, 3)
  );
  g.SNOWFLAKES.GEOMETRY.setAttribute(
    "lifetime",
    new THREE.Float32BufferAttribute(new Array(g.SNOWFLAKES.NUM).fill(1), 1)
  );

  const snowflakesPoints = new THREE.Points(g.SNOWFLAKES.GEOMETRY, snowflakeMaterial);
  snowflakesPoints.frustumCulled = false;
  g.SCENE.add(snowflakesPoints);
}

function snowflakesGetPositions() {
  // offset by players velocity
  const playerVelocityOffset = 0;
  const concentrationAroundPlayer = 0.5;
  const spread = 2;
  return [
    (Math.random() - 0.5) *
      spread *
      g.SNOWFLAKES.SPAWN_RADIUS *
      concentrationAroundPlayer +
      g.CAMERA.position.x +
      g.PLAYER.VELOCITY.x * playerVelocityOffset,
    (Math.random() * 0.2 + 0.9) * g.SNOWFLAKES.SPAWN_HEIGHT + g.CAMERA.position.y,
    (Math.random() - 0.5) *
      spread *
      g.SNOWFLAKES.SPAWN_RADIUS *
      concentrationAroundPlayer +
      g.CAMERA.position.z +
      g.PLAYER.VELOCITY.z * playerVelocityOffset,
  ];
}

function snowflakesGetVelocities() {
  return [
    ((Math.random() - 0.5) / 4) * g.SNOWFLAKES.SPAWN_VELOCITY_MAX_SPEED,
    -(Math.random() * 0.5 + 0.5) * g.SNOWFLAKES.SPAWN_VELOCITY_MAX_SPEED,
    ((Math.random() - 0.5) / 4) * g.SNOWFLAKES.SPAWN_VELOCITY_MAX_SPEED,
  ];
}

export function snowflakesUpdate(deltaTime) {
  for (let i = 0; i < g.SNOWFLAKES.NUM; i++) {
    // update positions
    g.SNOWFLAKES.GEOMETRY.attributes.position.array[i * 3] +=
      g.SNOWFLAKES.GEOMETRY.attributes.velocity.array[i * 3] * deltaTime;
    g.SNOWFLAKES.GEOMETRY.attributes.position.array[i * 3 + 1] +=
      g.SNOWFLAKES.GEOMETRY.attributes.velocity.array[i * 3 + 1] * deltaTime;
    g.SNOWFLAKES.GEOMETRY.attributes.position.array[i * 3 + 2] +=
      g.SNOWFLAKES.GEOMETRY.attributes.velocity.array[i * 3 + 2] * deltaTime;

    // update colliders positions
    g.SNOWFLAKES.PARTICLES_COLLISION_SPHERES[i].center.copy(
      new THREE.Vector3(
        g.SNOWFLAKES.GEOMETRY.attributes.position.array[i * 3],
        g.SNOWFLAKES.GEOMETRY.attributes.position.array[i * 3 + 1],
        g.SNOWFLAKES.GEOMETRY.attributes.position.array[i * 3 + 2]
      )
    );

    // if snowflake is below ground, stop it and let it die
    const result = g.OCTREE.sphereIntersect(
      g.SNOWFLAKES.PARTICLES_COLLISION_SPHERES[i]
    );
    if (result) {
      // zero out velocity if hit floor and set to die
      g.SNOWFLAKES.GEOMETRY.attributes.velocity.array[i * 3] = 0;
      g.SNOWFLAKES.GEOMETRY.attributes.velocity.array[i * 3 + 1] = 0;
      g.SNOWFLAKES.GEOMETRY.attributes.velocity.array[i * 3 + 2] = 0;
      g.SNOWFLAKES.GEOMETRY.attributes.lifetime.array[i] -=
        deltaTime / g.SNOWFLAKES.DYING_DURATION;
      if (g.SNOWFLAKES.GEOMETRY.attributes.lifetime.array[i] < 0) {
        g.SNOWFLAKES.GEOMETRY.attributes.lifetime.array[i] = 0;

        // reset position and velocity (offset position by players velocity)
        const position = snowflakesGetPositions();
        g.SNOWFLAKES.GEOMETRY.attributes.position.array[i * 3] = position[0];
        g.SNOWFLAKES.GEOMETRY.attributes.position.array[i * 3 + 1] = position[1];
        g.SNOWFLAKES.GEOMETRY.attributes.position.array[i * 3 + 2] = position[2];
        const velocity = snowflakesGetVelocities();
        g.SNOWFLAKES.GEOMETRY.attributes.velocity.array[i * 3] = velocity[0];
        g.SNOWFLAKES.GEOMETRY.attributes.velocity.array[i * 3 + 1] = velocity[1];
        g.SNOWFLAKES.GEOMETRY.attributes.velocity.array[i * 3 + 2] = velocity[2];
        g.SNOWFLAKES.GEOMETRY.attributes.lifetime.array[i] = 1;
      }
    }
  }

  g.SNOWFLAKES.GEOMETRY.attributes.position.needsUpdate = true;
  g.SNOWFLAKES.GEOMETRY.attributes.lifetime.needsUpdate = true;
  g.SNOWFLAKES.GEOMETRY.attributes.velocity.needsUpdate = true;
}
