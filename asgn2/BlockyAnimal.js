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
let g_globalAngleX = 20;
let g_globalAngleY = 0;
let g_globalAngleZ = 0;
let midSlideAngle = 70;
let gunSlideAngle = 1;
let animationOn = false;
let poke = false;
function addActionsForHtmlUI(){
    document.getElementById('clearButton').onclick = function(){g_shapesList = []; renderAllShapes(); console.log('clear');}; 
    document.getElementById('angleSlide').addEventListener('mousemove', function(){
      g_globalAngleX = this.value;
      renderAllShapes();
    });
    document.getElementById('midSlide').addEventListener('mousemove', function(){
      midSlideAngle = this.value;
      renderAllShapes();
    });
    document.getElementById('gunSlide').addEventListener('mousemove', function(){
      gunSlideAngle = this.value;
      renderAllShapes();
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
  var globalRotMat = new Matrix4().rotate(g_globalAngleX, g_globalAngleY, 1, g_globalAngleZ);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // for(var i = 0; i < g_shapesList.length; i++) {
  //   g_shapesList[i].render();
  // }

  var base = new Cube();
  base.color = [0.8,0.8,0.8,1];
  base.matrix.translate(0,-0.5,0);
  base.pinch = 0.3;
  // base.matrix.rotate(0,-90,0,1);
  base.matrix.rotate(270,80,270,1);
  base.matrix.scale(1,0.25,0.5);
  base.render();
  var pinch = 0.4;
  var color = [1,1,1,1];
  var leftTopWing = new Cube();
  leftTopWing.pinch = pinch;
  leftTopWing.heightPinch = 0.25;
  // operations done bottom to up?
  leftTopWing.color = [0.9,0.9,0.9,1];
  leftTopWing.matrix.translate(-0.2,-0.4,0.35);
  leftTopWing.matrix.rotate(30,-150,0,-midSlideAngle);
  leftTopWing.matrix.scale(0.8,0.25,0.5);
  leftTopWing.matrix.translate(-0.5,0.5,0);
  var leftTopWingMat = new Matrix4(leftTopWing.matrix);
  leftTopWing.render();

  var leftBottomWing = new Cube();
  leftBottomWing.heightPinch = 0.15;
  leftBottomWing.pinch = pinch;
  // operations done bottom to up?
  leftBottomWing.color = color;
  leftBottomWing.matrix.translate(-0.2,-0.5,0.35);
  leftBottomWing.matrix.rotate(30,-150,0,midSlideAngle);
  leftBottomWing.matrix.scale(0.8,0.25,0.5);
  leftBottomWing.matrix.translate(-0.5,0.5,0);
  var leftBottomWingMat = new Matrix4(leftBottomWing.matrix);
  leftBottomWing.render();

  var rightTopWing = new Cube();
  rightTopWing.pinch = pinch;
  rightTopWing.heightPinch = 0.15;
  // operations done bottom to up?
  rightTopWing.color = color;
  rightTopWing.matrix.translate(0.2,-0.5,0.35);
  rightTopWing.matrix.rotate(30,-150,0,midSlideAngle);
  rightTopWing.matrix.scale(-0.8,0.25,0.5);
  rightTopWing.matrix.translate(-0.5,0.5,0);
  var rightTopWingMat = new Matrix4(rightTopWing.matrix);
  rightTopWing.render();

  var rightBottomWing = new Cube();
  rightBottomWing.pinch = pinch;
  rightBottomWing.heightPinch = 0.15;
  // operations done bottom to up?
  rightBottomWing.color = color;
  rightBottomWing.matrix.translate(0.2,-0.5,0.35);
  rightBottomWing.matrix.rotate(30,-150,0,-midSlideAngle);
  rightBottomWing.matrix.scale(-0.8,0.25,0.5);
  rightBottomWing.matrix.translate(-0.5,0.5,0);
  var rightBottomWingMat = new Matrix4(rightBottomWing.matrix);
  rightBottomWing.render();

  pinch = 1;
  color = [0.4,0.4,0.4,1];
  var topLeftGun = new Cube();
  topLeftGun.pinch = pinch;
  topLeftGun.color = color;
  topLeftGun.matrix.rotate(gunSlideAngle,gunSlideAngle,0,0);
  topLeftGun.matrix = leftTopWingMat; //gunSlideAngle
  topLeftGun.matrix.rotate(gunSlideAngle,gunSlideAngle,0,0);
  topLeftGun.matrix.scale(.03,.1,1.25);
  topLeftGun.matrix.translate(-17,1.0,-0.25);
  topLeftGun.render();

  var bottomLeftGun = new Cube();
  bottomLeftGun.pinch = pinch;
  bottomLeftGun.color = color;
  bottomLeftGun.matrix.rotate(gunSlideAngle,gunSlideAngle,0,0);
  bottomLeftGun.matrix = leftBottomWingMat;
  bottomLeftGun.matrix.rotate(gunSlideAngle,gunSlideAngle,0,0);
  bottomLeftGun.matrix.scale(.03,.1,1.25);
  bottomLeftGun.matrix.translate(-17,-1.0,-0.25);
  bottomLeftGun.render();

  var topRightGun = new Cube();
  topRightGun.pinch = pinch;
  topRightGun.color = color;
  topRightGun.matrix.rotate(gunSlideAngle,gunSlideAngle,0,0);
  topRightGun.matrix = rightTopWingMat;
  topRightGun.matrix.rotate(gunSlideAngle,gunSlideAngle,0,0);
  topRightGun.matrix.scale(.03,.1,1.25);
  topRightGun.matrix.translate(-17,1.0,-0.25);
  topRightGun.render();

  var bottomRightGun = new Cube();
  bottomRightGun.pinch = pinch;
  bottomRightGun.color = color;
  bottomRightGun.matrix.rotate(gunSlideAngle,gunSlideAngle,0,0);
  bottomRightGun.matrix = rightBottomWingMat;
  bottomRightGun.matrix.rotate(gunSlideAngle,gunSlideAngle,0,0);
  bottomRightGun.matrix.scale(.03,.1,1.25);
  bottomRightGun.matrix.translate(-17,-1.0,-0.25);
  bottomRightGun.render();

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), 'logging');
}

function click(ev) {
  let [x,y] = convertCoordinatesEventToGL(ev);
  g_globalAngleX = x*36;
  g_globalAngleY = y*36;
  renderAllShapes();
}
