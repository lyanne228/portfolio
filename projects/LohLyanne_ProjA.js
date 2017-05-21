// Vertex shader program----------------------------------
var VSHADER_SOURCE =
  'uniform mat4 u_ModelMatrix;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE =
  //  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  //  '#endif GL_ES\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

// Global Variables
var ANGLE_STEP = 10.0;		// Rotation angle rate (degrees/second)
var CTRL_STEP = 0.1;      // Rotation angle when up/down/left/right arrow-keys
                          // are hit. 30 makes a full rotation.
var floatsPerVertex = 7;	// # of Float32Array elements used for each vertex
													// (x,y,z,w)position + (r,g,b)color
													// Later, see if you can add:
													// (x,y,z) surface normal + (tx,ty) texture addr.
var squidColorTop = new Float32Array([0.7, 0.2, 0.1]);
var squidColorBottom = new Float32Array([0.98, 0.95, 0.95]);
var squidColorMid1 = new Float32Array([0.79, 0.45, 0.38]);
var squidColorMid2 = new Float32Array([0.89, 0.7, 0.67]);
var starfishCenter = new Float32Array([0.92, 0.54, 0.54]);
var starfishTips = new Float32Array([1, 0.25, 0.25]);
var redColorVal = 0.0;
var greenColorVal = 0.0;
var blueColorVal = 0.5;

// Global vars for mouse click-and-drag for rotation.
var isDrag=false;		// mouse-drag: true when user holds down mouse button
var xMclik=0.0;			// last mouse button-down position (in CVV coords)
var yMclik=0.0;
var xMdragTot=0.0;	// total (accumulated) mouse-drag amounts (in CVV coords).
var yMdragTot=0.0;
var animatingSF = 0;

function main() {
  //==============================================================================
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

  // Initialise VBO
  var n = initVertexBuffer(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Create mouse events/ keyboard events listeners
  canvas.onmousedown	=	function(ev){myMouseDown( ev, gl, canvas) };
  canvas.onmousemove = 	function(ev){myMouseMove( ev, gl, canvas) };
  canvas.onmouseup = 		function(ev){myMouseUp(   ev, gl, canvas)};
  window.addEventListener("keydown", myKeyDown, false);

  // Specify the color for clearing <canvas>
  gl.clearColor(redColorVal, greenColorVal, blueColorVal, 1.0);

	// NEW!! Enable 3D depth-test when drawing: don't over-draw at any pixel
	// unless the new Z value is closer to the eye than the old one..
  //	gl.depthFunc(gl.LESS);			 // WebGL default setting: (default)
	gl.enable(gl.DEPTH_TEST);

  // Get handle to graphics system's storage location of u_ModelMatrix
  var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  // Create a local version of our model matrix in JavaScript
  var modelMatrix = new Matrix4();

  // Create, init current rotation angle value in JavaScript
  var currentAngle = 0.0;

  //-----------------
  // Start drawing: create 'tick' variable whose value is this function:
  var tick = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle

    // currentAngle2 sets the rotation angle for the starfish limbs
    // currentAngle2 fixed at 360 if animatingSF is 0 -- starfish doesn't move
    // otherwise currentAngle2 = currentAngle
    var currentAngle2 = 360.0;
    if (animatingSF==1) currentAngle2 = currentAngle;
    draw(gl, n, currentAngle, currentAngle2, modelMatrix, u_ModelMatrix);   // Draw shapes
    requestAnimationFrame(tick, canvas);	// Request that the browser re-draw the webpage
  };
  tick();							// start (and continue) animation: draw current image

}

function initVertexBuffer(gl) {
  //==============================================================================
  // Create one giant vertex buffer object (VBO) that holds all vertices for all
  // shapes.

 	// Make each 3D shape in its own array of vertices:
  makeCube(squidColorBottom, squidColorMid2);
  makePyramid(squidColorMid1, squidColorTop);
  makeSquidHead();
  makePentagon(starfishCenter);
  // how many floats total needed to store all shapes?
	var mySiz = (cubeVerts.length*2 + pyrVerts.length*2
             + sqHdVerts.length + penVerts.length);

	// How many vertices total?
	var nn = mySiz / floatsPerVertex;
	// Copy all shapes into one big Float32 array:
  var colorShapes = new Float32Array(mySiz);
	// Copy them:  remember where to start for each shape:
  i = 0;
		cubeStarta = i;					// next we'll store the red cube;
	for(j=0; j< cubeVerts.length; i++, j++) {
		colorShapes[i] = cubeVerts[j];
		}
    makeCube(squidColorMid2, squidColorMid1);
    cubeStartb = i;					// next we'll store the red cube;
	for(j=0; j< cubeVerts.length; i++, j++) {
		colorShapes[i] = cubeVerts[j];
		}
		pyrStarta = i;						// next we'll store the red pyramid;
	for(j=0; j< pyrVerts.length; i++, j++) {
		colorShapes[i] = pyrVerts[j];
		}
    makePyramid(starfishCenter, starfishTips);
		pyrStartb = i;						// next we'll store the yellow pyramid;
	for(j=0; j< pyrVerts.length; i++, j++) {
		colorShapes[i] = pyrVerts[j];
		}
		sqHdStart = i;						// next we'll store the squid head;
	for(j=0; j< sqHdVerts.length; i++, j++) {
		colorShapes[i] = sqHdVerts[j];
		}
		penStart = i;						// next we'll store the pentagon;
	for(j=0; j< penVerts.length; i++, j++) {
		colorShapes[i] = penVerts[j];
		}
  // Create a buffer object on the graphics hardware:
  var shapeBufferHandle = gl.createBuffer();
  if (!shapeBufferHandle) {
    console.log('Failed to create the shape buffer object');
    return false;
  }

  // Bind the the buffer object to target:
  gl.bindBuffer(gl.ARRAY_BUFFER, shapeBufferHandle);
  // Transfer data from Javascript array colorShapes to Graphics system VBO
  // (Use sparingly--may be slow if you transfer large shapes stored in files)
  gl.bufferData(gl.ARRAY_BUFFER, colorShapes, gl.STATIC_DRAW);

  //Get graphics system's handle for our Vertex Shader's position-input variable:
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  var FSIZE = colorShapes.BYTES_PER_ELEMENT; // how many bytes per stored value?

  // Use handle to specify how to retrieve **POSITION** data from our VBO:
  gl.vertexAttribPointer(
  		a_Position, 	// choose Vertex Shader attribute to fill with data
  		4, 						// how many values? 1,2,3 or 4.  (we're using x,y,z,w)
  		gl.FLOAT, 		// data type for each value: usually gl.FLOAT
  		false, 				// did we supply fixed-point data AND it needs normalizing?
  		FSIZE * floatsPerVertex, // Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
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
  // Use handle to specify how to retrieve **COLOR** data from our VBO:
  gl.vertexAttribPointer(
  	a_Color, 				// choose Vertex Shader attribute to fill with data
  	3, 							// how many values? 1,2,3 or 4. (we're using R,G,B)
  	gl.FLOAT, 			// data type for each value: usually gl.FLOAT
  	false, 					// did we supply fixed-point data AND it needs normalizing?
  	FSIZE * 7, 			// Stride -- how many bytes used to store each vertex?
  									// (x,y,z,w, r,g,b) * bytes/value
  	FSIZE * 4);			// Offset -- how many bytes from START of buffer to the
  									// value we will actually use?  Need to skip over x,y,z,w

  gl.enableVertexAttribArray(a_Color);
  									// Enable assignment of vertex buffer object's position data

	//--------------------------------DONE!
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return nn;
}

function makeCube(cubeColorTop, cubeColorBottom) {
  // Make a cube shape from 12 triangles, center at origin
  // Left/right/top/bottom/front/back sides at x,y,z= +/-1.

  // Vertices:
  // Node 1 Left top back:      -1.0, 1.0,-1.0, 1.0,
  // Node 2 Right top back:      1.0, 1.0,-1.0, 1.0,
  // Node 3 Left bottom back:   -1.0,-1.0,-1.0, 1.0,
  // Node 4 Right bottom back:   1.0,-1.0,-1.0, 1.0,
  // Node 5 Left top front:     -1.0, 1.0, 1.0, 1.0,
  // Node 6 Right top front:     1.0, 1.0, 1.0, 1.0,
  // Node 7 Left bottom front:  -1.0,-1.0, 1.0, 1.0,
  // Node 8 Right bottom front:  1.0,-1.0, 1.0, 1.0,

  cubeVerts = new Float32Array([
    //Back face
    -1.0, 1.0,-1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 1
     1.0, 1.0,-1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 2
    -1.0,-1.0,-1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 3
     1.0, 1.0,-1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 2
    -1.0,-1.0,-1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 3
     1.0,-1.0,-1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 4
    //Right face
     1.0, 1.0,-1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 2
     1.0,-1.0,-1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 4
     1.0, 1.0, 1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 6
     1.0,-1.0,-1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 4
     1.0, 1.0, 1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 6
     1.0,-1.0, 1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 8
    //Front face
    -1.0, 1.0, 1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 5
     1.0, 1.0, 1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 6
    -1.0,-1.0, 1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 7
     1.0, 1.0, 1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 6
    -1.0,-1.0, 1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 7
     1.0,-1.0, 1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 8
    //Left face
    -1.0, 1.0,-1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 1
    -1.0,-1.0,-1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 3
    -1.0, 1.0, 1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 5
    -1.0,-1.0,-1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 3
    -1.0, 1.0, 1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 5
    -1.0,-1.0, 1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 7
    //Top face
    -1.0, 1.0,-1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 1
     1.0, 1.0,-1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 2
    -1.0, 1.0, 1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 5
     1.0, 1.0,-1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 2
    -1.0, 1.0, 1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 5
     1.0, 1.0, 1.0, 1.0, cubeColorTop[0], cubeColorTop[1], cubeColorTop[2], // Node 6
    //Bottom face
    -1.0,-1.0,-1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 3
     1.0,-1.0,-1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 4
    -1.0,-1.0, 1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 7
     1.0,-1.0,-1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 4
    -1.0,-1.0, 1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 7
     1.0,-1.0, 1.0, 1.0, cubeColorBottom[0], cubeColorBottom[1], cubeColorBottom[2], // Node 8
  ]);
}

function makePyramid(pyrColorBase, pyrColorTip) {
  //==============================================================================
  // Make a 5-cornered pyramid (square base) from 6 triangles
  // All vertex coords are +/1 or zero; pyramid base is in xz plane.

  //Vertices:
  //-1.0,-1.0,-1.0, 1.0, pyrColor[0], pyrColor[1], pyrColor[2],    //Left, back, base
  // 1.0,-1.0,-1.0, 1.0, pyrColor[0], pyrColor[1], pyrColor[2],    //Right, back, base
  //-1.0,-1.0, 1.0, 1.0, pyrColor[0], pyrColor[1], pyrColor[2],    //Left, front, base
  // 1.0,-1.0, 1.0, 1.0, pyrColor[0], pyrColor[1], pyrColor[2],    //Right, front, base
  // 0.0, 1.0, 0.0, 1.0, pyrColor[0], pyrColor[1], pyrColor[2],    //Pyramid apex

  pyrVerts = new Float32Array([
    //Face 1:
    -1.0,-1.0,-1.0, 1.0, pyrColorBase[0], pyrColorBase[1], pyrColorBase[2],    //Left, back, base
     1.0,-1.0,-1.0, 1.0, pyrColorBase[0], pyrColorBase[1], pyrColorBase[2],    //Right, back, base
     0.0, 1.0, 0.0, 1.0, pyrColorTip[0], pyrColorTip[1], pyrColorTip[2],    //Pyramid apex
    //Face 2:
     1.0,-1.0,-1.0, 1.0, pyrColorBase[0], pyrColorBase[1], pyrColorBase[2],    //Right, back, base
     1.0,-1.0, 1.0, 1.0, pyrColorBase[0], pyrColorBase[1], pyrColorBase[2],    //Right, front, base
     0.0, 1.0, 0.0, 1.0, pyrColorTip[0], pyrColorTip[1], pyrColorTip[2],    //Pyramid apex
    //Face 3:
    -1.0,-1.0, 1.0, 1.0, pyrColorBase[0], pyrColorBase[1], pyrColorBase[2],    //Left, front, base
     1.0,-1.0, 1.0, 1.0, pyrColorBase[0], pyrColorBase[1], pyrColorBase[2],    //Right, front, base
     0.0, 1.0, 0.0, 1.0, pyrColorTip[0], pyrColorTip[1], pyrColorTip[2],    //Pyramid apex
    //Face 4:
    -1.0,-1.0,-1.0, 1.0, pyrColorBase[0], pyrColorBase[1], pyrColorBase[2],    //Left, back, base
    -1.0,-1.0, 1.0, 1.0, pyrColorBase[0], pyrColorBase[1], pyrColorBase[2],    //Left, front, base
     0.0, 1.0, 0.0, 1.0, pyrColorTip[0], pyrColorTip[1], pyrColorTip[2],    //Pyramid apex
    //Base 1:
    -1.0,-1.0,-1.0, 1.0, pyrColorBase[0], pyrColorBase[1], pyrColorBase[2],    //Left, back, base
     1.0,-1.0,-1.0, 1.0, pyrColorBase[0], pyrColorBase[1], pyrColorBase[2],    //Right, back, base
    -1.0,-1.0, 1.0, 1.0, pyrColorBase[0], pyrColorBase[1], pyrColorBase[2],    //Left, front, base
    //Base 2:
     1.0,-1.0,-1.0, 1.0, pyrColorBase[0], pyrColorBase[1], pyrColorBase[2],    //Right, back, base
    -1.0,-1.0, 1.0, 1.0, pyrColorBase[0], pyrColorBase[1], pyrColorBase[2],    //Left, front, base
     1.0,-1.0, 1.0, 1.0, pyrColorBase[0], pyrColorBase[1], pyrColorBase[2],    //Right, front, base
  ]);

}

function makePentagon(penColor) {
  //==============================================================================
  // Make a pentagonal prism from 20 triangles, using the TRIANGLE_STRIP primitive
  // 2 triangles on each square face and 5 triangles on each pentagonal face

  var penAngle = 0.4*Math.PI;
  var z_coord = 1.0;
  penVerts = new Float32Array( 31* floatsPerVertex );

  for (i=0; i<16; i++) {
    j = i*2*floatsPerVertex;

    if (i>10) z_coord = -1.0;

    penVerts[j  ] = Math.sin(i*penAngle);
    penVerts[j+1] = Math.cos(i*penAngle);
    penVerts[j+2] = z_coord;
    penVerts[j+3] = 1.0;
    penVerts[j+4] = penColor[0];
    penVerts[j+5] = penColor[1];
    penVerts[j+6] = penColor[2];

    if ((i<5 || i>10) && i<15) {
      penVerts[j+7] = 0.0;
      penVerts[j+8] = 0.0;
      penVerts[j+9] = z_coord;
      penVerts[j+10]= 1.0;
      penVerts[j+11]= penColor[0];
      penVerts[j+12]= penColor[1];
      penVerts[j+13]= penColor[2];
    } else if (i<15) {
      penVerts[j+7] = penVerts[j  ];
      penVerts[j+8] = penVerts[j+1];
      penVerts[j+9] = -1.0;
      penVerts[j+10]= 1.0;
      penVerts[j+11] = penColor[0];
      penVerts[j+12] = penColor[1];
      penVerts[j+13] = penColor[2];
    }

  }
}

function makeSquidHead() {
  //==============================================================================
  // Make a squid head from one OpenGL TRIANGLE_STRIP primitive.   Make ring-like
  // equal-lattitude 'slices' of the sphere (bounded by planes of constant z),
  // and connect them as a 'stepped spiral' design (see makeCylinder) to build the
  // squid head from one triangle strip.
  // Adapted from Prof Tumblin's makeSphere() code

  var slices = 40;		// # of slices of the squid head along the z axis. >=3 req'd
											// (choose odd # or prime# to avoid accidental symmetry)
  var sliceVerts	= 27;	// # of vertices around the top edge of the slice
											// (same number of vertices on bottom of slice, too)
  var sliceAngle = 2/(slices);	// lattitude angle spanned by one slice.

	// Create a (global) array to hold this squid head's vertices:
  sqHdVerts = new Float32Array(  ((slices * 2* sliceVerts) -2) * floatsPerVertex);
										// # of vertices * # of elements needed to store them.
										// each slice requires 2*sliceVerts vertices except 1st and
										// last ones, which require only 2*sliceVerts-1.

	// Create the squid head starting from the slice at z=+1
	// s counts slices; v counts vertices;
	// j counts array elements (vertices * elements per vertex)
	var cos0 = 0.0;					// sines are the radius of a slice
	var sin0 = 0.0;         // cosines are the height of the slice (z-axis)
	var cos1 = 0.0;         // 0 represents the top edge
	var sin1 = 0.0;         // 1 represents the bottom edge
	var j = 0;							// initialize our array index
	var isFirst = 1;
	for(s=0; s<slices; s++) {	// for each slice of the sphere,
		// find sines & cosines for top and bottom of this slice
		if(s==0) {
			isFirst = 1;	// skip 1st vertex of 1st slice.
			cos0 = 1.0; 	// initialize: start at north pole.
			sin0 = 0.0;
		}
		else {					// otherwise, new top edge == old bottom edge
			isFirst = 0;
			cos0 = cos1;
			sin0 = sin1;
		}								// & compute sine,cosine for new bottom edge.
		cos1 = (s+1)*sliceAngle;
		sin1 = Math.log10(s);
		// go around the entire slice, generating TRIANGLE_STRIP verts
		// (Note we don't initialize j; grows with each new attrib,vertex, and slice)
		for(v=isFirst; v< 2*sliceVerts; v++, j+=floatsPerVertex) {
			if(v%2==0)
			{				// put even# vertices at the the slice's top edge
							// (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
							// and thus we can simplify cos(2*PI(v/2*sliceVerts))
				sqHdVerts[j  ] = sin0 * Math.cos(Math.PI*(v)/sliceVerts);
				sqHdVerts[j+1] = sin0 * Math.sin(Math.PI*(v)/sliceVerts);
				sqHdVerts[j+2] = cos0;
				sqHdVerts[j+3] = 1.0;
			}
			else { 	// put odd# vertices around the slice's lower edge;
							// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
							// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
				sqHdVerts[j  ] = sin1 * Math.cos(Math.PI*(v-1)/sliceVerts);		// x
				sqHdVerts[j+1] = sin1 * Math.sin(Math.PI*(v-1)/sliceVerts);		// y
				sqHdVerts[j+2] = cos1;																				// z
				sqHdVerts[j+3] = 1.0;																				// w.
			}
      var fraction = Math.abs((slices/1.6-s)/slices*1.6);
			sqHdVerts[j+4]=fraction*squidColorTop[0]+(1-fraction)*squidColorBottom[0];
			sqHdVerts[j+5]=fraction*squidColorTop[1]+(1-fraction)*squidColorBottom[1];
			sqHdVerts[j+6]=fraction*squidColorTop[2]+(1-fraction)*squidColorBottom[2];
		}
	}
}

function draw(gl, n, currentAngle, currentAngle2, modelMatrix, u_ModelMatrix) {
  //==============================================================================
  // Clear <canvas>  colors AND the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  modelMatrix.setTranslate( 0.0, 0.3, 0.0);
  modelMatrix.scale(1,1,-1);			        // convert to left-handed coord sys
  																				// to match WebGL display canvas.

  // Attempt 2: perp-axis rotation:
  // rotate on axis perpendicular to the mouse-drag direction:
  var dist = Math.sqrt(xMdragTot*xMdragTot + yMdragTot*yMdragTot);
  // why add 0.001? avoids divide-by-zero in next statement
  // in cases where user didn't drag the mouse.)
  modelMatrix.rotate(dist*120.0, -yMdragTot+0.0001, xMdragTot+0.0001, 0.0);


  pushMatrix(modelMatrix);
  modelMatrix.translate(-0.5, 0.3, 0);
  modelMatrix.scale(0.6, 0.6, 0.6);
  drawSquid(gl, n, currentAngle, modelMatrix, u_ModelMatrix);

  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.5, 0.1, 0.5);
  modelMatrix.scale(0.6, 0.6, 0.6);
  drawSquid(gl, n, currentAngle, modelMatrix, u_ModelMatrix);

  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0, -0.2, -0.5);
  modelMatrix.scale(0.6, 0.6, 0.6);
  drawSquid(gl, n, currentAngle, modelMatrix, u_ModelMatrix);

  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.rotate(60, 0, 1, 0);
  modelMatrix.translate(0, -0.8, 0);
  modelMatrix.scale(0.6, 0.6, 0.6);
  drawStarfish(gl, n, currentAngle2, modelMatrix, u_ModelMatrix);

  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.rotate(30, 0, 1, 0);
  modelMatrix.translate(-0.7, -0.8, 0.2);
  modelMatrix.scale(0.6, 0.6, 0.6);
  drawStarfish(gl, n, currentAngle2, modelMatrix, u_ModelMatrix);

  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.6, -0.8, -0.3);
  modelMatrix.scale(0.6, 0.6, 0.6);
  drawStarfish(gl, n, currentAngle2, modelMatrix, u_ModelMatrix);
}

var lastExtended = 4;

function drawStarfish(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {

  var numLegs = 5;                        // Number of legs that the starfish handles
  var leg_angle = 360/numLegs;
  var moveLeg = currentAngle/3%3;
  var moveLegInt = parseInt(moveLeg);
  moveLeg -= moveLegInt;

  modelMatrix.scale(0.23, 0.23, 0.23);    // Make it smaller

  pushMatrix(modelMatrix);
  modelMatrix.rotate(-90, 1, 0, 0);
  modelMatrix.translate(0, 0, -0.06);
  modelMatrix.scale(0.41, 0.41, 0.295);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,penStart/floatsPerVertex,penVerts.length/floatsPerVertex);
  modelMatrix = popMatrix();

  for(i=0; i<numLegs; i++) {
    pushMatrix(modelMatrix);
    modelMatrix.rotate(i*leg_angle, 0, 1, 0);
    modelMatrix.rotate(100, 1, 0, 0);
    if (i%3==moveLegInt && animatingSF==1) {
      var quadFunction = 4*(moveLeg-moveLeg*moveLeg);
      modelMatrix.rotate(-30*quadFunction, 1, 0, 0);
      modelMatrix.translate(0, 0, 0.15*quadFunction);
    }
    modelMatrix.translate(0 , 1.2, 0);
    modelMatrix.scale(0.3, 0.9, 0.3);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES,pyrStartb/floatsPerVertex,pyrVerts.length/floatsPerVertex);
    modelMatrix = popMatrix();
  }
}

function drawSquid(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
  modelMatrix.scale(0.23, 0.23, 0.23);    // Make it smaller

  pushMatrix(modelMatrix);
  modelMatrix.translate(0, 2, 0);
  modelMatrix.rotate(90, 1, 0, 0);
  modelMatrix.scale(0.7, 0.7, 1.3);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLE_STRIP,sqHdStart/floatsPerVertex,sqHdVerts.length/floatsPerVertex);

  modelMatrix = popMatrix();
  modelMatrix.translate(0.0, -0.6, 0.0);
  modelMatrix.scale(0.7, 0.7, 0.7);

  for (i=0; i<8; i++) {
    modelMatrix.rotate(45, 0, 1, 0);
    pushMatrix(modelMatrix);
    drawLeg(gl, n, currentAngle, modelMatrix, u_ModelMatrix);
    modelMatrix = popMatrix();
  }
}

function drawLeg(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {

  //----------Draw Cube for upper leg
  modelMatrix.translate(0.0, 0.0, 0.65);
  // rotate it to point outwards, and flex it by 25*Math.cos(currentAngle)
  modelMatrix.rotate(-40 + 25*Math.cos(currentAngle), 1, 0, 0);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.0, -0.5, 0.0);   // translate it to position pivot
  modelMatrix.scale(0.2, 0.6, 0.2);				 // make it smaller
  // Drawing:
  // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,cubeStarta/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  modelMatrix = popMatrix();

  //---------Draw Cube for middle leg
  modelMatrix.translate(0.0, -1.0 , 0.0);   // translate it to position pivot
  // flex it by 25*Math.cos(currentAngle)
  modelMatrix.rotate(-45*Math.cos(currentAngle), 1, 0, 0);
  pushMatrix(modelMatrix);
  modelMatrix.translate(0.0, -0.6, 0.0);
  modelMatrix.scale(0.18, 0.58, 0.18);				 // make it smaller
  // Drawing:
  // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,cubeStartb/floatsPerVertex,cubeVerts.length/floatsPerVertex);
  modelMatrix = popMatrix();

  //---------Draw Pyramid for lower leg
  modelMatrix.rotate(-20, 1, 0, 0);          // rotate it to point outwards
  modelMatrix.translate(0.0, -1.0 , -0.4);   // translate it to position pivot
  // flex it by 25*Math.cos(currentAngle)
  modelMatrix.rotate(180 - 45*Math.cos(currentAngle), 1, 0, 0);
  modelMatrix.translate(0.0, 0.6*(3+Math.cos(currentAngle))/2, 0.0);
  modelMatrix.scale(0.18, 0.58*(3+Math.cos(currentAngle))/2, 0.18);				 // make it smaller
  // Drawing:
  // Pass our current matrix to the vertex shaders:
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.drawArrays(gl.TRIANGLES,pyrStarta/floatsPerVertex,pyrVerts.length/floatsPerVertex);
}

function clearDrag() {
  // Called when user presses 'Clear' button in our webpage
	xMdragTot = 0.0;
	yMdragTot = 0.0;
}

function animateSF() {
  if (animatingSF==0)
    animatingSF = 1;
  else
    animatingSF = 0;
}

function myMouseDown(ev, gl, canvas) {
  //==============================================================================
  // Called when user PRESSES down any mouse button;
  // 									(Which button?    console.log('ev.button='+ev.button);   )
  // 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
  //		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

  // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
  var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge

	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);

  // Specify the color for clearing <canvas> (lighter/darker)
  if (x<=-0.2) {
    redColorVal += 0.05;
    greenColorVal += 0.05;
    blueColorVal += 0.1;
  } else if (x>=0.2) {
    redColorVal -= 0.05;
    greenColorVal -= 0.05;
    blueColorVal -= 0.1;
  }
  gl.clearColor(redColorVal, greenColorVal, blueColorVal, 1.0);

	isDrag = true;											// set our mouse-dragging flag
	xMclik = x;													// record where mouse-dragging began
	yMclik = y;
};

function myMouseMove(ev, gl, canvas) {
  //==============================================================================
  // Called when user MOVES the mouse with a button already pressed down.
  // 									(Which button?   console.log('ev.button='+ev.button);    )
  // 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
  //		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

	if(isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'

	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
  //  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);

	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
  //	console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

	// find how far we dragged the mouse:
	xMdragTot += (x - xMclik);					// Accumulate change-in-mouse-position,&
	yMdragTot += (y - yMclik);
	xMclik = x;													// Make next drag-measurement from here.
	yMclik = y;
};

function myMouseUp(ev, gl, canvas) {
  //==============================================================================
  // Called when user RELEASES mouse button pressed previously.
  // 									(Which button?   console.log('ev.button='+ev.button);    )
  // 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage
  //		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)

  // Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
  var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
  var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
  //  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);

	// Convert to Canonical View Volume (CVV) coordinates too:
  var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);

	isDrag = false;											// CLEAR our mouse-dragging flag, and
	// accumulate any final bit of mouse-dragging we did:
	xMdragTot += (x - xMclik);
	yMdragTot += (y - yMclik);
};

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();

function animate(angle) {
  //==============================================================================
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;

  // Update the current rotation angle (adjusted by the elapsed time)
  //  limit the angle to move smoothly between +20 and -85 degrees:
  //  if(angle >  120.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
  //  if(angle < -120.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;

  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

function myKeyDown(ev) {
  //===============================================================================
  // Called when user presses down ANY key on the keyboard, and captures the
  // keyboard's scancode or keycode(varies for different countries and alphabets).
  //  CAUTION: You may wish to avoid 'keydown' and 'keyup' events: if you DON'T
  // need to sense non-ASCII keys (arrow keys, function keys, pgUp, pgDn, Ins,
  // Del, etc), then just use the 'keypress' event instead.
  //	 The 'keypress' event captures the combined effects of alphanumeric keys and // the SHIFT, ALT, and CTRL modifiers.  It translates pressed keys into ordinary
  // ASCII codes; you'll get the ASCII code for uppercase 'S' if you hold shift
  // and press the 's' key.
  // For a light, easy explanation of keyboard events in JavaScript,
  // see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
  // For a thorough explanation of the messy way JavaScript handles keyboard events
  // see:    http://javascript.info/tutorial/keyboard-events
  //

	switch(ev.keyCode) {			// keycodes !=ASCII, but are very consistent for
	//	nearly all non-alphanumeric keys for nearly all keyboards in all countries.
		case 37:		// left-arrow key
			// print in console:
			xMdragTot -= CTRL_STEP;
      break;
		case 38:		// up-arrow key
      yMdragTot += CTRL_STEP;
			break;
		case 39:		// right-arrow key
      xMdragTot += CTRL_STEP;
  		break;
		case 40:		// down-arrow key
			yMdragTot -= CTRL_STEP;
  		break;
    case 67:    // 'c' key
      clearDrag();
      break;
    case 86:
      animateSF();
      break;
    default:
      document.getElementById('errorMessage').innerHTML =
      "That key is invalid."
      break;
	}
}
