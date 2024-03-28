import {
  HalfFloatType,
  MeshBasicMaterial,
  NearestFilter,
  ShaderMaterial,
  UniformsUtils,
  WebGLRenderTarget,
  LinearFilter,
} from "three";
import { FullScreenQuad, Pass } from "./Pass.js";

// https://github.com/mrdoob/three.js/blob/b507a453e4bd79c6859ac3b42bfc69b86255f5b8/examples/jsm/shaders/AfterimageShader.js#L4
const AfterimageShader = {
  name: "AfterimageShader",

  uniforms: {
    damp: { value: 0.96 },
    tOld: { value: null },
    tNew: { value: null },
    time: { value: 0.0 },
    afterimageType: { value: 0.0 },
  },

  vertexShader: /* glsl */ `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

  fragmentShader: /* glsl */ `

		uniform float damp;

		uniform sampler2D tOld;
		uniform sampler2D tNew;
    uniform float time;
    uniform float afterimageType;

		varying vec2 vUv;

		float when_gt( float x, float y ) {

			return max( sign( x - y ), 0.0 );

		}

    float brightness(vec3 color) {
      return dot(vec3(0.2126, 0.7152, 0.0722), color);
    }

    vec3 saturate(vec3 color, float amount) {
      vec3 grey = vec3(brightness(color));
      return mix(grey, color, amount);
    }

    float compare(vec3 col1, vec3 col2) {
      return (brightness(col1) - brightness(col2))*0.5 + 0.5;
    }


		void main() {

			vec3 texelOld = texture2D( tOld, vUv ).rgb;
			vec3 texelNew = texture2D( tNew, vUv ).rgb;


      float comp = compare(texelOld, texelNew);
      float texelOldBrightness = brightness(texelOld);
      float texelNewBrightness = brightness(texelNew);
      
      
      // gl_FragColor = vec4(vec3(comp),1.0);
      // return;

      // gl_FragColor = vec4(texelNew,0.1);
      // return;


      // ORIGINAL SETUP
			// texelOld *= damp * when_gt( brightness(texelOld), 0.1 );
      // gl_FragColor = vec4(max(texelNew, texelOld),1.0);
      // return;



      // if (time < 2.0) {
        // float mask = 1.0-smoothstep(0.5-spread,0.5+spread,texelNewBrightness);
        
        // make afterimage more saturated
        // texelOld = saturate(texelOld, 1.5*damp*(1.0));
        
      if (afterimageType > 0.5) {
          // smear
          float spread = 0.1;
        comp = smoothstep(0.5-spread,0.5+spread,comp);
      }
      else{
        // blur
        comp = 1.0;
      }

			gl_FragColor = vec4( mix(texelNew, texelOld, damp*comp),1.0);
      // gl_FragColor = vec4(vec3(step(0.1,texelNewBrightness)),1.0);
      // } else {
      // gl_FragColor = texelNew + texelOld * damp;
      // };
      // gl_FragColor = vec4(texelNew* smoothstep(0.3,0.5,texelNewBrightness),1.0) ;

			// gl_FragColor = vec4( vec3(mask) ,1.0);

      // texelNew = saturate(texelNew, 2.0);
			// gl_FragColor = vec4( vec3(texelNew) ,1.0);

		}`,
};

class AfterimagePass extends Pass {
  constructor(damp = 0.96) {
    super();

    this.shader = AfterimageShader;

    this.uniforms = UniformsUtils.clone(this.shader.uniforms);

    this.uniforms["damp"].value = damp;

    this.textureComp = new WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        magFilter: NearestFilter,
        type: HalfFloatType,
      }
    );

    this.textureOld = new WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        magFilter: NearestFilter,
        type: HalfFloatType,
      }
    );

    this.compFsMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.shader.vertexShader,
      fragmentShader: this.shader.fragmentShader,
    });

    this.compFsQuad = new FullScreenQuad(this.compFsMaterial);

    this.copyFsMaterial = new MeshBasicMaterial();
    this.copyFsQuad = new FullScreenQuad(this.copyFsMaterial);
  }

  render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive*/) {
    this.uniforms["tOld"].value = this.textureOld.texture;
    this.uniforms["tNew"].value = readBuffer.texture;

    renderer.setRenderTarget(this.textureComp);
    this.compFsQuad.render(renderer);

    this.copyFsQuad.material.map = this.textureComp.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.copyFsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);

      if (this.clear) renderer.clear();

      this.copyFsQuad.render(renderer);
    }

    // Swap buffers.
    const temp = this.textureOld;
    this.textureOld = this.textureComp;
    this.textureComp = temp;
    // Now textureOld contains the latest image, ready for the next frame.
  }

  setSize(width, height) {
    this.textureComp.setSize(width, height);
    this.textureOld.setSize(width, height);
  }

  dispose() {
    this.textureComp.dispose();
    this.textureOld.dispose();

    this.compFsMaterial.dispose();
    this.copyFsMaterial.dispose();

    this.compFsQuad.dispose();
    this.copyFsQuad.dispose();
  }
}

export { AfterimagePass };
