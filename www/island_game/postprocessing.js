import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { g } from "./globals.js";



function initMainComposer() {
    

  const ps1PostprocShader = {
    name: "ps1PostprocShader",
    uniforms: {
      tDiffuse: { value: null },
      uResolution: { value: g.SCREEN.RESOLUTION },
      uBlackBarsT: { value: 0 },
    },
    vertexShader: /* glsl */ `
    
                        varying vec2 vUv;
    
                        void main() {
    
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
                        }`,
    fragmentShader: /* glsl */ `
                        
    
                        uniform sampler2D tDiffuse;
                        uniform vec2 uResolution;
                        uniform float uBlackBarsT;
    
                        varying vec2 vUv;
    
                        mat4 psx_dither_table = mat4(
                            0.,8.,2.,10.,
                            12.,4.,14.,6.,
                            3.,11.,1.,9.,
                            15.,7.,13.,5.
                        );
    
                        //  float psx_dither_table[16] = float[16](
                        //     0.,8.,2.,10.,
                        //     12.,4.,14.,6.,
                        //     3.,11.,1.,9.,
                        //     15.,7.,13.,5.
                        //     );
    
                        
                        
    
    
                        vec3 dither(vec3 color, vec2 p){
                            //extrapolate 16bit color float to 16bit integer space
                            color*=255.;
    
                            //get dither value from dither table (by indexing it with column and row offsets)
                            int col = int(mod(p.x, 4.));
                            int row= int(mod(p.y, 4.));
                            float dither = psx_dither_table[col][row];
                            
                            //dithering process as described in PSYDEV SDK documentation
                            color += (dither/2. - 4.);
                            
                            //clamp to 0
                            color = max(color,0.);
                            
                            //truncate to 5bpc precision via bitwise AND operator, and limit value max to prevent wrapping.
                            //PS1 colors in default color mode have a maximum integer value of 248 (0xf8)
                            int m = 0xf8;
                            ivec3 c = ivec3(color) & ivec3(m);
                            color = mix( vec3(c), vec3(m),  step(vec3(m),color) );
                            
                            // return color/255.;
                            //bring color back to floating point number space
                            color/=255.; 

                           

                            return color;
                        }
    
    
                        void main() {
    
                            vec2 pos = gl_FragCoord.xy / uResolution.y;
    
                            //pixelate
                            
                            vec2 uv = vUv;
                            uv = floor(uv  * uResolution ) / uResolution;
    
                            // sample tex
                            vec4 texel_wa = texture2D( tDiffuse, uv ).rgba;
                            vec3 texel = texel_wa.rgb;
                            float opacity = texel_wa.a;

                            
                            //scaling gl_FragCoord makes it so that the same value from dither table is used for each pixel in a block (texel)
                            texel = dither(texel, uv*uResolution);
                            
                            // posterize
                            float posterize = 256.0;
                            texel = floor(texel * posterize) / posterize;
                            
                            // clamp black and white
                            
                            
                            
                            texel = clamp(texel, 5./255., 255./255.);
                            
                            
                            // convert top and bottom of the screen with black bars with height of uBlackBarsT each
                            float a =1.0;
                            if (vUv.y < uBlackBarsT || vUv.y > (1. - uBlackBarsT)) {
                                texel = vec3(1./255.);
                            }

                            // just color alpha
                            // gl_FragColor = vec4(vec3(opacity), 1.0 );

                            gl_FragColor = vec4(texel, opacity );

                            // gl_FragColor = vec4(vec3(opacity,opacity,0.), opacity);
                            
    
                        }
                        `,
  };

    g.POSTPROCESSING_COMPOSERS.MAIN = new EffectComposer(g.RENDERER);

    const renderPass = new RenderPass(g.SCENE, g.CAMERA);
    g.POSTPROCESSING_COMPOSERS.MAIN.addPass(renderPass);
  renderPass.renderToScreen = false;

  const ps1Pass = new ShaderPass(ps1PostprocShader);
  ps1Pass.renderToScreen = false;
  g.POSTPROCESSING_COMPOSERS.MAIN.addPass(ps1Pass);

  const outputPass = new OutputPass();
  outputPass.renderToScreen = false;
  g.POSTPROCESSING_COMPOSERS.MAIN.addPass(outputPass);

  g.POSTPROCESSING_PASSES.PS1 = ps1Pass;
}

function initUIComposer() {
    const CopyShader = {
      uniforms: {
        tDiffuse: { value: null },
      },
      vertexShader: /* glsl */ `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`,
      fragmentShader: /* glsl */ `
            uniform sampler2D tDiffuse;
            varying vec2 vUv;
            void main() {
                vec4 tex = texture2D( tDiffuse, vUv );
                gl_FragColor = vec4(vec3(tex.a,0.,tex.a), tex.a);
            }`,
    };

    g.POSTPROCESSING_COMPOSERS.UI = new EffectComposer(g.RENDERER);
    
    const renderPass = new RenderPass(g.SCENE, g.CAMERA);
    g.POSTPROCESSING_COMPOSERS.UI.addPass(renderPass);

    const copyPass = new ShaderPass(CopyShader);
    g.POSTPROCESSING_COMPOSERS.UI.addPass(copyPass);
    
    const outputPass = new OutputPass();
    g.POSTPROCESSING_COMPOSERS.UI.addPass(outputPass);
}

export function initPostProcessing() {
    initMainComposer();
    initUIComposer();
}
