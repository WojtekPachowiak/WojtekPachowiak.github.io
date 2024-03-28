uniform vec2 resolution;
uniform vec2 mousePos;
uniform float checkerSize;
uniform sampler2D tex;
const float PI = 3.1415926535;
uniform float warpStrength;
uniform float warpRadius;
uniform float time;
uniform float warpShape;


vec2 fishEye(vec2 pos, vec2 mousePosNorm, float radius, float strength) {
    float aperture = 178.0;
    float apertureHalf = 0.5 * aperture * (PI / 180.0);
    float maxFactor = sin(apertureHalf) ; // almost 1.0

    vec2 xy = 2.0 * (pos - mousePosNorm)  ;
    float d = length(xy );
    if(d < (2.0 - maxFactor)) { // more or less less than 1.0
        d = length(xy * maxFactor) ;
        float z = sqrt(1.0 - d * d);
        float r = atan(d, z) / PI;
        float phi = atan(xy.y, xy.x);

        pos.x = r * cos(phi) + mousePosNorm.x;
        pos.y = r * sin(phi) + mousePosNorm.y;
    } 
    return pos;
}

vec2 blackhole_warp(vec2 pos, vec2 mousePosNorm, float radius, float strength) {
    vec2 dir = pos - mousePosNorm;
    float dist = length(dir);
    float distFactor = 1.0 - smoothstep(0.0, radius, dist);
    float strengthFactor = (smoothstep(-1.0, 1.0, strength) - 0.5) *2.0 * max(1.0, abs(strength));
    float factor = distFactor * strengthFactor ;

    return  dir * factor;
}

vec2 rotate(vec2 pos, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    mat2 rot = mat2(c, -s, s, c);
    return rot * pos;

}

vec2 spiral_warp(vec2 pos, vec2 mousePosNorm, float radius, float strength) {
    // rotate around the mouse position
    vec2 dir = pos - mousePosNorm;
    // "power" determines how quickly the spiral affets the center of the area of effect (the lower it is, the quicker)
    float power = 0.1;
    float dist = pow(length(dir),power);

    // make the strengh and radius independent of the power
    radius = pow(radius, power);
    strength = strength / power *1.;
    
    float distFactor = 1.0 - smoothstep(0.0, radius, dist);
    float strengthFactor = (smoothstep(-1.0, 1.0, strength) - 0.5) *2.0 * max(1.0, abs(strength));
    
    float factor = distFactor * strengthFactor ;
    dir = rotate(dir, PI/2.);


    return  dir * factor;
}



vec3 checker(vec2 pos, float size) {

    vec2 checkerPos = pos + 1.0/size *step(1.0/size, mod(pos.x, 2.0/size));
    return vec3(step(1.0/size, mod(checkerPos.y, 2.0/size)));
}

vec3 blurred_checker(vec2 pos, float radius, float size) {
    vec3 color = vec3(0.0);
    float total = 0.0;
    if(radius == 0.0) {
        color = checker(pos, size);
        return color;
    }
    #pragma unroll_loop_start 

    for (float x = -radius; x <= radius; x++) {
        for (float y = -radius; y <= radius; y++) {
            vec2 offset = vec2(x, y);
            vec3 sampl = checker(pos + offset/resolution.y, size);
            float weight = 1.0 - length(offset) / radius;
            color += sampl * weight;
            total += weight;
        }
    }
    #pragma unroll_loop_end

    return color / total;
}


vec3 blurred_tex(sampler2D tex, vec2 pos, float radius) {
    vec3 color = vec3(0.0);
    float total = 0.0;
    if (radius == 0.0) {
        color = texture2D(tex, pos).rgb;
        return color;
    }
    #pragma unroll_loop_start 
    for(float x = -radius; x <= radius; x++) {
        for(float y = -radius; y <= radius; y++) {
            vec2 offset = vec2(x, y);
            vec3 sampl = texture2D(tex, pos + offset/resolution.y).rgb;
            float weight = 1.0 - length(offset) / radius;
            color += sampl * weight;
            total += weight;
        }
    }
    #pragma unroll_loop_end

    return color / total;
}

void main() {

    vec2 pos =  gl_FragCoord.xy / resolution.y;
    vec2 pos2 = gl_FragCoord.xy / resolution.xy;
    vec2 mousePosNorm = mousePos / resolution.y;
    vec2 mousePosNorm2 = mousePos / resolution.xy;

    
    vec3 color;

    // pos = fishEye(pos, mousePosNorm, 0.2, 0.0);
    // pos2 = blackhole(pos2, mousePosNorm2, warpRadius, warpStrength);

    vec2 warp;
    if (round(warpShape) == 0.0) {
        warp = blackhole_warp(pos, mousePosNorm, warpRadius, warpStrength);
    } else if (round(warpShape) == 1.0) {

        warp = spiral_warp(pos, mousePosNorm, warpRadius, warpStrength);
    }

    pos2 = pos2 + warp;

    color = texture2D(tex, pos2).rgb;

    gl_FragColor = vec4(color, 1.);

}