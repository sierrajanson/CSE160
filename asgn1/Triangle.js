class Triangle{
    constructor(){
        this.type='triangle';
        this.position=[0.0,0.0,0.0];
        this.color=[1.0,1.0,1.0,1.0];
        this.size=5.0;
        this.drawCookie=false;
    }
    render(){
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
        // var xy = g_points[i];
        // var rgba = g_colors[i];
        // var size = g_sizes[i];
        // Pass the position of a point to a_Position variable
        // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_Size, size);
        // Draw
      //   gl.drawArrays(gl.POINTS, 0, 1);
        var d = this.size/200.0;
        drawTriangle([xy[0],xy[1],xy[0]+d,xy[1],xy[0],xy[1]+d]);

        if (this.drawCookie){
        rgba = [0.7,0.5,0.2,1];
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle([-0.3, 0, 0, 0.3, 0, -0.3]);
        rgba = [0.5,0.4,0.2,1];
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle([0.3, 0, 0, 0.3, 0, -0.3]);
        rgba = [0.35,0.25,0.1,1];
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        var coord_list = [
             [-0.215, -0.005, -0.19, -0.005, -0.215, 0.02],
            [0.045, 0.115, 0.07, 0.115, 0.045, 0.14],
            [-0.115, -0.045, -0.09, -0.045, -0.115, -0.019],
            [-0.09, 0.155, -0.065, 0.155, -0.09, 0.18],
            [0.18, -0.045, 0.205, -0.045, 0.18, -0.019],
            [-0.16, -0.095, -0.135, -0.095, -0.16, -0.07],
            [0.115, 0.045, 0.14, 0.045, 0.115, 0.07],
            [-0.165, 0.075, -0.14, 0.075, -0.165, 0.1],
            [-0.125, -0.12, -0.1, -0.12, -0.125, -0.095],
            [0.175, -0.02, 0.19, -0.02, 0.175, 0.005],
            [0.055, -0.045, 0.08, -0.045, 0.055, -0.019],
            [0.11, 0.07, 0.135, 0.07, 0.11, 0.095],
            [0, 0.075, 0.025, 0.075, 0, 0.1],
            [0.02, -0.14, 0.045, -0.14, 0.02, -0.115],
            [-0.09, -0.145, -0.065, -0.145, -0.09, -0.12],
            [-0.08, -0.035, -0.055, -0.035, -0.08, -0.01],
            [-0.15, 0.08, -0.125, 0.08, -0.15, 0.105],
            [-0.19, -0.06, -0.165, -0.06, -0.19, -0.0349],
            [-0.04, -0.125, -0.015, -0.125, -0.04, -0.1],
            [0.045, 0.115, 0.07, 0.115, 0.045, 0.14]
        ];
        for (const ele of coord_list) {
            drawTriangle(ele);
        }
    };

    }
}
function drawTriangle(vertices) {
  // var vertices = new Float32Array([
  //   0, 0.5,   -0.5, -0.5,   0.5, -0.5
  // ]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object gl.DYNAMIC_DRAW --> sending more data
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.TRIANGLES,0,n);
  return n;
}
