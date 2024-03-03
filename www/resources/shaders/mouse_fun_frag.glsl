uniform vec2 resolution;
uniform vec2 mousePos;
uniform float checkerSize;
uniform sampler2D tex;
const float PI = 3.1415926535;
uniform float warpStrength;
uniform float warpRadius;



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

vec2 blackhole(vec2 pos, vec2 mousePosNorm, float radius, float strength) {
    vec2 dir = pos - mousePosNorm;
    float dist = length(dir);
    float distFactor = 1.0 - smoothstep(0.0, radius, dist);
    float strengthFactor = (smoothstep(-1.0, 1.0, strength) - 0.5) *2.0 * max(1.0, abs(strength));
    float factor = distFactor * strengthFactor ;

    return pos + dir * factor;
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
    pos2 = blackhole(pos2, mousePosNorm2, warpRadius, warpStrength);
    pos = blackhole(pos, mousePosNorm, warpRadius, warpStrength);
    // color = blurred_tex(tex, pos,6.0);
    // // texture
    // gl_FragColor = vec4(color, 1.);
    // return;

    // distance to mouse changes color
    // color = mix(color, vec3(1.0, 0.0, 0.0), smoothstep(0.1, 0.0, mousePosNorm));
    
    // checker board
    //  color = checker(pos, checkerSize);
    // color = blurred_checker( pos, 4.0, checkerSize);

    // checker on nonnormalized coords
    // color = vec3(smoothstep(.3, 1.0, 20.*sin(pos.x * checkerSize) * sin(pos.y * checkerSize)));


    color = texture2D(tex, pos2).rgb;

    gl_FragColor = vec4(color, 1.);
    // gl_FragColor = vec4(pos,0.0, 1.);

}