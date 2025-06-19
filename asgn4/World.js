const VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec4 v_VertPos;
  varying vec3 v_Normal;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`;
// model matrix --> cube position
// global rotate
// viewMatrix --> look at
// uProjection --> gl perspective

// Fragment shader program
const FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform vec3 u_lightColor;
  uniform vec3 u_cameraPos;
  uniform vec3 u_lightPos;
  varying vec4 v_VertPos;
  uniform int u_whichTexture;
  uniform bool u_lightOn;
  uniform bool u_spotLightOn;
  uniform vec3 u_spotDirection;
  uniform float u_spotCutoff;
  void main() {
    if (u_whichTexture == -3) {
    gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor; // use color
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1,1.0); // use uv debug color
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0,v_UV); //use texture0
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
     } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
     } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
     } else {
      gl_FragColor = vec4(1,.2,.2,1); // Error --> red-ish
    }
    vec3 lightVector = u_lightPos-vec3(v_VertPos);
    // vec3 lightVector = vec3(v_VertPos)-u_lightPos;
    float r = length(lightVector);
    // light fall off
    // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);
    // n dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);
    // gl_FragColor = gl_FragColor * nDotL;
    // gl_FragColor.a = 1.0;
    vec3 R = reflect(-L, N);
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));
    float specular = pow(max(dot(E,R), 0.0), 15.0);

    vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7 * u_lightColor;
    vec3 ambient = vec3(gl_FragColor) * 0.3;
    if (u_lightOn) {
      if (u_whichTexture == -2) { // ball (normally colored objects)
        gl_FragColor = vec4(specular*u_lightColor+diffuse+ambient,1.0);
      } else {
        gl_FragColor = vec4(diffuse+ambient, 1.0);
       }
    }
    
    if (u_spotLightOn && u_lightOn) {
      float spotEffect = dot(normalize(-lightVector), normalize(u_spotDirection));
      if (spotEffect > u_spotCutoff) {
        // has spotlight effect
      } else {
        gl_FragColor = vec4(vec3(gl_FragColor) * 0.1, 1.0);
      }
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
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let camera;
let a_Normal;
let u_lightPos;
let u_lightOn;
let u_spotLightOn = false;
let spotDir = [0, -1, 0]; 
let cutoff = Math.cos((15 * Math.PI) / 180); 
let uLightColorLoc;

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
    uLightColorLoc = gl.getUniformLocation(gl.program, 'u_lightColor');
    if (!uLightColorLoc) {
      console.log('err');
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
    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
      console.log('failed to get storage location of u_lightPos');
      return;
    }
    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
      console.log('failed to get storage location of u_lightOn');
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
    a_Normal= gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
      console.log('Failed to get the storage location of a_Normal');
      return;
    }
    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
      console.log('Failed to get the storage location of u_cameraPos');
      return false;
    }
    u_spotLightOn = gl.getUniformLocation(gl.program, 'u_spotLightOn');
    if (!u_spotLightOn) {
      console.log('Failed to get the storage location of u_spotLightOn');
      return false;
    }
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
      console.log('Failed to get the storage location of u_Sampler0');
      return false;
    }
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
      console.log('Failed to get the storage location of u_Sampler1');
      return false;
    }
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
      console.log('Failed to get the storage location of u_Sampler2');
      return false;
    }
    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
      console.log('Failed to get the storage location of u_Sampler3');
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
let g_normalOn = false;
let g_lightPos=[0,1,-2];
let g_lightOn = true;
let g_spotLightOn = false;
let g_colorSlide = 0;
let redSliderValue = 1;
let greenSliderValue = 1;
let blueSliderValue = 1;

function updateLightColor() {
  const r = parseFloat(document.getElementById("redSlider").value);
  const g = parseFloat(document.getElementById("greenSlider").value);
  const b = parseFloat(document.getElementById("blueSlider").value);
  redSliderValue = r;
  greenSliderValue = g;
  blueSliderValue = b;
  gl.uniform3f(uLightColorLoc, r, g, b);
}

function addActionsForHtmlUI(){
  document.addEventListener('mousemove', (e) => camera.onMouseMove(e));
  // document.getElementById('angleSlide').addEventListener('mousemove', function(ev){
  //   // g_globalAngleX = this.value;

  //   renderScene();
  // });

  document.getElementById("redSlider").oninput = updateLightColor;
  document.getElementById("greenSlider").oninput = updateLightColor;
  document.getElementById("blueSlider").oninput = updateLightColor;

  document.getElementById('normalOn').onclick = function() {
    g_normalOn = true;
  }
  document.getElementById('normalOff').onclick = function() {
    g_normalOn = false; 
  }
  document.getElementById('lightOn').onclick = function() {
    g_lightOn = true; 
  }
  document.getElementById('lightOff').onclick = function() {
    g_lightOn = false; 
  }
  document.getElementById('spotLightOn').onclick = function() {
    g_spotLightOn = true; 
  }
  document.getElementById('spotLightOff').onclick = function() {
    g_spotLightOn = false; 
  }

  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev){if (ev.buttons == 1){g_lightPos[0] = this.value/100; renderScene();}});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev){if (ev.buttons == 1){g_lightPos[1] = this.value/100; renderScene();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev){if (ev.buttons == 1){g_lightPos[2] = this.value/100; renderScene();}});

}
  var g_startTime = performance.now()/1000.0;
  var g_seconds = performance.now()/1000.0 - g_startTime;
function updateAnimationAngles() {
  g_lightPos[0] = Math.cos(g_seconds);
  g_lightPos[1] = Math.sin(g_seconds);
  g_lightPos[2] = Math.sin(g_seconds);
}
  function tick() {
    g_seconds = performance.now()/1000.0 - g_startTime;
    let teapot = new Model(gl, "bunny.obj");

      teapot.color = [1,0.4,0.5,1];
  teapot.matrix.setScale(.5,.5,.5);
  teapot.matrix.rotate(240,0,1,0);
  teapot.matrix.translate(0.5,0.5,0.24);

  teapot.render(gl,gl.program);
    // console.log(g_seconds);
    renderScene();
    updateAnimationAngles();
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
  document.onkeydown = keydown;

  initTextures();
  camera = new Camera();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  requestAnimationFrame(tick);
}

function initTextures() {
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendImageToTEXTURE(image,0); };
  // Tell the browser to load an image
  image.src = "sky.jpg";
  // i don't think I'm loading both these textures right..
  var groundImage = new Image();  // Create the image object
  if (!groundImage) {
    console.log('Failed to create the groundImage object');
    return false;
  }
  // // Register the event handler to be called on loading an image
  groundImage.onload = function(){ sendImageToTEXTURE(groundImage,1); };
  // // Tell the browser to load an image
  groundImage.src = "grass.jpg";

  var skyImage = new Image();  // Create the image object
  if (!skyImage) {
    console.log('Failed to create the skyImage object');
    return false;
  }
  // // Register the event handler to be called on loading an image
  skyImage.onload = function(){ sendImageToTEXTURE(skyImage,2); };
  // // Tell the browser to load an image
  skyImage.src = "sky_square.png";

  var diamondImg = new Image();  // Create the image object
  if (!diamondImg) {
    console.log('Failed to create the diamondImg object');
    return false;
  }
  // // Register the event handler to be called on loading an image
  diamondImg.onload = function(){ sendImageToTEXTURE(diamondImg,3); };
  // // Tell the browser to load an image
  diamondImg.src = "diamond.png";
  // add more textures later (have case statements)
  return true;
}
//w : 87
//a : 65
//d : 68
//s : 83
//q : 81
//e : 69
function keydown(ev) {
  switch (ev.keyCode) { 
    case 87: // w
      camera.moveForward();
      break;
    case 83: // s
      camera.moveBackwards();
      break;
    case 68:
      camera.moveRight();
      break;
    case 65: // l
      camera.moveLeft();
      break;
    case 81:
      camera.panLeft();
      break;
    case 69:
      camera.panRight();
      break;
    case 32: // spacebar
      camera.goUp();
      break;
    case 16: // shift
      camera.goDown();
      break;
  }
  renderScene();
}

function sendImageToTEXTURE(image, num) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0+num);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);

  // Set the texture unit 0 to the sampler
  if (num === 0){
    gl.uniform1i(u_Sampler0, num);
  } else if (num === 1) {
    gl.uniform1i(u_Sampler1, num);
  } else if (num === 2) {
    gl.uniform1i(u_Sampler2, num);
  } else if (num === 3) {
    gl.uniform1i(u_Sampler3, num);
  }
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

function drawMap() {
  console.log('unneeded');
}


function renderScene(){
  var startTime = performance.now();
  var projMat = new Matrix4();
  projMat.setPerspective(90, canvas.width/canvas.height, .1, 100); // deg, aspect, near, far
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var g_eye = camera.getEye();
  var g_at = camera.getAt();
  var g_up = camera.getUp();
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
  var sky = new Cube();
  sky.color = [0,1,1,1];
  if (g_normalOn) {sky.textureNum=-3;}
  else {sky.textureNum = 2;}
  sky.matrix.scale(-5,-5,-5);
  sky.matrix.translate(-.5,-.5,-.5);
  sky.render();

  var floor = new Cube();
  floor.textureNum = 1;
  // floor.color = [0,1,0,1];
  floor.matrix.translate(0,-2,0);
  floor.matrix.scale(7.5,0.01,7.5);
  floor.matrix.translate(-.5,0,-0.5);
  floor.render();

  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, g_eye[0], g_eye[1], g_eye[2]);
  gl.uniform1i(u_lightOn, g_lightOn);
  gl.uniform1i(u_spotLightOn, g_spotLightOn);
  gl.uniform3fv(gl.getUniformLocation(gl.program, 'u_spotDirection'), spotDir);
  gl.uniform1f(gl.getUniformLocation(gl.program, 'u_spotCutoff'), cutoff);
  gl.uniform3f(uLightColorLoc, redSliderValue, greenSliderValue, blueSliderValue);

  var aCube = new Cube();
  aCube.color = [0,1,1,1];
  if (g_normalOn) {aCube.textureNum=-3;}
  else {aCube.textureNum = 3;}
  aCube.matrix.translate(-1.5,-1.5,-1.5);
  aCube.matrix.scale(0.5,0.5,0.5);
  aCube.matrix.translate(-1,0,-.5);
  aCube.render();

  var light = new Cube();
  light.color = [1,1,0,1];
  if (g_normalOn) {light.textureNum=-3;}
  else {light.textureNum = -2;}
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(.1,.1,.1);
  light.matrix.translate(-.5,-.5,-.5);
  light.render();

  var s = new Sphere();
  if (g_normalOn) {s.textureNum=-3;}
  else {s.textureNum = -2;}
  s.color = [1,1,0,1];
  s.matrix.translate(1.5,-1,-1);
  s.matrix.scale(0.6,0.6,0.6);
  s.render();

  // drawMap();
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), 'logging');

}

function click(ev) {
  let [x,y] = convertCoordinatesEventToGL(ev);
  // console.log('eye', camera.getEye());
  // console.log('click pos', camera.getAt());
  // g_globalAngleX = x*36;
  // g_globalAngleY = y*36;
  // renderScene();
}
