export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function getSignedAngle(v1, v2) {
    const angle = v1.angleTo(v2);
    const sign = v1.cross(v2).z > 0 ? 1 : -1;
    return angle * sign;
}