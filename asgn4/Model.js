// import { Matrix4 } from "../lib/cuon-matrix";
// import { OBJLoader } from "../lib/OBJLoader";

class Model {
  constructor(filePath) {
    this.filePath = filePath;
    this.color = [1, 1, 1, 1];
    this.matrix = new Matrix4();
    this.loader = new OBJLoader(this.filePath);
    this.loader.parseModel().then(() => {
      this.modelData = this.loader.getModelData();
      this.vertexBuffer = gl.createBuffer();
      this.normalBuffer = gl.createBuffer();
      if (!this.vertexBuffer || !this.normalBuffer) {
        console.log("failed to created buffer for", this.filePath);
        return;
      }
    //   console.log(this.modelData);
    });
  }

  render() {
    // console.log(this.loader.isFullyLoaded);
    if (!this.loader.isFullyLoaded) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,new Float32Array(this.modelData.vertices),gl.DYNAMIC_DRAW
    );

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array(this.modelData.normals),
      gl.DYNAMIC_DRAW
    );

    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform4fv(u_FragColor, this.color);

    // let normalMatrix = new Matrix4().setInverseOf(this.matrix);
    // normalMatrix.transpose();
    // gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, this.modelData.vertices.length / 3);
  }
}
