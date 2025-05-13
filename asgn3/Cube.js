class Cube{
    constructor(textureNum){
        this.type='cube';
        this.color=[1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
        this.vertices = [];
        this.vertexBuffer = null;
        this.textureNum = textureNum;
        this.uvBuffer = null;
    }
    render(){
        if (this.vertexBuffer === null) {
            this.vertexBuffer = gl.createBuffer();
            if (!this.vertexBuffer) {
              console.log('Failed to create the buffer object');
              return -1;
            };
        }
        let [r,g,b,a] = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, r,g,b,a);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        var x = 1;

        // FRONT FACE (z = 0)
        gl.uniform4f(u_FragColor, r * 0.9, g * 0.9, b * 0.9, a);
        drawTriangle3DUV([0,0,0, x,0,0, x,x,0], [0,0, 1,0, 1,1], this.vertexBuffer);
        drawTriangle3DUV([0,0,0, x,x,0, 0,x,0], [0,0, 1,1, 0,1], this.vertexBuffer);

        // BACK FACE (z = x)
        gl.uniform4f(u_FragColor, r * 0.8, g * 0.8, b * 0.8, a);
        drawTriangle3DUV([0,0,x, 0,x,x, x,x,x], [0,0, 0,1, 1,1], this.vertexBuffer);
        drawTriangle3DUV([0,0,x, x,x,x, x,0,x], [0,0, 1,1, 1,0], this.vertexBuffer);

        // RIGHT FACE (x = x)
        gl.uniform4f(u_FragColor, r * 0.8, g * 0.8, b * 0.8, a);
        drawTriangle3DUV([x,0,0, x,x,0, x,x,x], [0,0, 0,1, 1,1], this.vertexBuffer);
        drawTriangle3DUV([x,0,0, x,x,x, x,0,x], [0,0, 1,1, 1,0], this.vertexBuffer);

        // LEFT FACE (x = 0)   
        gl.uniform4f(u_FragColor, r * 0.8, g * 0.8, b * 0.8, a);
        drawTriangle3DUV([0,0,0, 0,0,x, 0,x,x], [0,0, 1,0, 1,1], this.vertexBuffer);
        drawTriangle3DUV([0,0,0, 0,x,x, 0,x,0], [0,0, 1,1, 0,1], this.vertexBuffer);

        // TOP FACE (y = x)
        gl.uniform4f(u_FragColor, r * 0.7, g * 0.7, b * 0.7, a);
        drawTriangle3DUV([0,x,0, 0,x,x, x,x,x], [0,0, 0,1, 1,1], this.vertexBuffer);
        drawTriangle3DUV([0,x,0, x,x,x, x,x,0], [0,0, 1,1, 1,0], this.vertexBuffer);

        // BOTTOM FACE (y = 0)
        gl.uniform4f(u_FragColor, r * 0.7, g * 0.7, b * 0.7, a);
        drawTriangle3DUV([0,0,0, x,0,0, x,0,x], [0,0, 1,0, 1,1], this.vertexBuffer);
        drawTriangle3DUV([0,0,0, x,0,x, 0,0,x], [0,0, 1,1, 0,1], this.vertexBuffer);
    }
    renderfaster() {
        var savedVerts = [0,0,0, 1,0,0, 1,1,0,0,0,0, 1,1,0, 0,1,0, 0,0,1, 0,1,1, 1,1,1, 0,0,1, 1,1,1, 1,0,1, 1,0,0, 1,1,0, 1,1,1, 1,0,0, 1,1,1, 1,0,1, 0,0,0, 0,0,1, 0,1,1,0,0,0, 0,1,1, 0,1,0,0,1,0, 0,1,1, 1,1,1,0,1,0, 1,1,1, 1,1,0, 0,0,0, 1,0,0, 1,0,1, 0,0,0, 1,0,1, 0,0,1];
        var savedUV= [0,0, 1,0, 1,1, 0,0, 1,1, 0,1, 0,0, 0,1, 1,1, 0,0, 1,1, 1,0, 0,0, 0,1, 1,1, 0,0, 1,1, 1,0, 0,0, 1,0, 1,1, 0,0, 1,1, 0,1, 0,0, 0,1, 1,1, 0,0, 1,1, 1,0, 0,0, 1,0, 1,1, 0,0, 1,1, 0,1];
        let [r,g,b,a] = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, r,g,b,a);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        if (this.vertexBuffer === null) {
            this.vertexBuffer = gl.createBuffer();
            if (!this.vertexBuffer) {
              console.log('Failed to create the buffer object');
              return -1;
            };
        }
        if (this.uvBuffer === null) {
            this.uvBuffer = gl.createBuffer();
            if (!this.uvBuffer) {
              console.log('Failed to create the uvBuffer object');
              return -1;
            };
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(savedVerts), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(savedUV), gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);
        gl.drawArrays(gl.TRIANGLES,0,savedVerts.length/3);

    }
}


function drawCube(M) {
    var c = new Cube();
    c.matrix = M;
    c.render();
}