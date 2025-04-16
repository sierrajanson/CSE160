// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// globals
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  canvas = document.getElementById('webgl');
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl",{preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
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
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
// global variables related to html ui
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_segments=10;
let isOmbre = false;
var g_shapesList = [];
var drawCookie = false;
function addActionsForHtmlUI(){
  document.getElementById('green').onclick = function(){ g_selectedColor = [0.0,1.0,0.0,1.0]; isOmbre = false;};
  document.getElementById('red').onclick = function(){ g_selectedColor = [1.0,0.0,0.0,1.0]; isOmbre = false;};
  document.getElementById('clearButton').onclick = function(){g_shapesList = []; renderAllShapes(); console.log('clear');};
  document.getElementById('cookieButton').onclick = function(){
        drawCookie = true;
        point = new Triangle();
        point.drawCookie = drawCookie;
        drawCookie = false;
        g_shapesList.push(point);
        renderAllShapes();
  
    };
  document.getElementById('ombre').onclick = function(){isOmbre = true};
  document.getElementById('pointButton').onclick = function(){g_selectedType=POINT};
  document.getElementById('triButton').onclick = function(){g_selectedType=TRIANGLE};
  document.getElementById('circleButton').onclick = function(){g_selectedType=CIRCLE};

  document.getElementById('redSlide').addEventListener('mouseup', function(){g_selectedColor[0] = this.value/100;isOmbre = true;});
  document.getElementById('greenSlide').addEventListener('mouseup', function(){g_selectedColor[1] = this.value/100;isOmbre = true;});
  document.getElementById('blueSlide').addEventListener('mouseup', function(){g_selectedColor[2] = this.value/100;isOmbre = true;});
  document.getElementById('sizeSlide').addEventListener('mouseup', function(){g_selectedSize = this.value;});
  document.getElementById('segSlide').addEventListener('mouseup', function(){g_segments = this.value;});
  
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
  gl.clear(gl.COLOR_BUFFER_BIT);
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
function renderAllShapes(){
  gl.clear(gl.COLOR_BUFFER_BIT);

  // var len = g_points.length;
  var len = g_shapesList.length;
  
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

function click(ev) {
  // Store the coordinates to g_points array
  let [x,y] = convertCoordinatesEventToGL(ev);
  console.log('color', g_selectedColor.slice());
  let point;
  if (g_selectedType==POINT){
    point = new Point();
  } else if (g_selectedType==TRIANGLE) {
    point = new Triangle();
    point.drawCookie = false;
  } else {
    point = new Circle();
    point.segments = g_segments;
  }
  point.position = [x,y];
  if (isOmbre) {
    g_selectedColor[0] = (g_selectedColor[0] + 0.05)%1;
    g_selectedColor[1] = (g_selectedColor[1] + 0.1)%1;
    g_selectedColor[2] = (g_selectedColor[2] + 0.03)%1;
  }
  point.color=g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  renderAllShapes();
}
