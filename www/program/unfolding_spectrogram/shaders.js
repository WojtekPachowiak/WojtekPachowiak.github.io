

import { Lut } from 'three/addons/math/Lut.js';

const lut = new Lut( 'blackbody', 256 );

export const AudioDisplacementShader = {
	uniforms: {
		'uLut': { value: lut.lut },
	},

	vertexShader: /* glsl */`
		attribute float displacement; // the displacement value for each vertex from 0 to 1
		varying vec3 vColor;

		uniform vec3 uLut[ 256 ];

		void main() {
			vColor = uLut[ int( displacement ) ];
			float disp = displacement /256.0;
			vec3 newPosition = position + normal *disp*2.;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		varying vec3 vColor;

		void main() {
			gl_FragColor = vec4( vColor, 1.0 );
		}`

};

