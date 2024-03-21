vec2 pos;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

#define     PI 3.14159265358979323846

float rand(vec2 c) {
    return fract(sin(dot(c.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p, float freq) {
    float unit = 1920. / freq; // ARBITRARY
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


float fbm_pnoise(vec2 x, float freq, int num_octaves) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100);
	// Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for(int i = 0; i < num_octaves; ++i) {
        v += a * pNoise(vec2(x), int(freq));
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float fbm_noise(vec2 x, float freq, int num_octaves) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100);
	// Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for(int i = 0; i < num_octaves; ++i) {
        v += a * noise(vec2(x), freq);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

vec2 rotate(vec2 v, float a) {
    // deg to radians
    a = radians(a);
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, -s, s, c);
    return m * v;
}

float sin01(float x) {
    return sin(x) * 0.5 + 0.5;
}

vec2 mouse01() {
    // from -1,1 to 0,1
    return uMouse * 0.5 + 0.5;
}


vec3 pestki(float angle, vec2 pos, float distance, float time, vec3 col1, vec3 col2){
    vec3 col = vec3(0.0);
    col = vec3(angle);

    float petals_num = 10.0;
    col = mod(col * petals_num  + time, 1.0);

    float sharpen = 1.;
    float offset = 0.;
    float disappearing = 10.0;  
    col = smoothstep(0.0 + offset, sharpen + offset, col) * smoothstep(sharpen + offset, 0.0 + offset, col) *disappearing;

    // inner and outer petals shape
    float e = 0.8;
    float pestka_length = 1.;
    col = col * smoothstep(0.0, e, distance  );
    col = col * smoothstep(1.0, e, distance * pestka_length);

    // discretization
    float stepval = sin01(time) *0.2 + .2;
    float o = 0.01;
    col = smoothstep(stepval-o,stepval, col );

    // posterize
    // float num_levels = 3.;
    // num_levels = num_levels / 2.;
    // col = floor(col * num_levels) / num_levels;

    // assign two colors
    col = mix(col1, col2, col);


    return col;
}


void main(void) {


    vec2 res = uResolution;
    vec2 pos = gl_FragCoord.xy / res.xy;
    float aspect = res.x / res.y;
    // center
    // pos = pos * 2.0 - 2.0;
    // fix stretching
    pos.x *= aspect;
    
    float mouseStrength = 0.2;
    pos += (uMouse * mouseStrength - vec2(0.5,0.2) * aspect/2.) ;
    // put in the center bottom (arbitrary, trial and error)
    pos += vec2(-1.0, 0.0) ;


    // mirror screen diagonally (the values are arbitrary, trial and error)
    // if (pos.x > aspect/2. * (1.-pos.y+0.5)) {
    //     // pos = pos * 2.0 ;
    //     pos.x -= 2.0;
    //     pos.y -= 1.0;
    // }
    // distance from current center
    float distance = length(pos);

    // time
    float time = uTime;
    time *= 0.5;
    // time *= fbm_noise(pos, 300., 5);
    // time *= 1.- length(pos+0.4);
    time += 10.0;



    // zoom

    vec3 col = vec3(0.0);

    float angle = (atan(pos.x, pos.y) + PI) / (2.0 * PI);

    
    // 5356FF
    vec3 col1 = vec3(83.0, 86.0, 255.0) / 255.0;
    // FDA403
    vec3 col2 = vec3(253.0, 164.0, 3.0) / 255.0;
    vec3 colf1 = pestki(angle, pos, distance + sin(time)*0.01, time, col1, col2);

    // same but other colors, offset distance and time and angle
    // 67C6E3
    col1 = vec3(103.0, 198.0, 227.0) / 255.0;
    // 891652
    col2 = vec3(137.0, 22.0, 82.0) / 255.0;
    vec3 colf2 = pestki(angle , pos, distance * 1.05, time +0.1, col1, col2);
    // col = colf2;
    col = mix(colf1, colf2, mouse01().y *0.3 +0.3);

    // vignette
    // float vig = 1.0 - distance;
    // vig = smoothstep(-1.0, 0., vig);
    // float vig_strength = 0.5;
    // col *= 1.-((1.-vig) * vig_strength);
    // col = vec3(vig);




    gl_FragColor = vec4(col, 1.0);

}