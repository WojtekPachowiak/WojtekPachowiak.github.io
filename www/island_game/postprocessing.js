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

                        vec3 posterize(vec3 color, float levels) {
                            color *= levels;
                            color = floor(color);
                            color /= levels;
                            return color;
                        }

                        void main() {
    
                            vec2 pos = gl_FragCoord.xy / uResolution.y;
                            
                            //pixelate
                            vec2 uv = vUv;
                            uv = pixelate(uv, uResolution);
    
                            // sample tex
                            vec4 texel_wa = texture2D( tDiffuse, uv).rgba;
                            vec3 texel = texel_wa.rgb;
                            float opacity = texel_wa.a;

                            
                            //scaling gl_FragCoord makes it so that the same value from dither table is used for each pixel in a block (texel)
                            texel = dither(texel, uv *uResolution );
                            
                            // posterize
                            float levels = 128.0;
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
