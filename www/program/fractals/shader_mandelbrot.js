
{
`
    const int maxIterations = 100;
    
    vec2 squareImaginary(vec2 number){
        return vec2(
            pow(number.x,2.0)-pow(number.y,2.0),
            2.0*number.x*number.y
        );
    }
    
    float iterateMandelbrot(vec2 coord){
        vec2 z = vec2(0.000,0.0);
        float dist = 1e20;
        vec2 somePoint = vec2(0.0,0.0);
        for(int i=0;i<maxIterations;i++){
            // z = z^2 + c
            z = squareImaginary(z) + coord;
            if(length(z)>2.0) return float(i)/float(maxIterations);
            dist = min( dist, pow(length(z-somePoint),2.0) );
            
        }
        return sqrt(dist);
    }
    
    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        vec2 st = fragCoord.xy/iResolution.xy;
        st.x *= iResolution.x/iResolution.y;
        
        float zoom = sin(iTime/10.)/2. +0.5;
        zoom *= 100.;
        zoom += 1.;
        vec2 offset = iMouse.xy/iResolution.xy;
        offset += vec2(0.3, -0.5);
        //// center "camera" to [-1,1] range in x and y 
        st = st*2. -1.;
        //// zoom "camera"
        st = st / pow(zoom,2.0);
        //// offset "camera"
        st -= offset;
        
        vec3 color = vec3(iterateMandelbrot(st));
        
        fragColor = vec4(color,1.0);
        
    }
`
}