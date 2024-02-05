vec2 pos;
uniform float time;
uniform vec2 resolution;
uniform float zoom;

#define     PI 3.14159265358979323846

float rand(vec2 c) {
    return fract(sin(dot(c.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p, float freq) {
    float unit = 1920. / freq; // THIS IS EXTREMELY ARBITRARY, IDK WHY IT WORKS
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
// - vec2( 1920. / 1080., 1.0);
    vec2 res = resolution;
    vec2 pos = 2.0 * gl_FragCoord.xy / res.xy ;
    pos.x *= res.x / res.y;
    
    pos += vec2(1.5, -1.) + vec2(sin(time * 0.3), cos(time * 0.5)) * 0.02;

    vec2 pos_zoom_in_out = pos * remap(sin(0.5 * time), -1., 1., 0.5, sin(time * 0.001) + 1.);
    vec2 translation = vec2(0.1 * sin(time * 2.), 0.3 * sin(time));

    float pixelization = 100.;
    // vec2 pos_pixelated = floor(pos_zoom_in_out * pixelization) / pixelization;

    // vec2 noised_pos = pos + pNoise(pos * time, 100) * 20.;

    float pnoise_freq = 10000.;
    // float pnoise_translation = 10000.;
    float pnoise = fbm(pos + translation * -0.01, pnoise_freq) ;

    float randn = rand(pos + sin(time));
    // float randn_pixelated = rand(pos_pixelated + sin(time));
    // float randn_offseted = rand(pos + 2. + sin(time));

    float square_noise_zoom = 10000. * pnoise;
    float b = noise(pos_zoom_in_out + translation * pnoise, square_noise_zoom) * 1.5;

    float randn_brighter = randn*0.3;
    vec3 final1 = vec3(randn_brighter * pnoise * b);
    vec3 final2 = vec3(randn_brighter * pnoise + b);

    vec3 out_col = mix(final1, final2, sin(time * 0.1) * 0.25 + 0.25);
    out_col = clamp(out_col, 0., 1.);
    out_col = mix(out_col, 1. - out_col, step(0.5, 1. - zoom));
    gl_FragColor = vec4(out_col, 1.0);

}