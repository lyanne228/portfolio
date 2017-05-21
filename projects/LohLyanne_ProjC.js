// Vertex shader program
var VSHADER_SOURCE =
	//	GLSL Struct Definitions:
	'struct LampT {\n' +
	'	vec3 pos;\n' +
	' vec3 ambi;\n' +
	' vec3 diff;\n' +
	'	vec3 spec;\n' +
	'}; \n' +
	'struct MatlT {\n' +
	'	vec3 emit;\n' +
	'	vec3 ambi;\n' +
	'	vec3 diff;\n' +
	'	vec3 spec;\n' +
	'	int shiny;\n' +
  '};\n' +
	//	ATTRIBUTES of each vertex, read from our Vertex Buffer Object
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
	//	UNIFORMS: values set from JavaScript before a drawing command.
	'uniform LampT u_LampSet[2];\n' +
	'uniform MatlT u_MatlSet[1];\n' +
	'uniform vec3 u_eyePosWorld;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
	'uniform int u_shaderChoice;\n' +
	'uniform int u_lightingChoice;\n' +
	//	VARYING:Vertex Shader values sent per-pixel to Fragment shader:
	'varying vec3 v_Kd;\n' +
  'varying vec4 v_Position;\n' +
  'varying vec3 v_Normal;\n' +
	'varying vec4 v_Color;\n' +
	//-----------------------------------------------------------------------------
	'void main() {\n' +
  ' gl_Position = u_MvpMatrix * a_Position;\n' +
  ' v_Position = u_ModelMatrix * a_Position;\n' +
  ' v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
	'	v_Kd = u_MatlSet[0].diff;\n' +
  ' if(u_shaderChoice == 1){\n' +
	' 	vec3 lightDirection  = normalize(u_LampSet[0].pos - v_Position.xyz);\n' +
	' 	vec3 lightDirection2 = normalize(u_LampSet[1].pos - v_Position.xyz);\n' +
	' 	vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz);\n' +
	' 	float nDotL  = max(dot(lightDirection,  v_Normal), 0.0);\n' +
	' 	float nDotL2 = max(dot(lightDirection2, v_Normal), 0.0);\n' +
	'		float e64, e642;\n' +
	'		if(u_lightingChoice == 0){\n' +
	'			vec3 H  = normalize(lightDirection  + eyeDirection); \n' +
	'  		vec3 H2 = normalize(lightDirection2); \n' +
	'  		float nDotH  = max(dot(H,  v_Normal), 0.0); \n' +
	'  		float nDotH2 = max(dot(H2, v_Normal), 0.0); \n' +
	'  		e64  = pow(nDotH,  float(u_MatlSet[0].shiny));\n' +
	'  		e642 = pow(nDotH2, float(u_MatlSet[0].shiny));\n' +
	'		} else {\n' +
	'     vec3 R  = reflect(-lightDirection,  v_Normal);\n' +
	'   	vec3 R2 = reflect(-lightDirection2, v_Normal);\n'	+
	'    	float rDotV  = max(dot(R,  eyeDirection), 0.0);\n' +
	'    	float rDotV2 = max(dot(R2, v_Normal), 0.0);\n' +
	'    	e64  = pow(rDotV,  float(u_MatlSet[0].shiny)/4.0);\n' +
	'    	e642 = pow(rDotV2, float(u_MatlSet[0].shiny)/4.0);\n' +
	'		} \n' +
	'		vec3 emissive = u_MatlSet[0].emit;\n' +
	'   vec3 ambient = (u_LampSet[0].ambi + u_LampSet[1].ambi) * u_MatlSet[0].ambi;\n' +
	'   vec3 diffuse = (u_LampSet[0].diff * nDotL + u_LampSet[1].diff * nDotL2) * v_Kd;\n' +
	'		vec3 speculr = (u_LampSet[0].spec * e64 + u_LampSet[1].spec * e642) * u_MatlSet[0].spec ;\n' +
	'   v_Color = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
	' }\n'+
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
	//	Set precision
  'precision highp float;\n' +
  'precision highp int;\n' +
	//	GLSL Struct Definitions:
	'struct LampT {\n' +
	'	vec3 pos;\n' +
	'	vec3 ambi;\n' +
	' vec3 diff;\n' +
	'	vec3 spec;\n' +
	'}; \n' +
	'struct MatlT {\n' +
	'	vec3 emit;\n' +
	'	vec3 ambi;\n' +
	'	vec3 diff;\n' +
	'	vec3 spec;\n' +
	'	int shiny;\n' +
  '};\n' +
	//	UNIFORMS: values set from JavaScript before a drawing command.
	'uniform LampT u_LampSet[2];\n' +
	'uniform MatlT u_MatlSet[1];\n' +
  'uniform vec3 u_eyePosWorld;\n' +
	'uniform int u_shaderChoice;\n' +
	'uniform int u_lightingChoice;\n' +
 	//	VARYING:Vertex Shader values sent per-pixel to Fragment shader:
  'varying vec3 v_Normal;\n' +
  'varying vec4 v_Position;\n' +
  'varying vec3 v_Kd;\n' +
	'varying vec4 v_Color;\n' +

  'void main() {\n' +
	'	if (u_shaderChoice==0) {\n' +
	'		vec3 normal = normalize(v_Normal);\n' +
	'  	vec3 lightDirection = normalize(u_LampSet[0].pos - v_Position.xyz);\n' +
	'  	vec3 lightDirection2 = normalize(u_LampSet[1].pos - v_Position.xyz);\n' +
  '  	vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz);\n' +
	'  	float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
	'		float nDotL2 = max(dot(lightDirection2, normal), 0.0);\n' +
	'		float e64, e642;\n' +
	'		if(u_lightingChoice == 0){\n' +
	'  		vec3 H  = normalize(lightDirection  + eyeDirection); \n' +
	'  		vec3 H2 = normalize(lightDirection2); \n' +
	'  		float nDotH  = max(dot(H,  normal), 0.0); \n' +
	'  		float nDotH2 = max(dot(H2, normal), 0.0); \n' +
	'  		e64  = pow(nDotH,  float(u_MatlSet[0].shiny));\n' +
	'  		e642 = pow(nDotH2, float(u_MatlSet[0].shiny));\n' +
	'		} else{\n' +
	'    	vec3 R  = reflect(-lightDirection,  normal);\n' +
	'    	vec3 R2 = reflect(-lightDirection2, normal);\n'	+
	'    	float vDotR  = max(dot(R,  eyeDirection), 0.0);\n' +
	'    	float vDotR2 = max(dot(R2, normal), 0.0);\n' +
	'   	e64  = pow(vDotR,  float(u_MatlSet[0].shiny)/4.0);\n' +
	'    	e642 = pow(vDotR2, float(u_MatlSet[0].shiny)/4.0);\n' +
	'		} \n' +
	'		vec3 emissive = u_MatlSet[0].emit;\n' +
	'   vec3 ambient = (u_LampSet[0].ambi + u_LampSet[1].ambi) * u_MatlSet[0].ambi;\n' +
	'   vec3 diffuse = (u_LampSet[0].diff * nDotL + u_LampSet[1].diff * nDotL2) * v_Kd;\n' +
	'		vec3 speculr = (u_LampSet[0].spec * e64 + u_LampSet[1].spec * e642) * u_MatlSet[0].spec ;\n' +
  '  	gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
	'	} else {\n' +
	'		gl_FragColor = v_Color;\n' +
	'	}\n' +
  '}\n';

// Global vars for GPU 'storage locations'
var uLoc_eyePosWorld 	= false;
var uLoc_ModelMatrix 	= false;
var uLoc_MvpMatrix 		= false;
var uLoc_NormalMatrix = false;
var u_shaderChoice 		= false;
var u_lightingChoice 	= false;
var uLoc_Ke 					= false;															// ... for Phong material/reflectance
var uLoc_Ka 					= false;
var uLoc_Kd 					= false;
var uLoc_Kd2 					= false;
var uLoc_Ks 					= false;
var uLoc_Kshiny 			= false;
var canvas 						= false;															//  ... for 3D scene variables
var gl 								= false;
var n_vcount					= false;
var	eyePosWorld				= new Float32Array(3);								//  ... for our camera
var	lookPosWorld 			= new Float32Array(3);
var lightPosWorld 		= new Float32Array([0.0, 0.0, 6.0]);	//  ... for the world light
var lightAmbWorld			= new Float32Array(3);
var lightDifWorld			= new Float32Array(3);
var lightSpeWorld			= new Float32Array(3);
var lightsOff 				= new Float32Array([0.0,0.0,0.0]);		//  ... for the lights off color
var modelMatrix				= new Matrix4();											//  ... for our transforms
var	mvpMatrix					= new Matrix4();
var	normalMatrix			= new Matrix4();
var floatsPerVertex		= 6;
var lamp0							= new LightsT();											//	... for our first and second light sources
var lamp1							= new LightsT();											//  (stays false if never initialized)
var matl0							= new Material(MATL_RED_PLASTIC);			//  ... setting different materials
var matl1							= new Material(MATL_TURQUOISE);
var matl2							= new Material(MATL_SILVER_DULL);
var matl3							= new Material(MATL_GOLD_DULL);
var matl4							= new Material(MATL_BLACK_PLASTIC);
var toggles						= new Array(true, true);							//  ... for the toggles(world/head light)
var shaderChoice			= 0;																	//  ... for lighting and shading choices
var lightingChoice		= 0;
																														//  ... setting drawing/animation variables
var ANGLE_STEP 				= 5.0;														    // Angle step for rotation of lamp
var JUMP_STEP 				= 0.09;     													// Jump step for lamp jump
var lampJump 					= 0.0;      													// Origin height of jump
var lampJumpSet 			= false;
var runStop 					= true;
var cruiseSet 				= false;
var hor_angle 				= 0,
		ver_angle					= 0,
		roll_angle				= 0;
var g_last 						= Date.now();
var elapsed;

// ---------------END of global vars----------------------------

//=============================================================================
function main() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context \'gl\' for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

	// Initialize VBO
  n_vcount = initVertexBuffers(gl);		// vertex count.
  if (n_vcount < 0) {
    console.log('Failed to set the vertex information: n_vcount false');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.3, 0.3, 0.3, 1.0);
  gl.enable(gl.DEPTH_TEST);

  uLoc_eyePosWorld  = gl.getUniformLocation(gl.program, 'u_eyePosWorld');
  uLoc_ModelMatrix  = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  uLoc_MvpMatrix    = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  uLoc_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
	u_shaderChoice		= gl.getUniformLocation(gl.program, 'u_shaderChoice');
	u_lightingChoice	= gl.getUniformLocation(gl.program, 'u_lightingChoice');
  if (!uLoc_eyePosWorld || !uLoc_ModelMatrix	|| !uLoc_MvpMatrix
		|| !uLoc_NormalMatrix || !u_shaderChoice || !u_lightingChoice ) {
  	console.log('Failed to get GPUs matrix & shading/lighting options storage locations');
  	return;
  	}

	//  ... for Phong light source:
  lamp0.u_pos  = gl.getUniformLocation(gl.program, 'u_LampSet[0].pos');
  lamp0.u_ambi = gl.getUniformLocation(gl.program, 'u_LampSet[0].ambi');
  lamp0.u_diff = gl.getUniformLocation(gl.program, 'u_LampSet[0].diff');
  lamp0.u_spec = gl.getUniformLocation(gl.program, 'u_LampSet[0].spec');
  if( !lamp0.u_pos || !lamp0.u_ambi	|| !lamp0.u_diff || !lamp0.u_spec	) {
    console.log('Failed to get GPUs Lamp0 storage locations');
    return;
  }
	lamp1.u_pos  = gl.getUniformLocation(gl.program, 'u_LampSet[1].pos');
 	lamp1.u_ambi = gl.getUniformLocation(gl.program, 'u_LampSet[1].ambi');
	lamp1.u_diff = gl.getUniformLocation(gl.program, 'u_LampSet[1].diff');
	lamp1.u_spec = gl.getUniformLocation(gl.program, 'u_LampSet[1].spec');
	if( !lamp1.u_pos || !lamp1.u_ambi	|| !lamp1.u_diff || !lamp1.u_spec	) {
	  console.log('Failed to get GPUs Lamp1 storage locations');
	  return;
	}

	// ... for Phong material/reflectance:
	uLoc_Ke = gl.getUniformLocation(gl.program, 'u_MatlSet[0].emit');
	uLoc_Ka = gl.getUniformLocation(gl.program, 'u_MatlSet[0].ambi');
	uLoc_Kd = gl.getUniformLocation(gl.program, 'u_MatlSet[0].diff');
	uLoc_Ks = gl.getUniformLocation(gl.program, 'u_MatlSet[0].spec');
	uLoc_Kshiny = gl.getUniformLocation(gl.program, 'u_MatlSet[0].shiny');
	if(!uLoc_Ke || !uLoc_Ka || !uLoc_Kd || !uLoc_Ks || !uLoc_Kshiny) {
		console.log('Failed to get GPUs Reflectance storage locations');
		return;
	}

	// Position the camera in world coordinates:
	resetPosition();
	gl.uniform3fv(uLoc_eyePosWorld, eyePosWorld);
	gl.uniform1i(u_shaderChoice, shaderChoice);
	gl.uniform1i(u_lightingChoice, lightingChoice);

  // Create, init current rotation angle value in JavaScript
  var currentAngle = 0.0;
  drawResize(currentAngle);
  drawResize(currentAngle);

  // Register the event handler to be called on key press
  document.onkeydown= function(ev, currentAngle){keydown(ev.keyCode, currentAngle); };

  var tick = function() {
		setLights();
  	if (runStop)
	    currentAngle = animate(currentAngle);  // Update the rotation angle
	  if (lampJumpSet)
	    lampJumpFunction();
	  if (cruiseSet)
	    keydown(38, currentAngle);
	  drawResize(currentAngle);
	  requestAnimationFrame(tick, canvas);	   // Request that the browser re-draw the webpage
	};
	tick();							                       // start (and continue) animation
}

// --------- Functions for drawing primitives (create shapes/set materials)
function setMaterial(gl, matIndex) {
	switch(matIndex) {
		case 0:
			gl.uniform3fv(uLoc_Ke, matl0.K_emit.slice(0,3));				// Ke emissive
			gl.uniform3fv(uLoc_Ka, matl0.K_ambi.slice(0,3));				// Ka ambient
			gl.uniform3fv(uLoc_Kd, matl0.K_diff.slice(0,3));				// Kd	diffuse
			gl.uniform3fv(uLoc_Ks, matl0.K_spec.slice(0,3));				// Ks specular
			gl.uniform1i(uLoc_Kshiny, parseInt(matl0.K_shiny, 10));     // Kshiny
			break;
		case 1:
			gl.uniform3fv(uLoc_Ke, matl1.K_emit.slice(0,3));				// Ke emissive
			gl.uniform3fv(uLoc_Ka, matl1.K_ambi.slice(0,3));				// Ka ambient
			gl.uniform3fv(uLoc_Kd, matl1.K_diff.slice(0,3));				// Kd	diffuse
			gl.uniform3fv(uLoc_Ks, matl1.K_spec.slice(0,3));				// Ks specular
			gl.uniform1i(uLoc_Kshiny, parseInt(matl1.K_shiny, 10));     // Kshiny
			break;
		case 2:
			gl.uniform3fv(uLoc_Ke, matl2.K_emit.slice(0,3));				// Ke emissive
			gl.uniform3fv(uLoc_Ka, matl2.K_ambi.slice(0,3));				// Ka ambient
			gl.uniform3fv(uLoc_Kd, matl2.K_diff.slice(0,3));				// Kd	diffuse
			gl.uniform3fv(uLoc_Ks, matl2.K_spec.slice(0,3));				// Ks specular
			gl.uniform1i(uLoc_Kshiny, parseInt(matl2.K_shiny, 10));     // Kshiny
			break;
		case 3:
			gl.uniform3fv(uLoc_Ke, matl3.K_emit.slice(0,3));				// Ke emissive
			gl.uniform3fv(uLoc_Ka, matl3.K_ambi.slice(0,3));				// Ka ambient
			gl.uniform3fv(uLoc_Kd, matl3.K_diff.slice(0,3));				// Kd	diffuse
			gl.uniform3fv(uLoc_Ks, matl3.K_spec.slice(0,3));				// Ks specular
			gl.uniform1i(uLoc_Kshiny, parseInt(matl3.K_shiny, 10));     // Kshiny
			break;
		case 4:
		default:
			gl.uniform3fv(uLoc_Ke, matl4.K_emit.slice(0,3));				// Ke emissive
			gl.uniform3fv(uLoc_Ka, matl4.K_ambi.slice(0,3));				// Ka ambient
			gl.uniform3fv(uLoc_Kd, matl4.K_diff.slice(0,3));				// Kd	diffuse
			gl.uniform3fv(uLoc_Ks, matl4.K_spec.slice(0,3));				// Ks specular
			gl.uniform1i(uLoc_Kshiny, parseInt(matl4.K_shiny, 10));     // Kshiny
			break;
	}
}
function setGLMatrices(myGL){
	pushMatrix(mvpMatrix);
	mvpMatrix.multiply(modelMatrix);
	normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
	myGL.uniformMatrix4fv(uLoc_NormalMatrix, false, normalMatrix.elements);
	myGL.uniformMatrix4fv(uLoc_MvpMatrix, false, mvpMatrix.elements);
	myGL.uniformMatrix4fv(uLoc_ModelMatrix, false, modelMatrix.elements);
	mvpMatrix = popMatrix();
}
function makeDome() {
  // A parabolic dome
  var slices 			= 40;					// # of slices of the dome along the z axis. >=3 req'd
											  				// (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts	= 27;					// # of vertices around the top edge of the slice
											  				// (same number of vertices on bottom of slice, too)
  var sliceAngle 	= 2/(slices);	// lattitude angle spanned by one slice.

	// Create a (global) array to hold this dome's vertices:
  domeVerts = new Float32Array( ((slices * 2* sliceVerts) -2) * floatsPerVertex);

	// Create the dome starting from the slice at z=+1
	// s counts slices; v counts vertices;
	// j counts array elements (vertices * elements per vertex)
	var cos0		= 0.0;				// sines are the radius of a slice
	var sin0		= 0.0;        // cosines are the height of the slice (z-axis)
	var cos1		= 0.0;        // 0 represents the top edge
	var sin1		= 0.0;        // 1 represents the bottom edge
	var j				= 0;					// initialize our array index
	var isFirst = 1;
	for(s=0; s<slices; s++) {	// for each slice of the dome,
		if(s==0) {							// find sines & cosines for top and bottom of this slice
			isFirst = 1;					// skip 1st vertex of 1st slice.
			cos0 = 1.0;						// initialize: start at north pole.
			sin0 = 0.0;
		}	else {					      // otherwise, new top edge == old bottom edge
			isFirst = 0;
			cos0 = cos1;
			sin0 = sin1;
		}
		cos1 = (s+1)*sliceAngle;// & compute sine,cosine for new bottom edge.
		sin1 = Math.log10(s);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		for(v=isFirst; v< 2*sliceVerts; v++, j+=floatsPerVertex) {
			if(v%2==0) {        	// put even# vertices at the the slice's top edge
  					              	// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							            	// and thus we can simplify cos(2*PI(v/2*sliceVerts))
				domeVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts);
				domeVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);
				domeVerts[j+2] = cos0;
			} else { 	          	// put odd# vertices around the slice's lower edge;
							            	// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
							            	// theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
				domeVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
				domeVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
				domeVerts[j+2] = cos1;																				// z
			}
      domeVerts[j+3]=domeVerts[j];
      domeVerts[j+4]=domeVerts[j+1];
      domeVerts[j+5]=-2+domeVerts[j+2];
		}
	}
}
function makePyramid() {
	pyrVerts = new Float32Array([
		-1.0,-1.0, 0.0, 0.0, 0.0,-1.0,
		-1.0, 1.0, 0.0, 0.0, 0.0,-1.0,
		 1.0, 1.0, 0.0, 0.0, 0.0,-1.0,
	 	-1.0,-1.0, 0.0, 0.0, 0.0,-1.0,
	 	 1.0,-1.0, 0.0, 0.0, 0.0,-1.0,
	 	 1.0, 1.0, 0.0, 0.0, 0.0,-1.0,
	 	-1.0,-1.0, 0.0,-0.707, 0.0,-0.707,
	 	-1.0, 1.0, 0.0,-0.707, 0.0,-0.707,
	 	 0.0, 0.0,-1.0,-0.707, 0.0,-0.707,
	 	-1.0, 1.0, 0.0, 0.0, 0.707,-0.707,
	 	 1.0, 1.0, 0.0, 0.0, 0.707,-0.707,
	 	 0.0, 0.0,-1.0, 0.0, 0.707,-0.707,
	 	 1.0, 1.0, 0.0, 0.707, 0.0,-0.707,
	 	 1.0,-1.0, 0.0, 0.707, 0.0,-0.707,
	 	 0.0, 0.0,-1.0, 0.707, 0.0,-0.707,
	 	-1.0,-1.0, 0.0, 0.0,-0.707,-0.707,
	 	 1.0,-1.0, 0.0, 0.0,-0.707,-0.707,
	 	 0.0, 0.0,-1.0, 0.0,-0.707,-0.707
	]);
}
function makeCube() {
  cubeVerts = new Float32Array([
    //back face
    -1.0, 1.0,-1.0, 0.0, 1.0, 0.0,
    -1.0, 1.0, 1.0, 0.0, 1.0, 0.0,
     1.0, 1.0, 1.0, 0.0, 1.0, 0.0,
    -1.0, 1.0,-1.0, 0.0, 1.0, 0.0,
     1.0, 1.0,-1.0, 0.0, 1.0, 0.0,
     1.0, 1.0, 1.0, 0.0, 1.0, 0.0,
    //left face
    -1.0, 1.0, 1.0, -1.0, 0.0, 0.0,
    -1.0, 1.0,-1.0, -1.0, 0.0, 0.0,
    -1.0,-1.0,-1.0, -1.0, 0.0, 0.0,
    -1.0, 1.0, 1.0, -1.0, 0.0, 0.0,
    -1.0,-1.0, 1.0, -1.0, 0.0, 0.0,
    -1.0,-1.0,-1.0, -1.0, 0.0, 0.0,
    //front face
    -1.0,-1.0, 1.0, 0.0, -1.0, 0.0,
    -1.0,-1.0,-1.0, 0.0, -1.0, 0.0,
     1.0,-1.0,-1.0, 0.0, -1.0, 0.0,
    -1.0,-1.0, 1.0, 0.0, -1.0, 0.0,
     1.0,-1.0, 1.0, 0.0, -1.0, 0.0,
     1.0,-1.0,-1.0, 0.0, -1.0, 0.0,
    //right face
     1.0, 1.0, 1.0, 1.0, 0.0, 0.0,
     1.0, 1.0,-1.0, 1.0, 0.0, 0.0,
     1.0,-1.0,-1.0, 1.0, 0.0, 0.0,
     1.0, 1.0, 1.0, 1.0, 0.0, 0.0,
     1.0,-1.0, 1.0, 1.0, 0.0, 0.0,
     1.0,-1.0,-1.0, 1.0, 0.0, 0.0,
    //bottom face
    -1.0, 1.0,-1.0, 0.0, 0.0, -1.0,
     1.0, 1.0,-1.0, 0.0, 0.0, -1.0,
    -1.0,-1.0,-1.0, 0.0, 0.0, -1.0,
    -1.0,-1.0,-1.0, 0.0, 0.0, -1.0,
     1.0, 1.0,-1.0, 0.0, 0.0, -1.0,
     1.0,-1.0,-1.0, 0.0, 0.0, -1.0,
    //top face
    -1.0, 1.0, 1.0, 0.0, 0.0, 1.0,
     1.0, 1.0, 1.0, 0.0, 0.0, 1.0,
    -1.0,-1.0, 1.0, 0.0, 0.0, 1.0,
    -1.0,-1.0, 1.0, 0.0, 0.0, 1.0,
     1.0, 1.0, 1.0, 0.0, 0.0, 1.0,
     1.0,-1.0, 1.0, 0.0, 0.0, 1.0,
  ]);

}
function makeSphere() {
  //==============================================================================
  // Make a sphere from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like
  // equal-lattitude 'slices' of the sphere (bounded by planes of constant z),
  // and connect them as a 'stepped spiral' design (see makeCylinder) to build the
  // sphere from one triangle strip.
  var slices = 13;		// # of slices of the sphere along the z axis. >=3 req'd
											// (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts	= 27;	// # of vertices around the top edge of the slice
											// (same number of vertices on bottom of slice, too)
  var sliceAngle = Math.PI/slices;	// lattitude angle spanned by one slice.

	// Create a (global) array to hold this sphere's vertices:
  sphVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them.
										// each slice requires 2*sliceVerts vertices except 1st and
										// last ones, which require only 2*sliceVerts-1.

	// Create dome-shaped top slice of sphere at z=+1
	// s counts slices; v counts vertices;
	// j counts array elements (vertices * elements per vertex)
	var cos0 = 0.0;					  // sines,cosines of slice's top, bottom edge.
	var sin0 = 0.0;
	var cos1 = 0.0;
	var sin1 = 0.0;
	var j = 0;							  // initialize our array index
	var isLast = 0;
	var isFirst = 1;
	for(s=0; s<slices; s++) {	// for each slice of the sphere,
		// find sines & cosines for top and bottom of this slice
		if(s==0) {
			isFirst = 1;	        // skip 1st vertex of 1st slice.
			cos0 = 1.0; 	        // initialize: start at north pole.
			sin0 = 0.0;
		}	else {					      // otherwise, new top edge == old bottom edge
			isFirst = 0;
			cos0 = cos1;
			sin0 = sin1;
		}								        // & compute sine,cosine for new bottom edge.
		cos1 = Math.cos((s+1)*sliceAngle);
		sin1 = Math.sin((s+1)*sliceAngle);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		if(s==slices-1) isLast=1;	// skip last vertex of last slice.
		for(v=isFirst; v< 2*sliceVerts-isLast; v++, j+=floatsPerVertex) {
			if(v%2==0)
			{				// put even# vertices at the the slice's top edge
							// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							// and thus we can simplify cos(2*PI(v/2*sliceVerts))
				sphVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts);
				sphVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);
				sphVerts[j+2] = cos0;
			}
			else { 	// put odd# vertices around the slice's lower edge;
							// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
							// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
				sphVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
				sphVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
				sphVerts[j+2] = cos1;																				// z
			}
      sphVerts[j+3]=sphVerts[j];
			sphVerts[j+4]=sphVerts[j+1];
			sphVerts[j+5]=sphVerts[j+2];
		}
	}
}
function makeGroundGrid() {
  //==============================================================================
  // Create a list of vertices that create a large grid of lines in the x,y plane
  // centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

	var xcount = 100;			// # of lines to draw in x,y to make the grid.
	var ycount = 100;
	var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.

	// Create an (global) array to hold this ground-plane's vertices:
	gndVerts = new Float32Array(floatsPerVertex*2*(xcount+ycount));
						// draw a grid made of xcount+ycount lines; 2 vertices per line.

	var xgap = xymax/(xcount-1);		// HALF-spacing between lines in x,y;
	var ygap = xymax/(ycount-1);		// (why half? because v==(0line number/2))

	// First, step thru x values as we make vertical lines of constant-x:
	for(v=0, j=0; v<2*xcount; v++, j+= floatsPerVertex) {
		if(v%2==0) {	// put even-numbered vertices at (xnow, -xymax, 0)
			gndVerts[j  ] = -xymax + (v  )*xgap;	// x
			gndVerts[j+1] = -xymax;								// y
			gndVerts[j+2] = 0.0;									// z
		}
		else {				// put odd-numbered vertices at (xnow, +xymax, 0).
			gndVerts[j  ] = -xymax + (v-1)*xgap;	// x
			gndVerts[j+1] = xymax;								// y
			gndVerts[j+2] = 0.0;									// z
		}
    gndVerts[j+3] = 0.0;
    gndVerts[j+4] = 1.0;
    gndVerts[j+5] = 0.0;
	}
	// Second, step thru y values as wqe make horizontal lines of constant-y:
	// (don't re-initialize j--we're adding more vertices to the array)
	for(v=0; v<2*ycount; v++, j+= floatsPerVertex) {
		if(v%2==0) {		// put even-numbered vertices at (-xymax, ynow, 0)
			gndVerts[j  ] = -xymax;								// x
			gndVerts[j+1] = -xymax + (v  )*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
		}
		else {					// put odd-numbered vertices at (+xymax, ynow, 0).
			gndVerts[j  ] = xymax;								// x
			gndVerts[j+1] = -xymax + (v-1)*ygap;	// y
			gndVerts[j+2] = 0.0;									// z
		}
    gndVerts[j+3] = 0.0;
    gndVerts[j+4] = 0.0;
    gndVerts[j+5] = 1.0;
	}
}


// --------- Functions for drawing
function initVertexBuffers(gl) {
	makeGroundGrid();
	makeDome();
	makeCube();
	makeSphere();
	makePyramid();
	// How much space to store all the shapes in one array?
	// (no 'var' means this is a global variable)
	mySiz = gndVerts.length + domeVerts.length + cubeVerts.length +
					sphVerts.length + pyrVerts.length;

	// How many vertices total?
	var nn = mySiz / floatsPerVertex;

	// Copy all shapes into one big Float32 array:
	var vertices = new Float32Array(mySiz);
	// Copy them:  remember where to start for each shape:]
	gndStart = 0;						// next we'll store the ground-plane;
	for(i=0,j=0; j< gndVerts.length; i++, j++) {
		vertices[i] = gndVerts[j];
	}
	domeStart = i;						// next we'll store the dome;
	for(j=0; j< domeVerts.length; i++, j++) {
		vertices[i] = domeVerts[j];
	}
	cubeStart = i;						// next we'll store the cube;
	for(j=0; j< cubeVerts.length; i++, j++) {
		vertices[i] = cubeVerts[j];
	}
	sphereStart = i;						// next we'll store the sphere;
	for(j=0; j< sphVerts.length; i++, j++) {
		vertices[i] = sphVerts[j];
	}
	pyrStart = i;						// next we'll store the curve;
	for(j=0; j< pyrVerts.length; i++, j++) {
		vertices[i] = pyrVerts[j];
	}

	// Create a vertex buffer object (VBO)
	var vertexColorbuffer = gl.createBuffer();
	if (!vertexColorbuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}

	// Write vertex information to buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	var FSIZE = vertices.BYTES_PER_ELEMENT; // how many bytes per stored value?

	//Get graphics system's handle for our Vertex Shader's position-input variable:
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}
	// Use handle to specify how to retrieve position data from our VBO:
	gl.vertexAttribPointer(
			a_Position, 	// choose Vertex Shader attribute to fill with data
			3, 						// how many values? 1,2,3 or 4.  (we're using x,y,z)
			gl.FLOAT, 		// data type for each value: usually gl.FLOAT
			false, 				// did we supply fixed-point data AND it needs normalizing?
			FSIZE * 6, 	// Stride -- how many bytes used to store each vertex?
										// (x,y,z, nx,ny,nz) * bytes/value
			0);						// Offset -- now many bytes from START of buffer to the
										// value we will actually use?
	gl.enableVertexAttribArray(a_Position);
										// Enable assignment of vertex buffer object's position data

	// Get graphics system's handle for our Vertex Shader's normal-vec-input variable;
	var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
	if(a_Normal < 0) {
		console.log('Failed to get the storage location of a_Normal');
		return -1;
	}
	// Use handle to specify how to retrieve color data from our VBO:
	gl.vertexAttribPointer(
		a_Normal, 				// choose Vertex Shader attribute to fill with data
		3, 							// how many values? 1,2,3 or 4. (we're using x,y,z)
		gl.FLOAT, 			// data type for each value: usually gl.FLOAT
		false, 					// did we supply fixed-point data AND it needs normalizing?
		FSIZE * 6, 		// Stride -- how many bytes used to store each vertex?
										// (x,y,z, nx,ny,nz) * bytes/value
		FSIZE * 3);			// Offset -- how many bytes from START of buffer to the
										// value we will actually use?  Need to skip over x,y,z

	gl.enableVertexAttribArray(a_Normal);
										// Enable assignment of vertex buffer object's position data

	//--------------------------------DONE!
	// Unbind the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return mySiz/floatsPerVertex;	// return # of vertices
}
function drawResize(currentAngle) {
  //==============================================================================
  // Called when user re-sizes their browser window , because our HTML file
  // contains:  <body onload="main()" onresize="winResize()">

	var nuCanvas = document.getElementById('webgl');	// get current canvas
	var nuGL = getWebGLContext(nuCanvas);							// and context:
  //
	// //Report our current browser-window contents:
  //
	// console.log('nuCanvas width,height=', nuCanvas.width, nuCanvas.height);
  // console.log('Browser window: innerWidth,innerHeight=',
	// 															innerWidth, innerHeight);	// http://www.w3schools.com/jsref/obj_window.asp


	//Make canvas fill the top 3/4 of our browser window:
	nuCanvas.width = innerWidth;
	nuCanvas.height = innerHeight-200;
	// IMPORTANT!  Need a fresh drawing in the re-sized viewports.
	draw(nuGL, currentAngle);				// draw in all viewports.
}
function draw(gl, currentAngle) {

	//---------------For the light source(s):

  gl.uniform3fv(lamp0.u_pos,  lamp0.I_pos.elements.slice(0,3));
  //		 ('slice(0,3) member func returns elements 0,1,2 (x,y,z) )
  gl.uniform3fv(lamp0.u_ambi, lamp0.I_ambi.elements);		// ambient
  gl.uniform3fv(lamp0.u_diff, lamp0.I_diff.elements);		// diffuse
  gl.uniform3fv(lamp0.u_spec, lamp0.I_spec.elements);		// Specular

	gl.uniform3fv(lamp1.u_pos,  lamp1.I_pos.elements.slice(0,3));
	//		 ('slice(0,3) member func returns elements 0,1,2 (x,y,z) )
	gl.uniform3fv(lamp1.u_ambi, lamp1.I_ambi.elements);		// ambient
	gl.uniform3fv(lamp1.u_diff, lamp1.I_diff.elements);		// diffuse
	gl.uniform3fv(lamp1.u_spec, lamp1.I_spec.elements);		// Specular

	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  //----------------For the Matrices: find the model matrix:
  // Calculate the view projection matrix
  mvpMatrix.setPerspective(35,
                            gl.drawingBufferWidth/
                            gl.drawingBufferHeight,
                            1, 100);
  mvpMatrix.lookAt(eyePosWorld[0], eyePosWorld[1], eyePosWorld[2],  	// eye position
  								 lookPosWorld[0], lookPosWorld[1], lookPosWorld[2],	// look-at point (origin)
  								 Math.sin(roll_angle), 0, Math.cos(roll_angle)); // up (in world coords)
	modelMatrix.setTranslate(0,0,0);
  mvpMatrix.multiply(modelMatrix);
  // Calculate the matrix to transform the normal based on the model matrix
  // normalMatrix.setInverseOf(modelMatrix);
  // normalMatrix.transpose();

  // Send the new matrix values to their locations in the GPU:
  // gl.uniformMatrix4fv(uLoc_ModelMatrix, false, modelMatrix.elements);
  // gl.uniformMatrix4fv(uLoc_NormalMatrix, false, normalMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Draw the scene:
		drawMyScene(gl, currentAngle);
}
function drawMyScene(myGL, currentAngle) {

  pushMatrix(modelMatrix);
	pushMatrix(mvpMatrix);

	modelMatrix.translate(-2.0, 0.0, 0.6);
  pushMatrix(modelMatrix);
	pushMatrix(mvpMatrix);
  modelMatrix.translate(0.0,0.0,lampJump);
  drawPixarLamp(myGL, currentAngle, 0, 0);

	mvpMatrix = popMatrix();
	modelMatrix = popMatrix();
	modelMatrix.translate(2.0, 0.0, 0.0);
  pushMatrix(modelMatrix);
	pushMatrix(mvpMatrix);
  modelMatrix.translate(0.0,0.0,lampJump);
  drawPixarLamp(myGL, currentAngle, 1, 1);

	mvpMatrix = popMatrix();
	modelMatrix = popMatrix();
	modelMatrix.translate(2.0, 0.0, lampJump);
  drawPixarLamp(myGL, currentAngle, 2, 2);

	setMaterial(myGL, 4);
	mvpMatrix = popMatrix();
	modelMatrix = popMatrix();
	modelMatrix.scale(0.4, 0.4, 0.4);		// shrink the drawing axes
																			//for nicer-looking ground-plane, and
	setGLMatrices(myGL);
  // Now, using these drawing axes, draw our ground plane:
  myGL.drawArrays(myGL.LINES,							// use this drawing primitive, and
  							gndStart/floatsPerVertex,	// start at this vertex number, and
  							gndVerts.length/floatsPerVertex);		// draw this many vertices

}
function drawPixarLamp(myGL, currentAngle, baseColor, baseShape) {

	//Set material to base color
	setMaterial(myGL, baseColor);

  modelMatrix.translate(0.0,0.0,-0.54);

  //Draw base of lamp
  pushMatrix(modelMatrix);
  modelMatrix.rotate(180, 0, 1, 0);
  modelMatrix.scale(0.18,0.18,0.03);
	setGLMatrices(myGL);
	switch (baseShape) {
		case 0: myGL.drawArrays(myGL.TRIANGLE_STRIP,domeStart/floatsPerVertex,domeVerts.length/floatsPerVertex);
						break;
		case 1: modelMatrix.translate(0.0,0.0,0.8);
						setGLMatrices(myGL);
						myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
						break;
		case 2:
		default:modelMatrix.scale(1.0,1.0,2.0);
						modelMatrix.translate(0.0,0.0,1.0);
						setGLMatrices(myGL);
						myGL.drawArrays(myGL.TRIANGLES,pyrStart/floatsPerVertex,pyrVerts.length/floatsPerVertex);
						break;
	}

  //Draw first link (rigid link)
  modelMatrix = popMatrix();
  modelMatrix.rotate(20*currentAngle, 0, 0, 1);
  modelMatrix.scale(0.2,0.2,0.2);
  modelMatrix.rotate(-30, 0, 1, 0);
  pushMatrix(modelMatrix);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.0,0.0,0.45);
  modelMatrix.scale(0.1,0.05,0.55);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw second link (pivots from the end of first link) part 1 (V-shaped)
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,0.0,0.9);
  modelMatrix.rotate(60+40*Math.cos(currentAngle), 0, 1, 0);
  pushMatrix(modelMatrix);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.0,0.125,0.4);
  pushMatrix(modelMatrix);
  modelMatrix.scale(0.1,0.025,0.5);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,-0.25,0.0);
  modelMatrix.scale(0.1,0.025,0.5);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw second link part 2 (V-shaped)
  modelMatrix = popMatrix();
  modelMatrix.rotate(-40, 0, 1, 0);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.0,0.1,0.5);
  pushMatrix(modelMatrix);
  modelMatrix.scale(0.1,0.05,0.6);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,-0.2,0.0);
  modelMatrix.scale(0.1,0.05,0.6);
	setGLMatrices(myGL);
	myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw third link (pivots from end of second link part 2)
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,0.0,1.0)
  modelMatrix.rotate(40-20*Math.cos(currentAngle), 0, 1, 0);
  modelMatrix.translate(0.0,0.0,0.6);
  modelMatrix.scale(0.1,0.05,0.7);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw fourth link (pivots from end of second link part 1)
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,0.0,0.85)
  modelMatrix.rotate(-20*Math.cos(currentAngle), 0, 1, 0);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.0,0.0,0.6);
  modelMatrix.scale(0.1,0.05,0.7);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw fifth link (pivots from end of fourth link) part 1
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,0.0,1.2);
  modelMatrix.rotate(-55+18*Math.cos(currentAngle), 0, 1, 0);
  pushMatrix(modelMatrix);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.0,0.1,0.25);
  pushMatrix(modelMatrix);
  modelMatrix.scale(0.1,0.05,0.35);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,-0.2,0.0);
  modelMatrix.scale(0.1,0.05,0.35);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw fifth link part 2
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,0.0,0.5);
  modelMatrix.rotate(-95, 0, 1, 0);
  modelMatrix.translate(0.0,0.1,0.22);
  pushMatrix(modelMatrix);
  modelMatrix.scale(0.1,0.05,0.32);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,-0.2,0.0);
  modelMatrix.scale(0.1,0.05,0.32);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw sixth link (pivots from end of fifth link part 1)
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,0.0,0.5);
  modelMatrix.rotate(50, 0, 1, 0);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.0,0.0,0.2);
  modelMatrix.scale(0.05,0.05,0.2);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw lamp head and bulb
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,0.0,0.75);
  modelMatrix.rotate(90, 0, 1, 0);
  modelMatrix.translate(0.0,0.0,-0.4);
  modelMatrix.rotate(30*Math.sin(currentAngle), 1, 0, 0);
  pushMatrix(modelMatrix);
  modelMatrix.scale(0.5,0.5,0.7);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,domeStart/floatsPerVertex,domeVerts.length/floatsPerVertex);
  modelMatrix = popMatrix();

	//Set material to dull gold
	setMaterial(myGL, 3);
  modelMatrix.translate(0.0,0.0,1.0);
  modelMatrix.scale(0.5,0.5,0.5);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,sphereStart/floatsPerVertex,sphVerts.length/floatsPerVertex);

	//Set material to dull silver
	setMaterial(myGL, baseColor);

  //Draw seventh link (pivots from base)
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,0.0,0.15);
  modelMatrix.rotate(68+50*Math.cos(currentAngle), 0, 1, 0);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.0,0.1,0.3);
  pushMatrix(modelMatrix);
  modelMatrix.scale(0.1,0.05,0.4);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,-0.2,0.0);
  modelMatrix.scale(0.1,0.05,0.4);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw eighth link (pivots from end of seventh link)
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,0.0,0.6);
  modelMatrix.rotate(-55-42*Math.cos(currentAngle), 0, 1, 0);
  modelMatrix.translate(0.0,0.0,0.35);
  pushMatrix(modelMatrix);
  modelMatrix.scale(0.1,0.05,0.45);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,0.05,0.3);
  pushMatrix(modelMatrix);
  modelMatrix.scale(0.1,0.025,0.45);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  modelMatrix = popMatrix();
  modelMatrix.translate(0.0,-0.1,0.0);
  modelMatrix.scale(0.1,0.025,0.45);
	setGLMatrices(myGL);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

}


// --------- Event handlers/animations
function keydown(key, currentAngle) {
  var vel = 0.1;
  var x_dir = ( lookPosWorld[0] - eyePosWorld[0] ) * vel;
  var y_dir = ( lookPosWorld[1] - eyePosWorld[1] ) * vel;
  var z_dir = ( lookPosWorld[2] - eyePosWorld[2] ) * vel;

  // w and s keys are pitch, a and d keys are yaw, z and x keys are roll
  if (key == 87) { 																	// The w key was pressed
    ver_angle += 2;
    lookPosWorld[1] = eyePosWorld[1] + Math.cos(hor_angle/180*Math.PI) + Math.cos(ver_angle/180*Math.PI);
    lookPosWorld[2] = eyePosWorld[2] + Math.sin(ver_angle/180*Math.PI);
  } else if (key == 83) {														// The s key was pressed
    ver_angle -= 2;
    lookPosWorld[1] = eyePosWorld[1] + Math.cos(hor_angle/180*Math.PI) + Math.cos(ver_angle/180*Math.PI);
    lookPosWorld[2] = eyePosWorld[2] + Math.sin(ver_angle/180*Math.PI);
  } else if(key == 68) { 														// The d key was pressed
    hor_angle += 2;
		lookPosWorld[0] = eyePosWorld[0] + Math.sin(hor_angle/180*Math.PI);
    lookPosWorld[1] = eyePosWorld[1] + Math.cos(hor_angle/180*Math.PI) + Math.cos(ver_angle/180*Math.PI);
  } else if (key == 65) { 													// The a key was pressed
    hor_angle -= 2;
		lookPosWorld[0] = eyePosWorld[0] + Math.sin(hor_angle/180*Math.PI);
    lookPosWorld[1] = eyePosWorld[1] + Math.cos(hor_angle/180*Math.PI) + Math.cos(ver_angle/180*Math.PI);
  } else if (key == 90) { 													// The z key was pressed
    roll_angle += Math.PI/90;
  } else if (key == 88) {														// The w key was pressed
    roll_angle -= Math.PI/90;
  } else
  // up and down arrow keys move forward and backwards, left and right arrow keys move sideways
  if (key == 38) { 													 // The up arrow key was pressed
		eyePosWorld[0] += x_dir;
    eyePosWorld[1] += y_dir;
    eyePosWorld[2] += z_dir;
    lookPosWorld[0] += x_dir;
    lookPosWorld[1] += y_dir;
    lookPosWorld[2] += z_dir;
  } else if (key == 40) {									 // The down arrow key was pressed
		eyePosWorld[0] -= x_dir;
    eyePosWorld[1] -= y_dir;
    eyePosWorld[2] -= z_dir;
    lookPosWorld[0] -= x_dir;
    lookPosWorld[1] -= y_dir;
    lookPosWorld[2] -= z_dir;
  } else if (key == 37) { 								 // The left arrow key was pressed
		eyePosWorld[0] -= y_dir;
    eyePosWorld[1] += x_dir;
    lookPosWorld[0] -= y_dir;
    lookPosWorld[1] += x_dir;
  } else if (key == 39) {									// The right arrow key was pressed
		eyePosWorld[0] += y_dir;
    eyePosWorld[1] -= x_dir;
    lookPosWorld[0] += y_dir;
    lookPosWorld[1] -= x_dir;
  } else if (key == 82) {													  // The r key was pressed
		resetPosition();
  } else if (key == 32) {												 // The spacebar was pressed
    lampJumpSet = true;
  } else if (key == 70) {														// The f key was pressed
    runStopFunction();
  } else if (key == 67) { 													// The c key was pressed
    cruiseSetFunction();
  } else return;          								// Prevent the unnecessary drawing
  	drawResize(currentAngle);
}
function animate(angle) {
  var now = Date.now();
  elapsed = now - g_last;
  g_last = now;
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}
function resetPosition() {
  hor_angle = 0;
  ver_angle = 0;
  roll_angle = 0;
	eyePosWorld.set([0.0, -6.0, 1.0]);
	lookPosWorld.set([Math.sin(hor_angle/180*Math.PI),
										Math.cos(hor_angle/180*Math.PI) - 6.0,
										1.0]);
  return;
}
function lampJumpFunction() {
  if (lampJump<0.0) {
    lampJumpSet=false;
    lampJump=0.0;
    JUMP_STEP=0.09;
  } else {
    lampJump+=JUMP_STEP;
    JUMP_STEP-=0.005;
  }
  return;
}
function runStopFunction() {
  if (runStop) {
    runStop=false;
		document.getElementById('runStop').classList.add('red');
	} else {
    runStop=true;
    g_last = Date.now();
		document.getElementById('runStop').classList.remove('red');
  }
  return;
}
function toggleLight(lightName) {
	if (lightName=='toggleWL') var lightNumber = 0;
	else var lightNumber = 1;
	if (toggles[lightNumber]) {
		toggles[lightNumber] = false;
		document.getElementById(lightName).classList.remove('green');
		document.getElementById(lightName).classList.add('red');
	}	else {
		toggles[lightNumber] = true;
		document.getElementById(lightName).classList.remove('red');
		document.getElementById(lightName).classList.add('green');
	}
}
function cruiseSetFunction() {
  if (cruiseSet) cruiseSet=false;
  else cruiseSet=true;
}
function moveWorldLight(myAxis, myDir) {
	var moveLightStep = 0.5;
	if (myDir == 'up')
		lightPosWorld[myAxis] += moveLightStep;
	else
		lightPosWorld[myAxis] -= moveLightStep;
}
function setLights() {
	lightAmbWorld.set([document.getElementById('aR').value,
										 document.getElementById('aG').value,
									 	 document.getElementById('aB').value]);
	lightDifWorld.set([document.getElementById('dR').value,
							 			 document.getElementById('dG').value,
							 			 document.getElementById('dB').value]);
	lightAmbWorld.set([document.getElementById('sR').value,
	                   document.getElementById('sG').value,
							 			 document.getElementById('sB').value]);
  lamp0.I_pos.elements.set(lightPosWorld);
	lamp1.I_pos.elements.set(eyePosWorld);
	if (toggles[0]) {
	 	lamp0.I_ambi.elements.set(lightAmbWorld);
	 	lamp0.I_diff.elements.set(lightDifWorld);
	 	lamp0.I_spec.elements.set(lightSpeWorld);
	}	else {
	 	lamp0.I_ambi.elements.set(lightsOff);
	 	lamp0.I_diff.elements.set(lightsOff);
	 	lamp0.I_spec.elements.set(lightsOff);
	}
	if (toggles[1]) {
		lamp1.I_ambi.elements.set([0.4,0.4,0.4]);
		lamp1.I_diff.elements.set([1.0,1.0,1.0]);
		lamp1.I_spec.elements.set([1.0,1.0,1.0]);
	}	else {
		lamp1.I_ambi.elements.set(lightsOff);
		lamp1.I_diff.elements.set(lightsOff);
		lamp1.I_spec.elements.set(lightsOff);
	}
}
function setShading(type) {
	shaderChoice = type;
	gl.uniform1i(u_shaderChoice, shaderChoice);
	if (shaderChoice==0) {
		document.getElementById('PS').classList.add('green');
		document.getElementById('GS').classList.remove('green');
	} else {
		document.getElementById('GS').classList.add('green');
		document.getElementById('PS').classList.remove('green');
	}
}
function setLighting(type) {
	lightingChoice = type;
	gl.uniform1i(u_lightingChoice, lightingChoice);
	if (lightingChoice==0) {
		document.getElementById('BL').classList.add('green');
		document.getElementById('PL').classList.remove('green');
	} else {
		document.getElementById('PL').classList.add('green');
		document.getElementById('BL').classList.remove('green');
	}
}
