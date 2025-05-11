const VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`;
// model matrix --> cube position
// global rotate
// viewMatrix --> look at
// uProjection --> gl perspective

// Fragment shader program
const FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor; // use color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1,1.0); // use uv debug color
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0,v_UV); //use texture0
    } else {
      gl_FragColor = vec4(1,.2,.2,1); // Error --> red-ish
    }
  }`;

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl",{preserveDrawingBuffer: true});
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
    gl.enable(gl.DEPTH_TEST);
  }
  
function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }
    // Get the storage location of a_Position
     a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
      console.log('Failed to get the storage location of u_ModelMatrix');
      return;
    }
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
      console.log('Failed to get the storage location of u_GlobalRotateMatrix');
      return;
    }
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
      console.log('Failed to get the storage location of a_UV');
      return;
    }
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
      console.log('Failed to get the storage location of u_Sampler0');
      return false;
    }
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
      console.log('Failed to get the storage location of u_whichTexture');
      return false;
    }
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
      console.log('Failed to get the storage location of u_ViewMatrix');
      return;
    }
    // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    // if (u_Size < 0) {
    //   console.log('Failed to get the storage location of u_Size');
    //   return;
    // }
    u_ProjectionMatrix= gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
      console.log('Failed to get the storage location of u_ProjectionMatrix');
      return;
    }
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  }

const g_shapesList = [];
let g_globalAngleX = 20;
let g_globalAngleY = 0;
let g_globalAngleZ = 0;
let midSlideAngle = 70;
let gunSlideAngle = 1;
let animationOn = false;
let poke = false;
function addActionsForHtmlUI(){
  document.getElementById('clearButton').onclick = function(){g_shapesList = []; renderScene(); console.log('clear');}; 
  document.getElementById('angleSlide').addEventListener('mousemove', function(){
    g_globalAngleX = this.value;
    renderScene();
  });
  document.getElementById('midSlide').addEventListener('mousemove', function(){
    midSlideAngle = this.value;
    renderScene();
  });
  document.getElementById('gunSlide').addEventListener('mousemove', function(){
    gunSlideAngle = this.value;
    renderScene();
  });
  document.getElementById('startAnimation').onclick = function(){animationOn=true;}; 
  document.getElementById('endAnimation').onclick = function(){animationOn=false}; 
  document.addEventListener('click', function(event) {
    if (event.shiftKey) {
      poke = true;
    }
  });
  }

  var g_startTime = performance.now()/1000.0;
  var g_seconds = performance.now()/1000.0 - g_startTime;
  var pokeStart = null;
  function updateAnimationAngles() {
    if (animationOn) {
      midSlideAngle = 35*Math.sin(g_seconds*3) + 35;
      gunSlideAngle = 14*Math.sin(g_seconds*2)+7;
    }
    if (poke) {
      if (pokeStart === null) {
        pokeStart = g_seconds + 3;
      } else if (pokeStart < g_seconds) {
        poke = false;
        // g_globalAngleX = 20;
        // g_globalAngleZ = 0;
      }
      // set start time if first poked (if not null)
      // while within 2 seconds
      // if within 2 seconds do this:
      // otherwise restart
      g_globalAngleX = 360*Math.sin(g_seconds);
      g_globalAngleZ = 1000*Math.sin(g_seconds*0.04)+1000;  
    }
    
  }
  function tick() {
    g_seconds = performance.now()/1000.0 - g_startTime;
    // console.log(g_seconds);
    updateAnimationAngles();
    renderScene();
    requestAnimationFrame(tick);
  }

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){click(ev)};
  canvas.onmousemove = function(ev){if(ev.buttons==1){click(ev)}};
  // Specify the color for clearing <canvas>
  initTextures();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  requestAnimationFrame(tick);
}

function initTextures() {
  // Get the storage location of u_Sampler
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendImageToTEXTURE0(image); };
  // Tell the browser to load an image
  image.src = "sky.jpg";
  // add more textures later (have case statements)
  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  console.log('finished loadTexture');
  // gl.clear(gl.COLOR_BUFFER_BITs);   // Clear <canvas>

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}



function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return([x,y]);
}

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up = [0,1,0];

function renderScene(){
  var startTime = performance.now();
  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width/canvas.height, .1, 100); // deg, aspect, near, far
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(g_eye[0],g_eye[1],g_eye[2], g_at[0],g_at[1],g_at[2], g_up[0],g_up[1],g_up[2]); // eye, at, up
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  
  var globalRotMat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // second clear?
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // for(var i = 0; i < g_shapesList.length; i++) {
  //   g_shapesList[i].render();
  // }
  var c = new Cube();
  c.color = [1,1,0,1];
  c.matrix.scale(0.25,0.25,0.25);
  c.render();
  // non image textures will load first, others after
  var b = new Cube();
  b.color = [1,0,1,1];
  b.matrix.translate(-.1,.1,0,0);
  b.matrix.rotate(-30,1,0,0);
  b.matrix.scale(.2,.4,.2);
  b.textureNum = -1;
  b.render();
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), 'logging');
}

function click(ev) {
  let [x,y] = convertCoordinatesEventToGL(ev);
  g_globalAngleX = x*36;
  g_globalAngleY = y*36;
  renderScene();
}
