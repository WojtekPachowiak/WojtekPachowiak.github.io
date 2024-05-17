export const ScreenSinkShader = {
  name: "screenSinkShader",
  uniforms: {
    tDiffuse: { value: null },
    // uResolution: { value: g.SCREEN.RESOLUTION },
    uT: { value: 0 },
  },
  vertexShader: /* glsl */ `
    
                        varying vec2 vUv;
    
                        void main() {
    
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
                        }`,
  fragmentShader: /* glsl */ `
                        
    
                        uniform sampler2D tDiffuse;
                        uniform float uT;
                        varying vec2 vUv;
    

                        void main() {
    
                            
                          
                          
                          //pixelate
                          vec2 uv = vUv;
                            
                            
                            // sample tex
                            vec4 texel_wa = texture2D( tDiffuse, uv).rgba;
                            vec3 texel = texel_wa.rgb;
                            float opacity = texel_wa.a;

                            
                            //scaling gl_FragCoord makes it so that the same value from dither table is used for each pixel in a block (texel)
                            texel = dither(texel, floor(uv * uResolution) );
                            
                            // posterize
                            float levels = 32.0;
                            texel = posterize(texel, levels);
                            
                                                    
                            

                            // checked that empirically: in Silent Hill in almost completely black scene the lowest value is 0.09 (but in menu it's 0.0!)
                            texel = clamp(texel, 0.09, 1.0);
                            
                            
                            // convert top and bottom of the screen with black bars with height of uBlackBarsT each
                            // float a =1.0;
                            // if (vUv.y < uBlackBarsT || vUv.y > (1. - uBlackBarsT)) {
                            //     texel = vec3(0.0);
                            // }

                            // just color alpha
                            // gl_FragColor = vec4(vec3(opacity), 1.0 );

                            gl_FragColor = vec4(texel, opacity );

                            // gl_FragColor = vec4(vec3(opacity,opacity,0.), opacity);
                            
    
                        }
                        `,
};
