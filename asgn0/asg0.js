// DrawTriangle.js (c) 2012 matsuda

// Sierra Janson
// CSE 160
// some of implementation (select, canvas) is inspired from
// this video: https://www.youtube.com/watch?v=G7CDmeW7Lso&list=PLbyTU_tFIkcNplHMXN_G4sB0wjjmJuRpz&index=5
// ^ Lab: Assignment 0 - Fall 21 from UCSC CSE160

function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');
  // var v1 = Vector3([1,1,0]);
  // Draw a blue rectangle
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color
}

function clearCanvas() {
  var canvas = document.getElementById('example');  
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);   
}

function drawVector(v, color) {
  var canvas = document.getElementById('example');  
  var ctx = canvas.getContext('2d');
  // takes Vector3 v& string color
  // use lineTo() to draw vector v1
  // scale v1 coordinates by 20
  // v.x, v.y
  ctx.strokeStyle = color;
  const cx = canvas.width/2;
  const cy = canvas.height/2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + v.elements[0]*20, cy - v.elements[1]*20);
  ctx.stroke();

}

function handleDrawEvent() {
  clearCanvas();
  const x = document.getElementById('x_input').value;  
  const y = document.getElementById('y_input').value;
  const x2 = document.getElementById('x2_input').value;  
  const y2 = document.getElementById('y2_input').value;
  const v1 = new Vector3([x,y,0]);
  const v2 = new Vector3([x2,y2,0]);
  drawVector(v1, "red");
  drawVector(v2, "blue");
}

function angleBetween(v1,v2) {
  const v1_mag2 = v1.magnitude();
  const v2_mag2 = v2.magnitude();
  const prod = Vector3.dot(v1,v2);
  const cos_angle = prod/(v1_mag2 * v2_mag2);
  console.log('Angle: ', Math.acos(cos_angle) * (180 / Math.PI));
}

function areaTriangle(v1,v2) {
  const third_v = Vector3.cross(v1,v2);
  console.log("Area of the triangle: ", third_v.magnitude()/2);
}

function handleDrawOperationEvent() {
  clearCanvas();
  const x = document.getElementById('x_input').value;  
  const y = document.getElementById('y_input').value;
  const x2 = document.getElementById('x2_input').value;  
  const y2 = document.getElementById('y2_input').value;
  const v1 = new Vector3([x,y,0]);
  const v2 = new Vector3([x2,y2,0]);

  const operation = document.getElementById('operations').value;  
  drawVector(v1, "red");
  drawVector(v2, "blue");
  switch (operation) {
    case 'add':
      v1.add(v2);
      break;
    case 'sub':
      v1.sub(v2);
      break;
    case 'mul':
      const scalar = document.getElementById('scalar').value;
      v1.mul(scalar);
      v2.mul(scalar);
      drawVector(v2, "green");
      break;
    case 'div':
      const scalar2 = document.getElementById('scalar').value;
      v1.div(scalar2);
      v2.div(scalar2);
      drawVector(v2, "green");
      break;
    case 'mag':
      const v1_mag = v1.magnitude();
      const v2_mag = v2.magnitude();
      console.log('Magnitude v1: ', v1_mag);
      console.log('Magnitude v2: ', v2_mag);
      break;
    case 'nor':
      v1.normalize();
      v2.normalize();
      drawVector(v2, "green");
      break;
    case 'ang':
      angleBetween(v1,v2);
      break;
    case 'are':
      areaTriangle(v1,v2);
      break;
      // is this in degrees/radians / is it right?
    default:
      break
  }
  drawVector(v1, "green");
}