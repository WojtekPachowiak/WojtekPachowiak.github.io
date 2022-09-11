precision lowp float;
precision lowp int;
precision lowp sampler2D;
uniform vec2 R;
uniform float D, T;
uniform sampler2D T0;
void main() {
    lowp vec3 v;
    highp vec2 f;
    f = gl_FragCoord.xy / R;
    highp vec2 m;
    m = (gl_FragCoord.xy * 2. - R) / D;
    highp vec2 h;
    h = f - m / R * 20.7;
    lowp vec2 i;
    i = (texture2D(T0, h).xy - vec2(.3, .3)) * vec2(.002, .002);
    highp vec2 l;
    l = f - i;
    v = texture2D(T0, l).xyz * .999;
    highp float u;
    u = sqrt(dot(m, m));
    if(u < .618) {
        highp float e, c;
        c = clamp((u - .618) / -.016, 0., 1.);
        e = c * (c * (3. - 2. * c)) * (u / .618);
        highp float p;
        p = pow(e, 20.);
        e = p;
        float o;
        o = float(mod(T * .1, 1.));
        vec3 y;
        y = vec3(3.54585, 2.93225, 2.41594) * (o - vec3(.695491, .492283, .276999));
        vec3 z;
        z = vec3(3.90307, 3.21183, 3.96587) * (o - vec3(.117486, .86755, .660779));
        v = v + (min(max(vec3(1., 1., 1.) - y * y - vec3(.0231264, .152251, .52608), 0.), 1.) +
            min(max(vec3(1., 1., 1.) - z * z - vec3(.848971, .884453, .739495), 0.), 1.)) * p * .03;
        if(u < .4944) {
            highp float t;
            t = clamp((u - .4944) / -.016, 0., 1.);
            e = t * (t * (3. - 2. * t)) * (u / .4944);
            highp float s;
            s = pow(e, 20.);
            e = s;
            float g;
            g = float(mod(T * .1 + .5, 1.));
            vec3 w;
            w = vec3(3.54585, 2.93225, 2.41594) * (g - vec3(.695491, .492283, .276999));
            vec3 a;
            a = vec3(3.90307, 3.21183, 3.96587) * (g - vec3(.117486, .86755, .660779));
            v = v + (min(max(vec3(1., 1., 1.) -
                w * w - vec3(.0231264, .152251, .52608), 0.), 1.) + min(max(vec3(1., 1., 1.) - a * a - vec3(.848971, .884453, .739495), 0.), 1.)) * s * .03;
        }
        v = clamp(v, 0., 1.);
    }
    lowp vec4 p;
    p.w = 1.;
    p.xyz = v;
    gl_FragColor = p;
}
