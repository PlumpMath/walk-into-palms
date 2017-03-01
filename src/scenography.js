export default class Scenography {
    constructor(camera, spline, t, cameraHeight, cameraSpeed, palmMaterial){
        this.material = palmMaterial;
        this.current_index_scene = null;
        this.spline = spline;
        this.camera = camera;
        this.t = t;
        this.cameraHeight = cameraHeight;
        this.cameraSpeed = cameraSpeed;
        this.scenes = this._populateScenes();
    }

    update(time_in_seconds){
        let current_schedule = this._schedule(time_in_seconds);
        if (current_schedule !== this.current_index_scene){
            this.current_index_scene = current_schedule;
            this._implementScene(current_schedule);
        }
        this._maybeMoveCamera(current_schedule);
    }

    _maybeMoveCamera(scene_id){
        let scene = this.scenes[scene_id];
        if (scene.followPath) {
            this._moveCamera();
        }
    }

    _moveCamera() {
        var camPos = this.spline.getPoint(this.t);
        this.camera.position.set(camPos.x, this.cameraHeight, camPos.z);

        // the lookAt position is just 20 points ahead the current position
        // but when we are close to the end of the path, the look at point
        // is the first point in the curve
        var next = this.t + this.cameraSpeed * 20;
        var lookAtPoint = (next > 1) ? 0 : next;
        var look = this.spline.getPoint(lookAtPoint);
        look.y = this.cameraHeight;
        this.camera.lookAt(look);

        var limit = 1 - this.cameraSpeed;
        this.t = (this.t >= limit) ? 0 : this.t += this.cameraSpeed;
    }

    _implementScene(scene_id){
        let scene = this.scenes[scene_id];
        if(scene.displacement){
            this.material.uniforms.displacement.value = scene.displacement;
        }

        if(scene.brightness){
            this.material.uniforms.brightness.value = scene.brightness;
        }

        if(scene.saturation){
            this.material.uniforms.saturation.value = scene.saturation;
        }

        if(scene.maxColor){
            this.material.uniforms.maxColor.value = scene.maxColor;
        }

        if(scene.minColor){
            this.material.uniforms.minColor.value = scene.minColor;
        }

        if(scene.amplitude){
            this.material.uniforms.amplitude.value = scene.amplitude;
        }


        if(scene.cameraHeight){
            this.cameraHeight = scene.cameraHeight;
        }

        if(scene.cameraSpeed && scene.followPath === true){
            this.cameraSpeed = scene.cameraSpeed;
        }
    }

    getCameraPositionOnSpline(){
        // it returns a value between 0 and 1. O when at the beginning
        // of the spline, 1 when at the end
        return this.t;
    }

    _schedule(time_in_seconds){
        if (time_in_seconds <=49 && time_in_seconds >=0) {
            return 0;
        } else if (time_in_seconds > 49 && time_in_seconds <=95) {
            return 1;
        } else if (time_in_seconds > 95 && time_in_seconds < 120) {
            return 2;
        }else {
            return 3;
        }
    }

    _populateScenes(){
        let intro = {
            selectedBin: 7.0,
            amplitude:7.0,
            maxColor:0.9,
            minColor: 0.6,
            saturation: 0.9,
            brightness: 0.5,
            speed: 0.005,
            followPath: true
        };

        let middle = {
            amplitude:7.0,
            selectedBin: 22,
            speed: 0.005,
            maxColor:1.0,
            minColor: 0.75,
            saturation: 0.9,
            brightness: 0.5,
            followPath: true
        };

        let end = {
            selectedBin: 19,
            amplitude:7.0,
            followPath: false,
            maxColor:0.53,
            minColor: 0.01,
            saturation: 0.78,
            brightness: 0.61,
            cameraPos:{x:802.134170585785, y:154.09441190059349, z:260.62919104477186}
        };

        //probably fade out
        let last = {
            selectedBin: 19,
            followPath: false
        };

        return [intro, middle, end, last];
    }

}



