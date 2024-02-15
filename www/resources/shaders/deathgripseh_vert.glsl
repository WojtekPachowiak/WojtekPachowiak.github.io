varying vec2 vUv;
varying vec3 vColor;

uniform sampler2D uTexture;
uniform float uHeight;

// color management
uniform float uContrast;
uniform float uBrightness;
uniform float uGamma;
uniform float uExposure;


vec3 toGrayScale(vec3 color) {
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    return vec3(gray);
}

vec3 applyColorManagement(vec3 color) {
    color = pow(color, vec3(uGamma));
    color = (color - 0.5) * max(0.0, uContrast) + 0.5;
    color = color + uBrightness;
    color = color * pow(2.0, uExposure);
    return color;
}


vec3 applyFishEye(vec3 position, float strength) {
    float r = length(position);
    float theta = atan(position.y, position.x);
    float phi = atan(position.z, r);
    r = pow(r, strength);
    position.x = r * cos(theta) * sin(phi);
    position.y = r * sin(theta) * sin(phi);
    position.z = r * cos(phi);
    return position;
}


void main() {

    vUv = uv;
    vColor = color;

    vec3 newPosition = position;

    vec3 texColor = texture2D(uTexture, vUv).rgb;
    texColor = toGrayScale(texColor);
    texColor = applyColorManagement(texColor);
    
    // fish eye effect
    float fishEyeStrength = 1.0;
    // newPosition = applyFishEye(newPosition, fishEyeStrength);


    newPosition.z += length(texColor) * uHeight;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

}
