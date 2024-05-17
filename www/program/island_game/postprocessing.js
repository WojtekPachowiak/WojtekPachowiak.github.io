import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { g } from "./globals.js";
import * as THREE from "three";

export function initPostProcessing() {
  //////////////////////////////////////////////////////////////////////////////////////////////

  const ps1PostprocShader = {
    name: "ps1PostprocShader",
    uniforms: {
      tDiffuse: { value: null },
      uResolution: { value: g.SCREEN.RESOLUTION },
      uBlackBarsT: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
    
                        varying vec2 vUv;
    
                        void main() {
    
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
                        }`,
    fragmentShader: /* glsl */ `
                        
                        #define PI 3.14159265358979323846

                        uniform sampler2D tDiffuse;
                        uniform vec2 uResolution;
                        uniform float uBlackBarsT;
                        uniform float uTime;
    
                        varying vec2 vUv;
    
                        mat4 psx_dither_table = mat4(
                            0.,8.,2.,10.,
                            12.,4.,14.,6.,
                            3.,11.,1.,9.,
                            15.,7.,13.,5.
                        );
    
                        
    
                        vec3 dither(vec3 color, vec2 p){
                            //extrapolate 16bit color float to 16bit integer space
                            color*=255.;


                            // return vec3(p.x,p.y,0.);
                            // return debug checkerboard
                            // if (mod(p.x, 4.) > 2. && mod(p.y, 4.) > 2.){
                            //     return vec3(1.);
                            // }else{
                            //     return vec3(0.);
                            // }

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
    
                        vec2 pixelate(vec2 uv, vec2 res){
                          return floor(uv  * res ) / res;
                        }

                        float pixelate(float t, float res){
                          return floor(t  * res ) / res;
                        }

                        vec3 posterize(vec3 color, float levels) {
                            color *= levels;
                            color = floor(color);
                            color /= levels;
                            return color;
                        }

                        vec3 vignette(vec2 uv, float amount){
                            float dist = distance(uv, vec2(0.5));
                            return mix(vec3(0.), vec3(1.), smoothstep(0.5, 0.5+amount, dist));
                        }

                        float rand (vec2 st) {
                                return fract(sin(dot(st.xy,
                                                    vec2(12.9898,78.233)))*
                                    43758.5453123);
                            }



                            float noise(vec2 p, float freq ){
                              float unit = 200./freq;
                              vec2 ij = floor(p/unit);
                              vec2 xy = mod(p,unit)/unit;
                              //xy = 3.*xy*xy-2.*xy*xy*xy;
                              xy = .5*(1.-cos(PI*xy));
                              float a = rand((ij+vec2(0.,0.)));
                              float b = rand((ij+vec2(1.,0.)));
                              float c = rand((ij+vec2(0.,1.)));
                              float d = rand((ij+vec2(1.,1.)));
                              float x1 = mix(a, b, xy.x);
                              float x2 = mix(c, d, xy.x);
                              return mix(x1, x2, xy.y);
                            }

                            float pNoise(vec2 p, int res){
                              float persistance = .5;
                              float n = 0.;
                              float normK = 0.;
                              float f = 4.;
                              float amp = 1.;
                              int iCount = 0;
                              for (int i = 0; i<50; i++){
                                n+=amp*noise(p, f);
                                f*=2.;
                                normK+=amp;
                                amp*=persistance;
                                if (iCount == res) break;
                                iCount++;
                              }
                              float nf = n/normK;
                              return nf*nf*nf*nf;
                            }

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
                            
                            
                            //// apply noise, changing with time
                            float rtime = pixelate(uTime,130.) *0.1;
                            // float r = rand(vec2(uv.x, uv.y)+rtime);
                            float r = pNoise(vec2(uv.x, uv.y)+uTime, 1000);
                            // r = r * 2. - 1.;
                            r *= 0.9;
                            texel += r;
                            
                            
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

  //////////////////////////////////////////////////////////////////////////////////////////////

  

  //////////////////////////////////////////////////////////////////////////////////////////////

  const AdditiveBlendShader = {
    name: "AdditiveBlendShader",

    uniforms: {
      tDiffuse: { value: null },
      tDiffuseBelow: { value: null },
    },

    vertexShader: /* glsl */ `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

    fragmentShader: /* glsl */ `


		uniform sampler2D tDiffuse;
		uniform sampler2D tDiffuseBelow;

		varying vec2 vUv;

		void main() {

			vec4 texelAbove = texture2D( tDiffuse, vUv );
			vec4 texelBelow = texture2D( tDiffuseBelow, vUv );
			// gl_FragColor = texelAbove + texelBelow ;
			// gl_FragColor = vec4(vec3(texelAbove.a), 1.0) ;
			gl_FragColor = mix( texelAbove, texelBelow, 1.-texelAbove.a );


		}`,
  };

  //////////////////////////////////////////////////////////////////////////////////////////////

  const size = g.RENDERER.getDrawingBufferSize(new THREE.Vector2());
  const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    // format: THREE.RGBAFormat,
    // stencilBuffer: false,
    // samples: 8
  });

  {
    g.POSTPROCESSING_COMPOSERS.MAIN = new EffectComposer(
      g.RENDERER,
      renderTarget
    );
    const renderPass = new RenderPass(g.SCENE, g.CAMERA);
    const shaderPass = new ShaderPass(ps1PostprocShader);
    // const copyPass = new ShaderPass(ps1UIPostprocShader);
    const outputPass = new OutputPass();

    g.POSTPROCESSING_COMPOSERS.MAIN.addPass(renderPass);
    g.POSTPROCESSING_COMPOSERS.MAIN.addPass(shaderPass);
    // g.POSTPROCESSING_COMPOSERS.MAIN.addPass(copyPass);
    g.POSTPROCESSING_COMPOSERS.MAIN.addPass(outputPass);

    g.POSTPROCESSING_PASSES.PS1 = shaderPass;
  }
  // {
  //   g.POSTPROCESSING_COMPOSERS.UI = new EffectComposer(
  //     g.RENDERER,
  //     renderTarget.clone()
  //   );
  //   g.POSTPROCESSING_COMPOSERS.UI.renderToScreen = true;
  //   const renderPass = new RenderPass(g.SCENE, g.CAMERA);
  //   const shaderPass = new ShaderPass(ps1UIPostprocShader);
  //   const addBlendPass = new ShaderPass(AdditiveBlendShader);

  //   //pass in resulting renderTarget texture from ppoRGB
  //   addBlendPass.uniforms.tDiffuseBelow.value =
  //     g.POSTPROCESSING_COMPOSERS.MAIN.renderTarget1.texture;

  //   g.POSTPROCESSING_COMPOSERS.UI.addPass(renderPass);
  //   g.POSTPROCESSING_COMPOSERS.UI.addPass(shaderPass);
  //   g.POSTPROCESSING_COMPOSERS.UI.addPass(addBlendPass);
  //   g.POSTPROCESSING_COMPOSERS.UI.addPass(new OutputPass());

  //   g.POSTPROCESSING_PASSES.PS1_UI = shaderPass;
  // }

  // g.POSTPROCESSING_COMPOSERS.UI.addPass(new OutputPass());
}
