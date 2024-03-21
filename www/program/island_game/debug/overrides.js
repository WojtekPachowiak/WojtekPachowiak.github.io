import * as THREE from "three";

export function initDebugOverrides() {
  THREE.Vector3.prototype.toString = function () {
    const x = typeof this.x === "number" ? this.x.toFixed(2) : this.x;
    const y = typeof this.y === "number" ? this.y.toFixed(2) : this.y;
    const z = typeof this.z === "number" ? this.z.toFixed(2) : this.z;
    return `(${x}, ${y}, ${z})`;
  };

  THREE.Vector2.prototype.toString = function () {
    const x = typeof this.x === "number" ? this.x.toFixed(2) : this.x;
    const y = typeof this.y === "number" ? this.y.toFixed(2) : this.y;
    return `(${x}, ${y})`;
  };

  THREE.Euler.prototype.toString = function () {
    if (this.x === undefined || this.y === undefined || this.z === undefined) {
      return "undefined";
    }
    return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
  };
}
