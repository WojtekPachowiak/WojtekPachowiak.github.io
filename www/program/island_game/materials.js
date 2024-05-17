import * as THREE from "three";
import {g} from "./globals.js";

export function initMaterials() {
	// modify mesh phong material's vertex shader with onbeforecompile
	g.MATERIALS.PS1 = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    dithering: true,
    // vertexColors: true,
    // transparent: true,
    name: "PS1",
  });

  


	// // g.MATERIALS.PS1.transparent = true;
	// // g.MATERIALS.PS1.opacity = 0.5;
	// g.MATERIALS.PS1.onBeforeCompile = (shader) => {
	// 	g.MATERIALS.PS1.userData.shader = shader;
	// 	console.log("onBeforeCompile");
	// 	console.log(shader);

	// 	// define custom uniform "uResolution" for the shader
	// 	shader.uniforms.uResolution = { value: g.SCREEN.RESOLUTION };
	// 	shader.uniforms.uVertexJitterStrength = { value: 0.5 };

	// 	// vertex snapping and affine texture mapping
	// 	shader.vertexShader = shader.vertexShader.replace(
	// 		"void main() {",
	// 		`
  //                     uniform vec2 uResolution;
  //                     uniform float uVertexJitterStrength;
  //                     varying vec2 vUv;
  //                     varying float vW;
  
  //                     void main() {
  //                     `
	// 	);
	// 	shader.vertexShader = shader.vertexShader.replace(
	// 		"#include <project_vertex>",
	// 		`
                      
  //                    vec4 mvPosition = vec4( transformed, 1.0 );
      
  //                     #ifdef USE_INSTANCING
      
  //                         mvPosition = instanceMatrix * mvPosition;
      
  //                     #endif
      
  //                     mvPosition = modelViewMatrix * mvPosition;
                      
  //                     // vertex snapping
  //                     vec4 _mypos = projectionMatrix * mvPosition;
  //                     vec2 _myres = uResolution * uVertexJitterStrength;
  //                     _mypos.xy = floor(_myres * _mypos.xy / _mypos.w) / _myres * _mypos.w;
  //                     gl_Position = _mypos;
                      
  //                     // affine texture mapping
  //                     vUv = uv * gl_Position.w;
  //                     vW = gl_Position.w;
  //                     `
	// 	);

	// 	// affine texture mapping
	// 	shader.fragmentShader = shader.fragmentShader.replace(
	// 		"void main() {",
	// 		`
  //                     varying vec2 vUv;
  //                     varying float vW;
  //                     void main() {
  //                     `
	// 	);
	// 	shader.fragmentShader = shader.fragmentShader.replace(
	// 		"#include <map_fragment>",
	// 		`
  //                     #ifdef USE_MAP
  //                       diffuseColor *= texture2D( map, vUv / vW);
  
  //                     #endif
  //                     `
	// 	);

// 		shader.vertexShader = `
//               #define PHONG
//   varying vec3 vViewPosition;
//   #include <common>
//   #include <uv_pars_vertex>
//   #include <displacementmap_pars_vertex>
//   // #include <envmap_pars_vertex>
//   #include <color_pars_vertex>
//   #include <fog_pars_vertex>
//   #include <normal_pars_vertex>
//   // #include <morphtarget_pars_vertex>
//   // #include <skinning_pars_vertex>
//   // #include <shadowmap_pars_vertex>
//   // #include <logdepthbuf_pars_vertex>
//   // #include <clipping_planes_pars_vertex>
  
//                       uniform vec2 uResolution;
//                       uniform float uVertexJitterStrength;
//                       varying vec2 vUv;
//                       varying float vW;
  
//                       void main() {
                      
//     #include <uv_vertex>
//     #include <color_vertex>
//     // #include <morphcolor_vertex>
//     #include <beginnormal_vertex>
//     #include <morphnormal_vertex>
//     // #include <skinbase_vertex>
//     // #include <skinnormal_vertex>
//     #include <defaultnormal_vertex>
//     #include <normal_vertex>
//     #include <begin_vertex>
//     // #include <morphtarget_vertex>
//     // #include <skinning_vertex>
//     // #include <displacementmap_vertex>
    
                      
//                      vec4 mvPosition = vec4( transformed, 1.0 );
      
//                       #ifdef USE_INSTANCING
      
//                           mvPosition = instanceMatrix * mvPosition;
      
//                       #endif
      
//                       mvPosition = modelViewMatrix * mvPosition;
                      
//                       // vertex snapping
//                       vec4 _mypos = projectionMatrix * mvPosition;
//                       vec2 _myres = uResolution * uVertexJitterStrength;
//                       _mypos.xy = floor(_myres * _mypos.xy / _mypos.w) / _myres * _mypos.w;
//                       gl_Position = _mypos;
                      
//                       // affine texture mapping
//                       vUv = uv * gl_Position.w;
//                       vW = gl_Position.w;
                      
//     // #include <logdepthbuf_vertex>
//     // #include <clipping_planes_vertex>
//     vViewPosition = - mvPosition.xyz;
//     #include <worldpos_vertex>
//     // #include <envmap_vertex>
//     #include <shadowmap_vertex>
//     #include <fog_vertex>
//   }
//               `;

// 		shader.fragmentShader = `
//                       #define PHONG
//   uniform vec3 diffuse;
//   uniform vec3 emissive;
//   uniform vec3 specular;
//   uniform float shininess;
//   uniform float opacity;
//   #include <common>
//   #include <packing>
//   #include <dithering_pars_fragment>
//   #include <color_pars_fragment>
//   #include <uv_pars_fragment>
//   #include <map_pars_fragment>
//   // #include <alphamap_pars_fragment>
//   // #include <alphatest_pars_fragment>
//   // #include <alphahash_pars_fragment>
//   // #include <aomap_pars_fragment>
//   #include <lightmap_pars_fragment>
//   #include <emissivemap_pars_fragment>
//   // #include <envmap_common_pars_fragment>
//   // #include <envmap_pars_fragment>
//   #include <fog_pars_fragment>
//   #include <bsdfs>
//   #include <lights_pars_begin>
//   #include <normal_pars_fragment>
//   #include <lights_phong_pars_fragment>
//   // #include <shadowmap_pars_fragment>
//   // #include <bumpmap_pars_fragment>
//   // #include <normalmap_pars_fragment>
//   // #include <specularmap_pars_fragment>
//   // #include <logdepthbuf_pars_fragment>
//   // #include <clipping_planes_pars_fragment>
  
//                       varying vec2 vUv;
//                       varying float vW;
//                       void main() {
                      
//     // #include <clipping_planes_fragment>
//     vec4 diffuseColor = vec4( diffuse, opacity );
//     ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
//     vec3 totalEmissiveRadiance = emissive;
//     // #include <logdepthbuf_fragment>
    
//                       #ifdef USE_MAP
//                         diffuseColor *= texture2D( map, vUv / vW);
  
//                       #endif
                      
//     #include <color_fragment>
//     // #include <alphamap_fragment>
//     // #include <alphatest_fragment>
//     // #include <alphahash_fragment>
//     #include <specularmap_fragment>
//     #include <normal_fragment_begin>
//     #include <normal_fragment_maps>
//     #include <emissivemap_fragment>
//     #include <lights_phong_fragment>
//     #include <lights_fragment_begin>
//     // #include <lights_fragment_maps>
//     #include <lights_fragment_end>
//     // #include <aomap_fragment>
//     vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
//     // #include <envmap_fragment>
//     #include <opaque_fragment>
//     #include <tonemapping_fragment>
//     #include <colorspace_fragment>
//     #include <fog_fragment>
//     #include <premultiplied_alpha_fragment>
//     #include <dithering_fragment>
//   }
//                       `;

	// };


}

function modifyPhongMaterial(material) {
  // material.transparent = true;
  // material.opacity = 0.5;
  material.onBeforeCompile = (shader) => {
    material.userData.shader = shader;


    // define custom uniform "uResolution" for the shader
    shader.uniforms.uResolution = { value: g.SCREEN.RESOLUTION };
    shader.uniforms.uVertexJitterStrength = { value: 0.5 };
    // shader.uniforms.uTime = { value: 0.0 };
    shader.uniforms.uTexOffset = { value: new THREE.Vector2(0, 0) };

    // vertex snapping and affine texture mapping
    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      `
                      uniform vec2 uResolution;
                      uniform float uVertexJitterStrength;
                      varying vec2 vUv;
                      varying float vW;
  
                      void main() {
                      `
    );
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      `
                      
                     vec4 mvPosition = vec4( transformed, 1.0 );
      
                      #ifdef USE_INSTANCING
      
                          mvPosition = instanceMatrix * mvPosition;
      
                      #endif
      
                      mvPosition = modelViewMatrix * mvPosition;
                      
                      // vertex snapping
                      vec4 _mypos = projectionMatrix * mvPosition;
                      vec2 _myres = uResolution * uVertexJitterStrength;
                      // _mypos.xy = floor(_myres * _mypos.xy / _mypos.w) / _myres * _mypos.w;
                      gl_Position = _mypos;
                      
                      // affine texture mapping
                    //   vUv = uv * gl_Position.w;
					  vUv = uv;
                      vW = gl_Position.w;
                      `
    );

    // affine texture mapping
    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      `
                      varying vec2 vUv;
                      varying float vW;
                      uniform vec2 uTexOffset;
                      void main() {
                      `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
                      #ifdef USE_MAP
                        // diffuseColor *= texture2D( map, vUv / vW);
                        diffuseColor *= texture2D( map, vUv + uTexOffset);
  
                      #endif
                      `
    );

  };

  return material;
}

  export function createPS1Material() {
    // modify mesh phong material's vertex shader with onbeforecompile
    let material = g.MATERIALS.PS1.clone();

  material = modifyPhongMaterial(material);
        
  return material;
}