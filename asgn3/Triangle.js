class Triangle{
    constructor(){
        this.type='triangle';
        this.position=[0.0,0.0,0.0];
        this.color=[1.0,1.0,1.0,1.0];
        this.size=5.0;
    }
    render(){
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_Size, 4.0);
        // var identityM = new Matrix4();
        // gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
        // var d = this.size/200.0;
    }
}
function drawTriangle(vertices) {
  var n = 3; // The number of vertices
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.TRIANGLES,0,n);
  return n;
}

function drawTriangle3D(vertices) {
  var n = 3; // The number of vertices
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  // gl.drawArrays(gl.TRIANGLES,0,vertices.length/3);
  gl.drawArrays(gl.TRIANGLES,0,n);
}

function drawTriangle3DUV(vertices, uv) {
  var n = 3;
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  var uvBuffer = gl.createBuffer();
  if (!uvBuffer) {
    console.log('failed to create buffe robject for uv');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);
  gl.drawArrays(gl.TRIANGLES,0,n);
}