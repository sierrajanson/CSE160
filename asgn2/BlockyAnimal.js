const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`;

// Fragment shader program
const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;


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
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  }

const g_shapesList = [];
let g_globalAngle = 0;
let midSlideAngle = 0;
let animationOn = false;
function addActionsForHtmlUI(){
    document.getElementById('clearButton').onclick = function(){g_shapesList = []; renderAllShapes(); console.log('clear');}; 
    document.getElementById('angleSlide').addEventListener('mousemove', function(){
      g_globalAngle = this.value;
      renderAllShapes();
    });
    document.getElementById('midSlide').addEventListener('mousemove', function(){
      midSlideAngle = this.value;
      renderAllShapes();
    });
    document.getElementById('startAnimation').onclick = function(){animationOn=true;}; 
    document.getElementById('endAnimation').onclick = function(){animationOn=false}; 

  }

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function updateAnimationAngles() {
  if (animationOn) {
    midSlideAngle = 45*Math.sin(g_seconds);
  }
}
function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;
  console.log(g_seconds);
  updateAnimationAngles();
  renderAllShapes();
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
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  requestAnimationFrame(tick);
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

function renderAllShapes(){
  var startTime = performance.now();
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // for(var i = 0; i < g_shapesList.length; i++) {
  //   g_shapesList[i].render();
  // }

  var bottom = new Cube();
  bottom.color = [1,1,0,1];
  bottom.matrix.translate(0,-0.5,0);
  bottom.matrix.rotate(0,0,0,1);
  bottom.matrix.scale(0.5,0.25,0.5);
  bottom.render();

  var middle = new Cube();
  // operations done bottom to up?
  middle.color = [0,0,1,1];
  middle.matrix.translate(0,-0.4,0);
  middle.matrix.rotate(-5,1,0,0);
  middle.matrix.rotate(-midSlideAngle,0,0,1);
  var middleCoordMatr = new Matrix4(middle.matrix);
  middle.matrix.scale(0.25,0.7,0.5);
  middle.matrix.translate(0,0.5,0);
  middle.render();
  // can move z part a little forward to prevent conflicting z's
  var top = new Cube();
  top.color = [1,0,1,1];
  top.matrix = middleCoordMatr;
  top.matrix.translate(0,0.75,0);
  // top.matrix.rotate(0,0,0,1);
  top.matrix.scale(0.15,0.25,0.1);
  top.render();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), 'logging');
}

function click(ev) {
  renderAllShapes();
}
