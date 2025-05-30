class Parallelpiped{
    constructor(){
        this.type='parallelpiped';
        this.color=[1.0,1.0,1.0,1.0];
        this.pinch = 0.7;
        this.heightPinch = 1;
        // this.segments = 10;
        this.matrix = new Matrix4();
        this.vertices = [];
        this.buffer = null;
    }
    render(){
        if (this.buffer === null) {
            this.buffer = gl.createBuffer();
            if (!this.buffer) {
              console.log('Failed to create the buffer object');
              return -1;
            };
        }
        // CREDIT TO https://lfer58.github.io/landing-page/graphics/A2/src/BlockyAnimal.html
        // FOR CUBE SETUP!!!!
        // replaced Professor's exxample with this vertice setup from their "CubeMod.js" render() function
        let [r, g, b, a] = this.color;
        gl.uniform4f(u_FragColor, r, g, b, a);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
            
        let [x,y,z] = [0.5,0.5*this.heightPinch,0.5]
        var pinch = this.pinch;
        let c_1 = [-x, -y, -z*pinch] // bottom left  forward
        let c_2 = [ x, -y, -z*pinch] // bottom right forward
        let c_3 = [ x,  y, -z] // front left top
        let c_4 = [-x,  y*pinch, -z*pinch] // front right top
        let c_5 = [-x, -y,  z*pinch] // bottom front left?
        let c_6 = [ x, -y,  z] // bottom right back
        let c_7 = [ x,  y,  z] // top left back
        let c_8 = [-x,  y*pinch,  z*pinch] // top left  front

        // Pass the color of a point to u_fragColor uniform variable
        // gl.uniform4f(u_FragColor, r, g*0.75, b*0.75, a);
        var scale=[0.1,0.1,0.1];
        // Back of cube
        this.vertices.push(c_5[0],c_5[1],c_5[2], c_6[0],c_6[1],c_6[2], c_7[0],c_7[1],c_7[2]);
        this.vertices.push(c_5[0],c_5[1],c_5[2], c_8[0],c_8[1],c_8[2], c_7[0],c_7[1],c_7[2]);

        drawTriangle3D(this.vertices, this.buffer);
        this.vertices = [];

        scale=[0.9,0.9,0.9];
        gl.uniform4f(u_FragColor, r*scale[0], g*scale[1], b*scale[2], a);
        //left of cube
        this.vertices.push(c_1[0],c_1[1],c_1[2], c_4[0],c_4[1],c_4[2], c_8[0],c_8[1],c_8[2]);
        this.vertices.push(c_1[0],c_1[1],c_1[2], c_5[0],c_5[1],c_5[2], c_8[0],c_8[1],c_8[2]);
        
        // right of cube
        this.vertices.push(c_2[0],c_2[1],c_2[2], c_3[0],c_3[1],c_3[2], c_7[0],c_7[1],c_7[2]);
        this.vertices.push(c_2[0],c_2[1],c_2[2], c_6[0],c_6[1],c_6[2], c_7[0],c_7[1],c_7[2]);
        
        // bottom of cube
        this.vertices.push(c_1[0],c_1[1],c_1[2], c_2[0],c_2[1],c_2[2], c_6[0],c_6[1],c_6[2]);
        this.vertices.push(c_1[0],c_1[1],c_1[2], c_5[0],c_5[1],c_5[2], c_6[0],c_6[1],c_6[2]);

        gl.uniform4f(u_FragColor, r*scale[0], g*scale[1], b*scale[2], a);
        drawTriangle3D(this.vertices, this.buffer);
        this.vertices = [];
        
        // Front of cube
        this.vertices.push(c_1[0],c_1[1],c_1[2], c_2[0],c_2[1],c_2[2], c_3[0],c_3[1],c_3[2]);
        this.vertices.push(c_1[0],c_1[1],c_1[2], c_4[0],c_4[1],c_4[2], c_3[0],c_3[1],c_3[2]);

        scale=[0.8,0.8,0.8];
        gl.uniform4f(u_FragColor, r*scale[0], g*scale[1], b*scale[2], a);

        // top of cube
        this.vertices.push(c_4[0],c_4[1],c_4[2], c_3[0],c_3[1],c_3[2], c_7[0],c_7[1],c_7[2]);
        this.vertices.push(c_4[0],c_4[1],c_4[2], c_8[0],c_8[1],c_8[2], c_7[0],c_7[1],c_7[2]);

        drawTriangle3D(this.vertices, this.buffer);
    }
}

// drawCube(vertices) {


// }