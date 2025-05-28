class Camera {
    constructor() {
        this.eye = new Vector3([0, -0.4, 0.5]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
        this.lastMouseX = null;
        this.lastMouseY = null;
        this.mouseSensitivity = 0.003;
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

    moveForward() {
        let fVec = this.at.sub(this.eye).normalize();
        this.eye = this.eye.add(fVec);
        this.at = this.at.add(fVec);    
    }

    moveBackwards() {
        let bVec = this.at.sub(this.eye).normalize();
        this.eye = this.eye.sub(bVec);
        this.at = this.at.sub(bVec);    
    }
    moveRight() {
        let fVec = this.at.sub(this.eye).normalize();
        let rVec = fVec.cross(this.up).normalize();
        this.eye = this.eye.add(rVec);
        this.at = this.at.add(rVec);
    }
    moveLeft() {
        let fVec = this.at.sub(this.eye).normalize();
        let rVec = fVec.cross(this.up).normalize();
        this.eye = this.eye.sub(rVec);
        this.at = this.at.sub(rVec);
    }
    goUp() {
        var t = new Vector3([0,1,0]);
        this.eye = this.eye.add(t);
    }
    goDown() {
        var t = new Vector3([0,1,0]);
        this.eye = this.eye.sub(t);
    }
    rotateAroundAxis(v, axis, angleRad) {
        // below debugged with https://chat.openai.com/
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const cross = new Vector3([
            axis.y * v.z - axis.z * v.y,
            axis.z * v.x - axis.x * v.z,
            axis.x * v.y - axis.y * v.x]
        );
        const dot = axis.x * v.x + axis.y * v.y + axis.z * v.z;
        return new Vector3([
            v.x * cos + cross.x * sin + axis.x * dot * (1 - cos),
            v.y * cos + cross.y * sin + axis.y * dot * (1 - cos),
            v.z * cos + cross.z * sin + axis.z * dot * (1 - cos)]
        );
    }
    panLeft(degrees = 5) {
        const angleRad = degrees * Math.PI / 180;

        let dir = this.at.sub(this.eye);         // Direction vector
        let up = this.up.normalize();            // Rotation axis
        let rotatedDir = this.rotateAroundAxis(dir, up, angleRad);

        this.at = this.eye.add(rotatedDir);      // New 'at'
    }

    panRight() {
        this.panLeft(-5);
    }
    onMouseMove(event) {
        // below debugged with https://chat.openai.com/
        if (this.lastMouseX === null || this.lastMouseY === null) {
            this.lastMouseX = event.clientX;
            this.lastMouseY = event.clientY;
            return;
        }
        const dx = event.clientX - this.lastMouseX;
        const dy = event.clientY - this.lastMouseY;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        const yawAngle = -dx * this.mouseSensitivity;
        const pitchAngle = -dy * this.mouseSensitivity;
        let dir = this.at.sub(this.eye);
        dir = this.rotateAroundAxis(dir, this.up.normalize(), yawAngle);
        const right = dir.cross(this.up).normalize();
        dir = this.rotateAroundAxis(dir, right, pitchAngle);
        this.at = this.eye.add(dir);
    }
}

