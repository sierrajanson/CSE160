class Cube{
    constructor(textureNum){
        this.type='cube';
        this.color=[1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
        this.vertices = [];
        this.buffer = null;
        this.textureNum = textureNum;
    }
    render(){
        if (this.buffer === null) {
            this.buffer = gl.createBuffer();
            if (!this.buffer) {
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
        drawTriangle3DUV([0,0,0, x,0,0, x,x,0], [0,0, 1,0, 1,1]);
        drawTriangle3DUV([0,0,0, x,x,0, 0,x,0], [0,0, 1,1, 0,1]);

        // BACK FACE (z = x)
        gl.uniform4f(u_FragColor, r * 0.8, g * 0.8, b * 0.8, a);
        drawTriangle3DUV([0,0,x, 0,x,x, x,x,x], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([0,0,x, x,x,x, x,0,x], [0,0, 1,1, 1,0]);

        // RIGHT FACE (x = x)
        gl.uniform4f(u_FragColor, r * 0.8, g * 0.8, b * 0.8, a);
        drawTriangle3DUV([x,0,0, x,x,0, x,x,x], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([x,0,0, x,x,x, x,0,x], [0,0, 1,1, 1,0]);

        // LEFT FACE (x = 0)
        gl.uniform4f(u_FragColor, r * 0.8, g * 0.8, b * 0.8, a);
        drawTriangle3DUV([0,0,0, 0,0,x, 0,x,x], [0,0, 1,0, 1,1]);
        drawTriangle3DUV([0,0,0, 0,x,x, 0,x,0], [0,0, 1,1, 0,1]);

        // TOP FACE (y = x)
        gl.uniform4f(u_FragColor, r * 0.7, g * 0.7, b * 0.7, a);
        drawTriangle3DUV([0,x,0, 0,x,x, x,x,x], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([0,x,0, x,x,x, x,x,0], [0,0, 1,1, 1,0]);

        // BOTTOM FACE (y = 0)
        gl.uniform4f(u_FragColor, r * 0.7, g * 0.7, b * 0.7, a);
        drawTriangle3DUV([0,0,0, x,0,0, x,0,x], [0,0, 1,0, 1,1]);
        drawTriangle3DUV([0,0,0, x,0,x, 0,0,x], [0,0, 1,1, 0,1]);
    }
}


function drawCube(M) {
    var c = new Cube();
    c.matrix = M;
    c.render();
}