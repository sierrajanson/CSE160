class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 3]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
    }

    getEye() {
        return this.eye.elements;
    }
    getAt() {
        return this.at.elements;
    }
    getUp() {
        return this.up.elements;
    }
    forward() {
        console.log('forwards!');
        console.log('at before sub', this.at.elements);
        var f = this.at.sub(this.eye);
        console.log('at after sub', this.at.elements);

        console.log('f not normalized: ', f.elements);
        var n = new Vector3(f);
        f = n.normalize();
        console.log('f nromalized: ', f.elements);
        console.log('at before sub', this.at.elements);
        this.at = this.at.add(f);
        console.log('at after sub', this.at.elements);
        // console.log('after: this.at ', this.at.elements);
        this.eye = this.eye.add(f);
        // console.log('after this.eye', this.eye.elements);
    }

    backward() {
        console.log('backwards!');
        var f = this.eye.sub(this.at);
        console.log('f not normalized: ', f).elements;
        var n = new Vector3(f);
        f = n.normalize();
        console.log('f nromalized: ', f.elements);
        this.at = this.at.add(f);
        this.eye = this.eye.add(f);
    }
}

