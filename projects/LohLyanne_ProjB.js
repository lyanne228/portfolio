// Lyanne Loh Xiao Ru
// LXL9625
// Introduction to Computer Graphics
// Project B: PIXAR

// Vertex shader program
var VSHADER_SOURCE =
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec3 a_Color;\n' +
  'attribute vec3 a_Normal;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  'vec4 transVec = u_NormalMatrix * vec4(a_Normal, 0.0);\n' +
  'vec3 normVec = normalize(transVec.xyz);\n' +
  'vec3 lightVec = vec3(0.0, 1.0, -1.0);\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Color = vec4(0.6*a_Color + 0.4*dot(normVec,lightVec), 1.0);\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

var floatsPerVertex = 9;	// # of Float32Array elements used for each vertex

var u_MvpMatrix;                  // Uniform model view projection matrix
var u_NormalMatrix;               // Uniform normal matrix
var normalMatrix = new Matrix4(); // Normal matrix
  // (holds inverse-transpose of 'model' matrix.  Transform vertex positions
  // in VBO by 'model' matrix to convert to 'world' coordinates, and
  // transform surface normal vectors by 'normal' matrix to convert to 'world').
var modelMatrix = new Matrix4();  // Model matrix
modelMatrix.setTranslate(0,0,0);
var viewMatrix = new Matrix4();   // View matrix
var projMatrix = new Matrix4();   // Projection matrix
var mvpMatrix = new Matrix4();    // Model view projection matrix

var lampColor = new Float32Array([0.9,0.9,0.9]);
var letterColorBottomFront = new Float32Array([0.4,0.4,0.8]); // Darker blue
var letterColorTopFront = new Float32Array([0.8,0.8,1.0]);    // Lighter blue
var letterColorBottomBack = new Float32Array([0.4,0.8,0.4]);  // Darker green
var letterColorTopBack = new Float32Array([0.8,1.0,0.8]);     // Lighter green

var ANGLE_STEP = 5.0;     // Angle step for rotation of lamp
var JUMP_STEP = 0.09;     // Jump step for lamp jump
var lampJump = 0.0;       // Origin height of jump
var lampJumpSet = false;
var runStop = true;
var cruiseSet = false;

function main() {
  //============================================================================
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex coordinates, colors and normals
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to specify the vertex information');
    return;
  }

  // Set clear color and enable hidden surface removal
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage location of u_MvpMatrix
  u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) {
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }

  // Get the storage location for u_NormalMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if(!u_NormalMatrix) {
  	console.log('Failed to get GPU storage location for u_NormalMatrix');
  	return
  }

  // Create, init current rotation angle value in JavaScript
  var currentAngle = 0.0;
  drawResize(currentAngle);
  drawResize(currentAngle);

  // Register the event handler to be called on key press
  document.onkeydown= function(ev, currentAngle){keydown(ev.keyCode, currentAngle); };

  //-----------------
  // Start drawing: create 'tick' variable whose value is this function:
  var tick = function() {
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

function makeDome() {
  // A parabolic dome
  var slices = 40;		  // # of slices of the dome along the z axis. >=3 req'd
											  // (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts	= 27;	// # of vertices around the top edge of the slice
											  // (same number of vertices on bottom of slice, too)
  var sliceAngle = 2/(slices);	// lattitude angle spanned by one slice.

	// Create a (global) array to hold this dome's vertices:
  domeVerts = new Float32Array( ((slices * 2* sliceVerts) -2) * floatsPerVertex);
		// # of vertices * # of elements needed to store them.
		// each slice requires 2*sliceVerts vertices except 1st and
		// last ones, which require only 2*sliceVerts-1.

	// Create the dome starting from the slice at z=+1
	// s counts slices; v counts vertices;
	// j counts array elements (vertices * elements per vertex)
	var cos0 = 0.0;					// sines are the radius of a slice
	var sin0 = 0.0;         // cosines are the height of the slice (z-axis)
	var cos1 = 0.0;         // 0 represents the top edge
	var sin1 = 0.0;         // 1 represents the bottom edge
	var j = 0;							// initialize our array index
	var isFirst = 1;
	for(s=0; s<slices; s++) {	// for each slice of the dome,
		// find sines & cosines for top and bottom of this slice
		if(s==0) {
			isFirst = 1;	      // skip 1st vertex of 1st slice.
			cos0 = 1.0; 	      // initialize: start at north pole.
			sin0 = 0.0;
		}
		else {					      // otherwise, new top edge == old bottom edge
			isFirst = 0;
			cos0 = cos1;
			sin0 = sin1;
		}								      // & compute sine,cosine for new bottom edge.
		cos1 = (s+1)*sliceAngle;
		sin1 = Math.log10(s);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		for(v=isFirst; v< 2*sliceVerts; v++, j+=floatsPerVertex) {
			if(v%2==0) {        // put even# vertices at the the slice's top edge
  					              // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							            // and thus we can simplify cos(2*PI(v/2*sliceVerts))
				domeVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts);
				domeVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);
				domeVerts[j+2] = cos0;
			} else { 	          // put odd# vertices around the slice's lower edge;
							            // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
							            // theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
				domeVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
				domeVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
				domeVerts[j+2] = cos1;																				// z
			}
			domeVerts[j+3]=lampColor[0];
			domeVerts[j+4]=lampColor[1];
			domeVerts[j+5]=lampColor[2];
      domeVerts[j+6]=domeVerts[j];
      domeVerts[j+7]=domeVerts[j+1];
      domeVerts[j+8]=-1+domeVerts[j+2];
		}
	}
}

function makeCube(cubeColrTopFront, cubeColrBottomFront, cubeColrTopBack, cubeColrBottomBack) {
  cubeVerts = new Float32Array([
    //back face
    -1.0, 1.0,-1.0, cubeColrBottomBack[0], cubeColrBottomBack[1], cubeColrBottomBack[2], 0.0, 1.0, 0.0,
    -1.0, 1.0, 1.0, cubeColrTopBack[0], cubeColrTopBack[1], cubeColrTopBack[2], 0.0, 1.0, 0.0,
     1.0, 1.0, 1.0, cubeColrTopBack[0], cubeColrTopBack[1], cubeColrTopBack[2], 0.0, 1.0, 0.0,
    -1.0, 1.0,-1.0, cubeColrBottomBack[0], cubeColrBottomBack[1], cubeColrBottomBack[2], 0.0, 1.0, 0.0,
     1.0, 1.0,-1.0, cubeColrBottomBack[0], cubeColrBottomBack[1], cubeColrBottomBack[2], 0.0, 1.0, 0.0,
     1.0, 1.0, 1.0, cubeColrTopBack[0], cubeColrTopBack[1], cubeColrTopBack[2], 0.0, 1.0, 0.0,
    //left face
    -1.0, 1.0, 1.0, cubeColrTopBack[0], cubeColrTopBack[1], cubeColrTopBack[2], -1.0, 0.0, 0.0,
    -1.0, 1.0,-1.0, cubeColrBottomBack[0], cubeColrBottomBack[1], cubeColrBottomBack[2], -1.0, 0.0, 0.0,
    -1.0,-1.0,-1.0, cubeColrBottomFront[0], cubeColrBottomFront[1], cubeColrBottomFront[2], -1.0, 0.0, 0.0,
    -1.0, 1.0, 1.0, cubeColrTopBack[0], cubeColrTopBack[1], cubeColrTopBack[2], -1.0, 0.0, 0.0,
    -1.0,-1.0, 1.0, cubeColrTopFront[0], cubeColrTopFront[1], cubeColrTopFront[2], -1.0, 0.0, 0.0,
    -1.0,-1.0,-1.0, cubeColrBottomFront[0], cubeColrBottomFront[1], cubeColrBottomFront[2], -1.0, 0.0, 0.0,
    //front face
    -1.0,-1.0, 1.0, cubeColrTopFront[0], cubeColrTopFront[1], cubeColrTopFront[2], 0.0, -1.0, 0.0,
    -1.0,-1.0,-1.0, cubeColrBottomFront[0], cubeColrBottomFront[1], cubeColrBottomFront[2], 0.0, -1.0, 0.0,
     1.0,-1.0,-1.0, cubeColrBottomFront[0], cubeColrBottomFront[1], cubeColrBottomFront[2], 0.0, -1.0, 0.0,
    -1.0,-1.0, 1.0, cubeColrTopFront[0], cubeColrTopFront[1], cubeColrTopFront[2], 0.0, -1.0, 0.0,
     1.0,-1.0, 1.0, cubeColrTopFront[0], cubeColrTopFront[1], cubeColrTopFront[2], 0.0, -1.0, 0.0,
     1.0,-1.0,-1.0, cubeColrBottomFront[0], cubeColrBottomFront[1], cubeColrBottomFront[2], 0.0, -1.0, 0.0,
    //right face
     1.0, 1.0, 1.0, cubeColrTopBack[0], cubeColrTopBack[1], cubeColrTopBack[2], 1.0, 0.0, 0.0,
     1.0, 1.0,-1.0, cubeColrBottomBack[0], cubeColrBottomBack[1], cubeColrBottomBack[2], 1.0, 0.0, 0.0,
     1.0,-1.0,-1.0, cubeColrBottomFront[0], cubeColrBottomFront[1], cubeColrBottomFront[2], 1.0, 0.0, 0.0,
     1.0, 1.0, 1.0, cubeColrTopBack[0], cubeColrTopBack[1], cubeColrTopBack[2], 1.0, 0.0, 0.0,
     1.0,-1.0, 1.0, cubeColrTopFront[0], cubeColrTopFront[1], cubeColrTopFront[2], 1.0, 0.0, 0.0,
     1.0,-1.0,-1.0, cubeColrBottomFront[0], cubeColrBottomFront[1], cubeColrBottomFront[2], 1.0, 0.0, 0.0,
    //bottom face
    -1.0, 1.0,-1.0, cubeColrBottomBack[0], cubeColrBottomBack[1], cubeColrBottomBack[2], 0.0, 0.0, -1.0,
     1.0, 1.0,-1.0, cubeColrBottomBack[0], cubeColrBottomBack[1], cubeColrBottomBack[2], 0.0, 0.0, -1.0,
    -1.0,-1.0,-1.0, cubeColrBottomFront[0], cubeColrBottomFront[1], cubeColrBottomFront[2], 0.0, 0.0, -1.0,
    -1.0,-1.0,-1.0, cubeColrBottomFront[0], cubeColrBottomFront[1], cubeColrBottomFront[2], 0.0, 0.0, -1.0,
     1.0, 1.0,-1.0, cubeColrBottomBack[0], cubeColrBottomBack[1], cubeColrBottomBack[2], 0.0, 0.0, -1.0,
     1.0,-1.0,-1.0, cubeColrBottomFront[0], cubeColrBottomFront[1], cubeColrBottomFront[2], 0.0, 0.0, -1.0,
    //top face
    -1.0, 1.0, 1.0, cubeColrTopBack[0], cubeColrTopBack[1], cubeColrTopBack[2], 0.0, 0.0, 1.0,
     1.0, 1.0, 1.0, cubeColrTopBack[0], cubeColrTopBack[1], cubeColrTopBack[2], 0.0, 0.0, 1.0,
    -1.0,-1.0, 1.0, cubeColrTopFront[0], cubeColrTopFront[1], cubeColrTopFront[2], 0.0, 0.0, 1.0,
    -1.0,-1.0, 1.0, cubeColrTopFront[0], cubeColrTopFront[1], cubeColrTopFront[2], 0.0, 0.0, 1.0,
     1.0, 1.0, 1.0, cubeColrTopBack[0], cubeColrTopBack[1], cubeColrTopBack[2], 0.0, 0.0, 1.0,
     1.0,-1.0, 1.0, cubeColrTopFront[0], cubeColrTopFront[1], cubeColrTopFront[2], 0.0, 0.0, 1.0,
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
  var bulbColr = new Float32Array([0.8, 0.8, 0.5]);	// pale yellow
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
      sphVerts[j+3]=bulbColr[0];
			sphVerts[j+4]=bulbColr[1];
			sphVerts[j+5]=bulbColr[2];
      sphVerts[j+6]=sphVerts[j];
			sphVerts[j+7]=sphVerts[j+1];
			sphVerts[j+8]=sphVerts[j+2];
		}
	}
}

function makeCurve() {
  //makes a curve that could fit in a P or R
  var radialVerts = 20;
  var wedgeAngle = Math.PI/(radialVerts-1);
  var outerRadius = 1.0;
  var innerRadius = 0.5;
  curveVerts = new Float32Array((radialVerts*8-1)*floatsPerVertex);

  var cosi, sini;
  var j = 0;
  //Create front C surface:
  for (;j<radialVerts;j++) {
    //Update angles
    cosi = Math.cos(wedgeAngle*j);
    sini = Math.sin(wedgeAngle*j);
    //Draw outer vertex
    curveVerts[18*j+0] = sini*outerRadius;
    curveVerts[18*j+1] = 1.0;
    curveVerts[18*j+2] = cosi*outerRadius;
    curveVerts[18*j+3] = letterColorTopBack[0]*(0.7+0.3*outerRadius*cosi)+letterColorBottomBack[0]*(0.3*(1-outerRadius*cosi));
    curveVerts[18*j+4] = letterColorTopBack[1]*(0.7+0.3*outerRadius*cosi)+letterColorBottomBack[1]*(0.3*(1-outerRadius*cosi));
    curveVerts[18*j+5] = letterColorTopBack[2]*(0.7+0.3*outerRadius*cosi)+letterColorBottomBack[2]*(0.3*(1-outerRadius*cosi));
    curveVerts[18*j+6] = 0.0;
    curveVerts[18*j+7] = 1.0;
    curveVerts[18*j+8] = 0.0;
    //Draw inner vertex
    curveVerts[18*j+9] = sini*innerRadius;
    curveVerts[18*j+10] = 1.0;
    curveVerts[18*j+11] = cosi*innerRadius;
    curveVerts[18*j+12] = letterColorTopBack[0]*(0.7+0.3*innerRadius*cosi)+letterColorBottomBack[0]*(0.3*(1-innerRadius*cosi));
    curveVerts[18*j+13] = letterColorTopBack[1]*(0.7+0.3*innerRadius*cosi)+letterColorBottomBack[1]*(0.3*(1-innerRadius*cosi));
    curveVerts[18*j+14] = letterColorTopBack[2]*(0.7+0.3*innerRadius*cosi)+letterColorBottomBack[2]*(0.3*(1-innerRadius*cosi));
    curveVerts[18*j+15] = 0.0;
    curveVerts[18*j+16] = 1.0;
    curveVerts[18*j+17] = 0.0;
  }
  //Create inner curved surface:
  for (i=1;j<2*radialVerts-1;i++,j++) {
    //Draw back vertex
    curveVerts[18*j+0] = sini*innerRadius;
    curveVerts[18*j+1] = -1.0;
    curveVerts[18*j+2] = cosi*innerRadius;
    curveVerts[18*j+3] = letterColorTopFront[0]*(0.7+0.3*innerRadius*cosi)+letterColorBottomFront[0]*(0.3*(1-innerRadius*cosi));
    curveVerts[18*j+4] = letterColorTopFront[1]*(0.7+0.3*innerRadius*cosi)+letterColorBottomFront[1]*(0.3*(1-innerRadius*cosi));
    curveVerts[18*j+5] = letterColorTopFront[2]*(0.7+0.3*innerRadius*cosi)+letterColorBottomFront[2]*(0.3*(1-innerRadius*cosi));
    curveVerts[18*j+6] = curveVerts[18*j+0];
    curveVerts[18*j+7] = curveVerts[18*j+1];
    curveVerts[18*j+8] = curveVerts[18*j+2];
    //Update angles
    cosi = -Math.cos(wedgeAngle*i);
    sini = Math.sin(wedgeAngle*i);
    //Draw front vertex
    curveVerts[18*j+9] = sini*innerRadius;
    curveVerts[18*j+10] = 1.0;
    curveVerts[18*j+11] = cosi*innerRadius;
    curveVerts[18*j+12] = letterColorTopBack[0]*(0.7+0.3*innerRadius*cosi)+letterColorBottomBack[0]*(0.3*(1-innerRadius*cosi));
    curveVerts[18*j+13] = letterColorTopBack[1]*(0.7+0.3*innerRadius*cosi)+letterColorBottomBack[1]*(0.3*(1-innerRadius*cosi));
    curveVerts[18*j+14] = letterColorTopBack[2]*(0.7+0.3*innerRadius*cosi)+letterColorBottomBack[2]*(0.3*(1-innerRadius*cosi));
    curveVerts[18*j+15] = curveVerts[18*j+9];
    curveVerts[18*j+16] = curveVerts[18*j+10];
    curveVerts[18*j+17] = curveVerts[18*j+11];
  }
  //Create back C surface:
  for (i=0;j<3*radialVerts-1;j++, i++) {
    //Update angles
    cosi = Math.cos(wedgeAngle*i);
    sini = Math.sin(wedgeAngle*i);
    //Draw outer vertex
    curveVerts[18*j+0] = sini*outerRadius;
    curveVerts[18*j+1] = -1.0;
    curveVerts[18*j+2] = cosi*outerRadius;
    curveVerts[18*j+3] = letterColorTopFront[0]*(0.7+0.3*outerRadius*cosi)+letterColorBottomFront[0]*(0.3*(1-outerRadius*cosi));
    curveVerts[18*j+4] = letterColorTopFront[1]*(0.7+0.3*outerRadius*cosi)+letterColorBottomFront[1]*(0.3*(1-outerRadius*cosi));
    curveVerts[18*j+5] = letterColorTopFront[2]*(0.7+0.3*outerRadius*cosi)+letterColorBottomFront[2]*(0.3*(1-outerRadius*cosi));
    curveVerts[18*j+6] = 0.0;
    curveVerts[18*j+7] = -1.0;
    curveVerts[18*j+8] = 0.0;
    //Draw inner vertex
    curveVerts[18*j+9] = sini*innerRadius;
    curveVerts[18*j+10] = -1.0;
    curveVerts[18*j+11] = cosi*innerRadius;
    curveVerts[18*j+12] = letterColorTopFront[0]*(0.7+0.3*innerRadius*cosi)+letterColorBottomFront[0]*(0.3*(1-innerRadius*cosi));
    curveVerts[18*j+13] = letterColorTopFront[1]*(0.7+0.3*innerRadius*cosi)+letterColorBottomFront[1]*(0.3*(1-innerRadius*cosi));
    curveVerts[18*j+14] = letterColorTopFront[2]*(0.7+0.3*innerRadius*cosi)+letterColorBottomFront[2]*(0.3*(1-innerRadius*cosi));
    curveVerts[18*j+15] = 0.0;
    curveVerts[18*j+16] = -1.0;
    curveVerts[18*j+17] = 0.0;
  }
  //Create outer curved surface:
  for (i=0;j<4*radialVerts-1;i++,j++) {
    //Update angles
    cosi = -Math.cos(wedgeAngle*i);
    sini = Math.sin(wedgeAngle*i);
    //Draw back vertex
    curveVerts[18*j+0] = sini*outerRadius;
    curveVerts[18*j+1] = 1.0;
    curveVerts[18*j+2] = cosi*outerRadius;
    curveVerts[18*j+3] = letterColorTopBack[0]*(0.7+0.3*outerRadius*cosi)+letterColorBottomBack[0]*(0.3*(1-outerRadius*cosi));
    curveVerts[18*j+4] = letterColorTopBack[1]*(0.7+0.3*outerRadius*cosi)+letterColorBottomBack[1]*(0.3*(1-outerRadius*cosi));
    curveVerts[18*j+5] = letterColorTopBack[2]*(0.7+0.3*outerRadius*cosi)+letterColorBottomBack[2]*(0.3*(1-outerRadius*cosi));
    curveVerts[18*j+6] = curveVerts[18*j+0];
    curveVerts[18*j+7] = curveVerts[18*j+1];
    curveVerts[18*j+8] = curveVerts[18*j+2];
    //Draw front vertex
    curveVerts[18*j+9] = sini*outerRadius;
    curveVerts[18*j+10] = -1.0;
    curveVerts[18*j+11] = cosi*outerRadius;
    curveVerts[18*j+12] = letterColorTopFront[0]*(0.7+0.3*outerRadius*cosi)+letterColorBottomFront[0]*(0.3*(1-outerRadius*cosi));
    curveVerts[18*j+13] = letterColorTopFront[1]*(0.7+0.3*outerRadius*cosi)+letterColorBottomFront[1]*(0.3*(1-outerRadius*cosi));
    curveVerts[18*j+14] = letterColorTopFront[2]*(0.7+0.3*outerRadius*cosi)+letterColorBottomFront[2]*(0.3*(1-outerRadius*cosi));
    curveVerts[18*j+15] = curveVerts[18*j+9];
    curveVerts[18*j+16] = curveVerts[18*j+10];
    curveVerts[18*j+17] = curveVerts[18*j+11];
  }
  curveVerts[18*j+0] = 0.0;
  curveVerts[18*j+1] = 1.0;
  curveVerts[18*j+2] = innerRadius;
  curveVerts[18*j+3] = letterColorTopFront[0]*(0.7+0.3*innerRadius*cosi)+letterColorBottomFront[0]*(0.3*(1-innerRadius*cosi));
  curveVerts[18*j+4] = letterColorTopFront[1]*(0.7+0.3*innerRadius*cosi)+letterColorBottomFront[1]*(0.3*(1-innerRadius*cosi));
  curveVerts[18*j+5] = letterColorTopFront[2]*(0.7+0.3*innerRadius*cosi)+letterColorBottomFront[2]*(0.3*(1-innerRadius*cosi));
  curveVerts[18*j+6] = curveVerts[18*j+0];
  curveVerts[18*j+7] = curveVerts[18*j+1];
  curveVerts[18*j+8] = curveVerts[18*j+2];

}

function makeGroundGrid() {
  //==============================================================================
  // Create a list of vertices that create a large grid of lines in the x,y plane
  // centered at x=y=z=0.  Draw this shape using the GL_LINES primitive.

	var xcount = 100;			// # of lines to draw in x,y to make the grid.
	var ycount = 100;
	var xymax	= 50.0;			// grid size; extends to cover +/-xymax in x and y.
 	var xColr = new Float32Array([0.2, 0.2, 0.2]);	// dark gray
 	var yColr = new Float32Array([0.3, 0.3, 0.3]);	// lighter gray

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
		gndVerts[j+3] = xColr[0];			// red
		gndVerts[j+4] = xColr[1];			// grn
		gndVerts[j+5] = xColr[2];			// blu
    gndVerts[j+6] = 0.0;
    gndVerts[j+7] = 1.0;
    gndVerts[j+8] = 0.0;
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
		gndVerts[j+3] = yColr[0];			// red
		gndVerts[j+4] = yColr[1];			// grn
		gndVerts[j+5] = yColr[2];			// blu
    gndVerts[j+6] = 0.0;
    gndVerts[j+7] = 0.0;
    gndVerts[j+8] = 1.0;
	}
}

function initVertexBuffers(gl) {
  //==============================================================================

  // Make our 'ground plane'; can you make a'torus' shape too?
  // (recall the 'basic shapes' starter code...)
  makeGroundGrid();
  makeDome();
  makeCube(lampColor, lampColor, lampColor, lampColor);
  makeSphere();
  makeCurve();


  // Drawing Axes: Draw them using gl.LINES drawing primitive;
  // +x axis RED; +y axis GREEN; +z axis BLUE; origin: GRAY
  axesVerts = new Float32Array([
  0.0,  0.0,  0.0,	1.0,  0.0,  0.0,  0.0, 1.0, 0.0,  // X axis line (origin: lighter red)
  1.3,  0.0,  0.0,	1.0,  0.2,  0.2,	0.0, 1.0, 0.0, // 						 (endpoint: red)

  0.0,  0.0,  0.0,  0.0,  1.0,  0.0,	0.0, 0.0, 1.0, // Y axis line (origin: lighter green)
  0.0,  1.3,  0.0,	0.2,  1.0,  0.2,	0.0, 0.0, 1.0, //						 (endpoint: green)

  0.0,  0.0,  0.0,	0.0,  0.0,  1.0,	1.0, 0.0, 0.0, // Z axis line (origin: lighter white)
  0.0,  0.0,  1.3,	0.2,  0.2,  1.0,  1.0, 0.0, 0.0]);//						 (endpoint: blue)


	// How much space to store all the shapes in one array?
	// (no 'var' means this is a global variable)
	mySiz = gndVerts.length + domeVerts.length + 2*cubeVerts.length +
          sphVerts.length + curveVerts.length + axesVerts.length;

	// How many vertices total?
	var nn = mySiz / floatsPerVertex;

	// Copy all shapes into one big Float32 array:
  var verticesColors = new Float32Array(mySiz);
	// Copy them:  remember where to start for each shape:]
	gndStart = 0;						// next we'll store the ground-plane;
	for(i=0,j=0; j< gndVerts.length; i++, j++) {
		verticesColors[i] = gndVerts[j];
	}
	domeStart = i;						// next we'll store the dome;
	for(j=0; j< domeVerts.length; i++, j++) {
		verticesColors[i] = domeVerts[j];
	}
	cubeStart = i;						// next we'll store the cube;
	for(j=0; j< cubeVerts.length; i++, j++) {
		verticesColors[i] = cubeVerts[j];
	}
  makeCube(letterColorTopFront, letterColorBottomFront, letterColorTopBack, letterColorBottomBack);
	cubeStartb = i;						// next we'll store the cube;
	for(j=0; j< cubeVerts.length; i++, j++) {
		verticesColors[i] = cubeVerts[j];
	}
	sphereStart = i;						// next we'll store the sphere;
	for(j=0; j< sphVerts.length; i++, j++) {
		verticesColors[i] = sphVerts[j];
	}
	curveStart = i;						// next we'll store the curve;
	for(j=0; j< curveVerts.length; i++, j++) {
		verticesColors[i] = curveVerts[j];
	}
	axesStart = i;						// next we'll store the curve;
	for(j=0; j< axesVerts.length; i++, j++) {
		verticesColors[i] = axesVerts[j];
	}


  // Create a vertex buffer object (VBO)
  var vertexColorbuffer = gl.createBuffer();
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write vertex information to buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT; // how many bytes per stored value?

  //Get graphics system's handle for our Vertex Shader's position-input variable:
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Use handle to specify how to retrieve position data from our VBO:
  gl.vertexAttribPointer(
      a_Position, 	// choose Vertex Shader attribute to fill with data
      3, 						// how many values? 1,2,3 or 4.  (we're using x,y,z,w)
      gl.FLOAT, 		// data type for each value: usually gl.FLOAT
      false, 				// did we supply fixed-point data AND it needs normalizing?
      FSIZE * 9, 	// Stride -- how many bytes used to store each vertex?
                    // (x,y,z,w, r,g,b, nx,ny,nz) * bytes/value
      0);						// Offset -- now many bytes from START of buffer to the
                    // value we will actually use?
  gl.enableVertexAttribArray(a_Position);
                    // Enable assignment of vertex buffer object's position data

  // Get graphics system's handle for our Vertex Shader's color-input variable;
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if(a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  // Use handle to specify how to retrieve color data from our VBO:
  gl.vertexAttribPointer(
    a_Color, 				// choose Vertex Shader attribute to fill with data
    3, 							// how many values? 1,2,3 or 4. (we're using R,G,B)
    gl.FLOAT, 			// data type for each value: usually gl.FLOAT
    false, 					// did we supply fixed-point data AND it needs normalizing?
    FSIZE * 9, 		// Stride -- how many bytes used to store each vertex?
                    // (x,y,z,w, r,g,b, nx,ny,nz) * bytes/value
    FSIZE * 3);			// Offset -- how many bytes from START of buffer to the
                    // value we will actually use?  Need to skip over x,y,z,w

  gl.enableVertexAttribArray(a_Color);
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
    FSIZE * 9, 		// Stride -- how many bytes used to store each vertex?
                    // (x,y,z,w, r,g,b, nx,ny,nz) * bytes/value
    FSIZE * 6);			// Offset -- how many bytes from START of buffer to the
                    // value we will actually use?  Need to skip over x,y,z,w,r,g,b

  gl.enableVertexAttribArray(a_Normal);
                    // Enable assignment of vertex buffer object's position data

  //--------------------------------DONE!
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return mySiz/floatsPerVertex;	// return # of vertices
}

var g_EyeX = 0.0, g_EyeY = -6.0, g_EyeZ = 0.0,
g_LookZ = g_EyeZ, hor_angle = 0, ver_angle = 0, roll_angle = 0,
g_LookX = g_EyeX + Math.sin(hor_angle/180*Math.PI),
g_LookY = g_EyeY + Math.cos(hor_angle/180*Math.PI);
// Global vars for Eye position.
// NOTE!  I moved eyepoint BACKWARDS from the forest: from g_EyeZ=0.25
// a distance far enough away to see the whole 'forest' of trees within the
// 30-degree field-of-view of our 'perspective' camera.  I ALSO increased
// the 'keydown()' function's effect on g_EyeX position.


function keydown(key, currentAngle) {
  //------------------------------------------------------
  //HTML calls this'Event handler' or 'callback function' when we press a key:
    var vel = 0.1;
    var x_dir = ( g_LookX - g_EyeX ) * vel;
    var y_dir = ( g_LookY - g_EyeY ) * vel;
    var z_dir = ( g_LookZ - g_EyeZ ) * vel;

    // ------------------------------------------------ w and s keys are pitch
    if (key == 87) { // The w key was pressed
        ver_angle += 2;
        g_LookY = g_EyeY + Math.cos(ver_angle/180*Math.PI);
        g_LookZ = g_EyeZ + Math.sin(ver_angle/180*Math.PI);
    } else
    if (key == 83) { // The s key was pressed
        ver_angle -= 2;
        g_LookY = g_EyeY + Math.cos(ver_angle/180*Math.PI);
        g_LookZ = g_EyeZ + Math.sin(ver_angle/180*Math.PI);
    } else
    // ----------------------------------------------- a and d keys are yaw
    if(key == 68) { // The d key was pressed
        hor_angle += 2;
				g_LookX = g_EyeX + Math.sin(hor_angle/180*Math.PI);
    		g_LookY = g_EyeY + Math.cos(hor_angle/180*Math.PI);
    } else
    if (key == 65) { // The a key was pressed
        hor_angle -= 2;
				g_LookX = g_EyeX + Math.sin(hor_angle/180*Math.PI);
    		g_LookY = g_EyeY + Math.cos(hor_angle/180*Math.PI);
    } else
    // ----------------------------------------------- z and x keys are roll
    if (key == 90) { // The z key was pressed
        roll_angle += Math.PI/90;
    } else
    if (key == 88) { // The w key was pressed
        roll_angle -= Math.PI/90;
    } else
    // ------------------- up and down arrow keys move forward and backwards
    if (key == 38) { // The up arrow key was pressed
				g_EyeX += x_dir;
        g_EyeY += y_dir;
        g_EyeZ += z_dir;
        g_LookX += x_dir;
        g_LookY += y_dir;
        g_LookZ += z_dir;
    } else
    if (key == 40) { // The down arrow key was pressed
				g_EyeX -= x_dir;
        g_EyeY -= y_dir;
        g_EyeZ -= z_dir;
        g_LookX -= x_dir;
        g_LookY -= y_dir;
        g_LookZ -= z_dir;
    } else
    // ----------------------------- left and right arrow keys move sideways
    if (key == 37) { // The left arrow key was pressed
				g_EyeX -= y_dir;
        g_EyeY += x_dir;
        g_LookX -= y_dir;
        g_LookY += x_dir;
    } else
    if (key == 39) { // The right arrow key was pressed
				g_EyeX += y_dir;
        g_EyeY -= x_dir;
        g_LookX += y_dir;
        g_LookY -= x_dir;
    } else
    if (key == 82) { // The r key was pressed
				resetPosition();
    } else
    if (key == 32) { // The spacebar was pressed
        lampJumpSet = true;
    } else
    if (key == 70) { // The f key was pressed
        runStopFunction();
    } else
    if (key == 67) { // The c key was pressed
        cruiseSetFunction();
    } else return;          // Prevent the unnecessary drawing
    drawResize(currentAngle);
}

function draw(gl, currentAngle) {
  //==============================================================================

  // Clear <canvas> color AND DEPTH buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Using OpenGL/ WebGL 'viewports':
  // these determine the mapping of CVV to the 'drawing context',
	// (for WebGL, the 'gl' context describes how we draw inside an HTML-5 canvas)
	// Details? see
	//
  //  https://www.khronos.org/registry/webgl/specs/1.0/#2.3
  // Draw in the FIRST of several 'viewports'
  //------------------------------------------
	// CHANGE from our default viewport:
	// gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	// to a smaller one:
	gl.viewport(0,  														// Viewport lower-left corner
							0,															// (x,y) location(in pixels)
  						gl.drawingBufferWidth/2, 				// viewport width, height.
  						gl.drawingBufferHeight);

  // Set the matrix to be used for to set the camera view
  viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ,  	// eye position
  										 g_LookX, g_LookY, g_LookZ,	// look-at point (origin)
  										 Math.sin(roll_angle), 0, Math.cos(roll_angle));								  // up vector (+z)
  projMatrix.setPerspective(40,
                            gl.drawingBufferWidth/2/
                            gl.drawingBufferHeight,
                            1, 100);
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
  // Pass the model view projection matrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

	// Draw the scene:
	drawMyScene(gl, u_MvpMatrix, mvpMatrix, u_NormalMatrix, normalMatrix, currentAngle);

    // Draw in the SECOND of several 'viewports'
  //------------------------------------------
	gl.viewport(gl.drawingBufferWidth/2, 				// Viewport lower-left corner
							0, 															// location(in pixels)
  						gl.drawingBufferWidth/2, 				// viewport width, height.
  						gl.drawingBufferHeight);

  projMatrix.setOrtho(-gl.drawingBufferWidth/gl.drawingBufferHeight,
                      gl.drawingBufferWidth/gl.drawingBufferHeight,
                      -2.0, 2.0, 1.0, 100);
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

  // Pass the view projection matrix to our shaders:
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

	// Draw the scene:
	drawMyScene(gl, u_MvpMatrix, mvpMatrix, u_NormalMatrix, normalMatrix, currentAngle);
}

function drawPixarLamp(myGL, myu_ViewMatrix, myViewMatrix, u_NormalMatrix, normalMatrix, currentAngle) {

  myViewMatrix.translate(0.0,0.0,-0.54);

  //Draw base of lamp
  pushMatrix(myViewMatrix);
  myViewMatrix.rotate(180, 0, 1, 0);
  myViewMatrix.scale(0.18,0.18,0.03);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,domeStart/floatsPerVertex,domeVerts.length/floatsPerVertex);

  //Draw first link (rigid link)
  myViewMatrix = popMatrix();
  myViewMatrix.rotate(20*currentAngle, 0, 0, 1);
  myViewMatrix.scale(0.2,0.2,0.2);
  myViewMatrix.rotate(-30, 0, 1, 0);
  pushMatrix(myViewMatrix);
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(0.0,0.0,0.45);
  myViewMatrix.scale(0.1,0.05,0.55);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw second link (pivots from the end of first link) part 1 (V-shaped)
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,0.0,0.9);
  myViewMatrix.rotate(60+40*Math.cos(currentAngle), 0, 1, 0);
  pushMatrix(myViewMatrix);
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(0.0,0.125,0.4);
  pushMatrix(myViewMatrix);
  myViewMatrix.scale(0.1,0.025,0.5);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,-0.25,0.0);
  myViewMatrix.scale(0.1,0.025,0.5);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw second link part 2 (V-shaped)
  myViewMatrix = popMatrix();
  myViewMatrix.rotate(-40, 0, 1, 0);
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(0.0,0.1,0.5);
  pushMatrix(myViewMatrix);
  myViewMatrix.scale(0.1,0.05,0.6);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,-0.2,0.0);
  myViewMatrix.scale(0.1,0.05,0.6);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw third link (pivots from end of second link part 2)
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,0.0,1.0)
  myViewMatrix.rotate(40-20*Math.cos(currentAngle), 0, 1, 0);
  myViewMatrix.translate(0.0,0.0,0.6);
  myViewMatrix.scale(0.1,0.05,0.7);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw fourth link (pivots from end of second link part 1)
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,0.0,0.85)
  myViewMatrix.rotate(-20*Math.cos(currentAngle), 0, 1, 0);
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(0.0,0.0,0.6);
  myViewMatrix.scale(0.1,0.05,0.7);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw fifth link (pivots from end of fourth link) part 1
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,0.0,1.2);
  myViewMatrix.rotate(-55+18*Math.cos(currentAngle), 0, 1, 0);
  pushMatrix(myViewMatrix);
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(0.0,0.1,0.25);
  pushMatrix(myViewMatrix);
  myViewMatrix.scale(0.1,0.05,0.35);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,-0.2,0.0);
  myViewMatrix.scale(0.1,0.05,0.35);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw fifth link part 2
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,0.0,0.5);
  myViewMatrix.rotate(-95, 0, 1, 0);
  myViewMatrix.translate(0.0,0.1,0.22);
  pushMatrix(myViewMatrix);
  myViewMatrix.scale(0.1,0.05,0.32);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,-0.2,0.0);
  myViewMatrix.scale(0.1,0.05,0.32);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw sixth link (pivots from end of fifth link part 1)
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,0.0,0.5);
  myViewMatrix.rotate(50, 0, 1, 0);
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(0.0,0.0,0.2);
  myViewMatrix.scale(0.05,0.05,0.2);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw lamp head and bulb
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,0.0,0.75);
  myViewMatrix.rotate(90, 0, 1, 0);
  myViewMatrix.translate(0.0,0.0,-0.4);
  myViewMatrix.rotate(30*Math.sin(currentAngle), 1, 0, 0);
  pushMatrix(myViewMatrix);
  myViewMatrix.scale(0.5,0.5,0.7);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,domeStart/floatsPerVertex,domeVerts.length/floatsPerVertex);
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,0.0,1.0);
  myViewMatrix.scale(0.5,0.5,0.5);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,sphereStart/floatsPerVertex,sphVerts.length/floatsPerVertex);
    // Draw moving axes
  myViewMatrix.translate(0.0,0.0,1.0);
  myViewMatrix.scale(2.0,2.0,2.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.LINES,							    // use this drawing primitive, and
    							axesStart/floatsPerVertex,	// start at this vertex number, and
    							axesVerts.length/floatsPerVertex);		// draw this many vertices

  //Draw seventh link (pivots from base)
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,0.0,0.15);
  myViewMatrix.rotate(68+50*Math.cos(currentAngle), 0, 1, 0);
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(0.0,0.1,0.3);
  pushMatrix(myViewMatrix);
  myViewMatrix.scale(0.1,0.05,0.4);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,-0.2,0.0);
  myViewMatrix.scale(0.1,0.05,0.4);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

  //Draw eighth link (pivots from end of seventh link)
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,0.0,0.6);
  myViewMatrix.rotate(-55-42*Math.cos(currentAngle), 0, 1, 0);
  myViewMatrix.translate(0.0,0.0,0.35);
  pushMatrix(myViewMatrix);
  myViewMatrix.scale(0.1,0.05,0.45);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,0.05,0.3);
  pushMatrix(myViewMatrix);
  myViewMatrix.scale(0.1,0.025,0.45);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.0,-0.1,0.0);
  myViewMatrix.scale(0.1,0.025,0.45);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStart/floatsPerVertex,cubeVerts.length/floatsPerVertex);

}

function drawP(myGL, myu_ViewMatrix, myViewMatrix, u_NormalMatrix, normalMatrix) {
  myViewMatrix.translate(0.0,0.0,0.06);
  myViewMatrix.scale(0.3,0.075,0.3);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    //Find inverse transpose of modelMatrix:
    normalMatrix.setInverseOf(myViewMatrix);
    normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,curveStart/floatsPerVertex,curveVerts.length/floatsPerVertex);
  myViewMatrix.translate(-0.23,0.0,-0.6);
  myViewMatrix.scale(0.23,1.0,1.6);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    //Find inverse transpose of modelMatrix:
    normalMatrix.setInverseOf(myViewMatrix);
    normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStartb/floatsPerVertex,cubeVerts.length/floatsPerVertex);

}

function drawX(myGL, myu_ViewMatrix, myViewMatrix, u_NormalMatrix, normalMatrix) {
  myViewMatrix.translate(0.0,0.0,-0.12);
  pushMatrix(myViewMatrix);
  myViewMatrix.rotate(-25,0,1,0);
  myViewMatrix.scale(0.069,0.075,0.5);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    //Find inverse transpose of modelMatrix:
    normalMatrix.setInverseOf(myViewMatrix);
    normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStartb/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  myViewMatrix = popMatrix();
  myViewMatrix.rotate(25,0,1,0);
  myViewMatrix.scale(0.069,0.075,0.5);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    //Find inverse transpose of modelMatrix:
    normalMatrix.setInverseOf(myViewMatrix);
    normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStartb/floatsPerVertex,cubeVerts.length/floatsPerVertex);

}

function drawA(myGL, myu_ViewMatrix, myViewMatrix, u_NormalMatrix, normalMatrix) {
  myViewMatrix.translate(0.1,0.0,-0.12);
  pushMatrix(myViewMatrix);
  myViewMatrix.rotate(-13,0,1,0);
  myViewMatrix.scale(0.069,0.075,0.48);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    //Find inverse transpose of modelMatrix:
    normalMatrix.setInverseOf(myViewMatrix);
    normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStartb/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  myViewMatrix = popMatrix();
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(-0.2,0.0,0.0);
  myViewMatrix.rotate(13,0,1,0);
  myViewMatrix.scale(0.069,0.075,0.48);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    //Find inverse transpose of modelMatrix:
    normalMatrix.setInverseOf(myViewMatrix);
    normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStartb/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  myViewMatrix = popMatrix();
  myViewMatrix.translate(-0.1,0.0,-0.15);
  myViewMatrix.rotate(90,0,1,0);
  myViewMatrix.scale(0.069,0.075,0.18);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    //Find inverse transpose of modelMatrix:
    normalMatrix.setInverseOf(myViewMatrix);
    normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStartb/floatsPerVertex,cubeVerts.length/floatsPerVertex);

}

function drawR(myGL, myu_ViewMatrix, myViewMatrix, u_NormalMatrix, normalMatrix) {
  myViewMatrix.translate(0.0,0.0,0.06);
  myViewMatrix.scale(0.3,0.075,0.3);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    //Find inverse transpose of modelMatrix:
    normalMatrix.setInverseOf(myViewMatrix);
    normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLE_STRIP,curveStart/floatsPerVertex,curveVerts.length/floatsPerVertex);
  myViewMatrix.translate(-0.23,0.0,-0.6);
  pushMatrix(myViewMatrix);
  myViewMatrix.scale(0.23,1.0,1.6);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    //Find inverse transpose of modelMatrix:
    normalMatrix.setInverseOf(myViewMatrix);
    normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStartb/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.6,0.0,-0.7);
  myViewMatrix.rotate(-40, 0, 1, 0);
  myViewMatrix.scale(0.23,1.0,1.0);
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
    //Find inverse transpose of modelMatrix:
    normalMatrix.setInverseOf(myViewMatrix);
    normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);
  myGL.drawArrays(myGL.TRIANGLES,cubeStartb/floatsPerVertex,cubeVerts.length/floatsPerVertex);


}

function drawMyScene(myGL, myu_ViewMatrix, myViewMatrix, u_NormalMatrix, normalMatrix, currentAngle) {
  //===============================================================================
  // Called ONLY from within the 'draw()' function
  // Assumes already-correctly-set View matrix and Proj matrix;
  // draws all items in 'world' coords.

	// DON'T clear <canvas> or you'll WIPE OUT what you drew
	// in all previous viewports!
	// myGL.clear(gl.COLOR_BUFFER_BIT);

  // Draw stationary axes

  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);

  myGL.drawArrays(myGL.LINES,							// use this drawing primitive, and
  							axesStart/floatsPerVertex,	// start at this vertex number, and
  							axesVerts.length/floatsPerVertex);		// draw this many vertices

  pushMatrix(myViewMatrix);

  myViewMatrix.translate(-1.8,0.0,0.6);
  pushMatrix(myViewMatrix);
  drawP(myGL, myu_ViewMatrix, myViewMatrix, u_NormalMatrix, normalMatrix);

  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.9, 0.0, 0.0);
  pushMatrix(myViewMatrix);
  myViewMatrix.translate(0.0,0.0,lampJump);
  drawPixarLamp(myGL, myu_ViewMatrix, myViewMatrix, u_NormalMatrix, normalMatrix, currentAngle);

  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.9, 0.0, 0.0);
  pushMatrix(myViewMatrix);
  drawX(myGL, myu_ViewMatrix, myViewMatrix, u_NormalMatrix, normalMatrix);

  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.9, 0.0, 0.0);
  pushMatrix(myViewMatrix);
  drawA(myGL, myu_ViewMatrix, myViewMatrix, u_NormalMatrix, normalMatrix);

  myViewMatrix = popMatrix();
  myViewMatrix.translate(0.9, 0.0, 0.0);
  drawR(myGL, myu_ViewMatrix, myViewMatrix, u_NormalMatrix, normalMatrix);

  myViewMatrix = popMatrix();
	myViewMatrix.translate(0.9, 0.0, 0.0);
	myViewMatrix.scale(0.4, 0.4, 0.4);		// shrink the drawing axes
																			//for nicer-looking ground-plane, and
  // Pass the modified view matrix to our shaders:
  myGL.uniformMatrix4fv(myu_ViewMatrix, false, myViewMatrix.elements);
  	//Find inverse transpose of modelMatrix:
  	normalMatrix.setInverseOf(myViewMatrix);
  	normalMatrix.transpose();
    myGL.uniformMatrix4fv(u_NormalMatrix, false, myViewMatrix.elements);

  // Now, using these drawing axes, draw our ground plane:
  myGL.drawArrays(myGL.LINES,							// use this drawing primitive, and
  							gndStart/floatsPerVertex,	// start at this vertex number, and
  							gndVerts.length/floatsPerVertex);		// draw this many vertices

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
	nuCanvas.height = innerHeight*3/4;
	// IMPORTANT!  Need a fresh drawing in the re-sized viewports.
	draw(nuGL, currentAngle);				// draw in all viewports.
}

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();
var elapsed;

function animate(angle) {
  //==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  elapsed = now - g_last;
  g_last = now;

  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
  //  if(angle >  120.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
  //  if(angle < -120.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;

  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

function resetPosition() {
  g_EyeX = 0.0;
  g_EyeY = -6.0;
  g_EyeZ = 0.0;
  g_LookZ = 0.0;
  hor_angle = 0;
  ver_angle = 0;
  roll_angle = 0;
  g_LookX = g_EyeX + Math.sin(hor_angle/180*Math.PI);
  g_LookY = g_EyeY + Math.cos(hor_angle/180*Math.PI);
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
  if (runStop)
    runStop=false;
  else {
    runStop=true;
    g_last = Date.now();
  }
  return;
}

function cruiseSetFunction() {
  if (cruiseSet) cruiseSet=false;
  else cruiseSet=true;
}
