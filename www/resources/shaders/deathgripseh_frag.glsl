
varying vec2 vUv;
varying vec3 vColor;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uNumGridLines;
uniform float uLightness;
uniform float uLineThickness;

// color management
uniform float uHue;
uniform float uSaturation;
uniform float uContrast;
uniform float uBrightness;
uniform float uGamma;
uniform float uExposure;
uniform float uTemperature;


// All components are in the range [0…1], including hue.
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 applyColorManagement(vec3 color) {
    vec3 hsv = rgb2hsv(color);
    hsv.x += uHue;
    hsv.y *= uSaturation;
    hsv.z = pow(hsv.z, uGamma);
    hsv.z *= uContrast;
    hsv.z += uBrightness;
    hsv.z = pow(hsv.z, 1.0 / uGamma);
    hsv.z = pow(hsv.z, 1.0 / uExposure);
    // hsv.z = pow(hsv.z, 1.0 / uTemperature);
    return hsv2rgb(hsv);
}



void main() {
    // vec2 pos = gl_FragCoord.xy / uResolution
    
    vec4 color = texture2D(uTexture, vUv);
    // make lighter
    color = color * uLightness;

    float lt =  uLineThickness;
    if(mod(vUv.y, 1.0/uNumGridLines) < lt / uNumGridLines/2.0) {
        
        color = vec4(0.0, 0.0, 0.0, 0.0);
    }





    gl_FragColor = vec4(color);

    
    
}