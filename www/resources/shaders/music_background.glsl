vec2 pos;
uniform float time;
uniform vec2 resolution;
uniform float zoom;

#define     PI 3.14159265358979323846

float rand(vec2 c) {
    return fract(sin(dot(c.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p, float freq) {
    float unit = resolution.x / freq;
    vec2 ij = floor(p / unit);
    vec2 xy = mod(p, unit) / unit;
	//xy = 3.*xy*xy-2.*xy*xy*xy;
    xy = .5 * (1. - cos(PI * xy));
    float a = rand((ij + vec2(0., 0.)));
    float b = rand((ij + vec2(1., 0.)));
    float c = rand((ij + vec2(0., 1.)));
    float d = rand((ij + vec2(1., 1.)));
    float x1 = mix(a, b, xy.x);
    float x2 = mix(c, d, xy.x);
    return mix(x1, x2, xy.y);
}

float pNoise(vec2 p, int res) {
    float persistance = .5;
    float n = 1.;
    float normK = 0.;
    float f = 4.;
    float amp = 1.;
    int iCount = 0;
    for(int i = 0; i < 50; i++) {
        n += amp * noise(p, f);
        f *= 2.;
        normK += amp;
        amp *= persistance;
        if(iCount == res)
            break;
        iCount++;
    }
    float nf = n / normK;
    return nf * nf * nf * nf;
}

float remap(float value, float inputMin, float inputMax, float outputMin, float outputMax) {
    return outputMin + ((outputMax - outputMin) / (inputMax - inputMin)) * (value - inputMin);
}

#define NUM_OCTAVES 5

float fbm(vec2 x, float freq) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100);
	// Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for(int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(vec2(x), freq);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main(void) {


    vec2 pos = gl_FragCoord.xy / vec2(resolution.x, resolution.y);
    pos = (pos.x-3.)*(pos-0.5)*2.;
    pos*= 0.3;
    // pos += vec2(1000.,10.);

    // zoom
    // pos = pos*2.;
    float swim_upwards_speed = 0.01;
    pos += vec2(sin(time/5.+pos.y*2.)*0.1,time*swim_upwards_speed);
    // pos = pos + vec2(pos_pixelated.y,0.);
    // pos += vec2(sin(time*0.01),0.);
    vec3 col = vec3(fbm((vec2(pos.x) ), 30000.+pos.y*15.));

    col = smoothstep(vec3(0.6549, 0.6706, 0.7922),vec3(0.0, 0.1451, 0.1137),col);

    gl_FragColor = vec4(col, 1.0);

}