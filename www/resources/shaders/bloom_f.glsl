uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
uniform float invert;
varying vec2 vUv;
// uniform vec2 resolution;

void main() {
    // vec2 res = vec2(1920., resolution.y);

    // vec2 uvscale =  gl_FragCoord.xy / res.xy;

    vec4 bloom = texture2D(bloomTexture, vUv);
    // get bloom uv
    
    
    // make the bloom resolution dependent
    

    // vec3 out_col = mix(texture2D(baseTexture, vUv), bloom, bloom.a).rgb;
    vec3 out_col =  (texture2D(baseTexture, vUv) + bloom ).rgb;
    // vec3 out_col =  (bloom).rgb;

    // gl_FragColor = vec4(uvscale.xy,0., 1.);
    
    gl_FragColor = vec4(mix(out_col, 1. - out_col, invert),1.);
}