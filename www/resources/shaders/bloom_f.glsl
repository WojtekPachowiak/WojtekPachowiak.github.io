uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
uniform float invert;
varying vec2 vUv;

void main() {

    vec4 bloom = texture2D(bloomTexture, vUv);
    // vec3 out_col = mix(texture2D(baseTexture, vUv), bloom, bloom.a).rgb;
    vec3 out_col =  (texture2D(baseTexture, vUv) + bloom ).rgb;
    // vec3 out_col =  (bloom).rgb;
    
    gl_FragColor = vec4(mix(out_col, 1. - out_col, invert),1.);
}