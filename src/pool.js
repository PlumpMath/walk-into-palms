import {BoxBufferGeometry, Mesh, Vector3} from 'three';
export default class Pool {
    constructor(size, scene, curve, percent_covered, distance_from_path, material){
        this.scene = scene;
        this.size = size;
        this.curve = curve;
        this.container = [];
        this.percent_covered = percent_covered;
        this.distance_from_path = distance_from_path;

        this.populatePool();
    }

    populatePool(){
        let tot_lenght_steps = 0;
        let step = this.percent_covered / this.size;
        let flip_direction = true;
        for (let i = 0; i < this.size; i++) {
            tot_lenght_steps += step;

            let obj = this.createObject();
            obj.name = i;
            obj.position_on_curve = tot_lenght_steps;
            let point = this.curve.getPoint(tot_lenght_steps);
            let tangentVector = this.curve.getTangent(tot_lenght_steps).multiplyScalar(
                this.distance_from_path, 0, this.distance_from_path);
            let axis = new Vector3( 0, 1, 0 );
            let angle = Math.PI / 2;
            // there is no function to get the secant. I take the tangen and i rotate it
            let secantVector = tangentVector.applyAxisAngle( axis, angle );
            let bla;
            if(flip_direction){
                bla = point.add(secantVector);
            }else{
                bla = point.sub(secantVector);
            }
            console.log(bla);
            obj.position.set(bla.x, bla.y, bla.z);
            this.container.push(obj);
            this.scene.add(obj);
            flip_direction = !flip_direction;
        }
    }

    _pointsOnTheCurveWithObjects(){
        let validPoints = Math.abs(this.curve.points * this.percent_covered);

    }

    createObject(){
        let box = new BoxBufferGeometry(10,10,10);
        let mesh = new Mesh(box, this.material);
        return mesh;
    }

    update(camera_position_on_spline){
        //if camera position on spline is bigger than a palm
        //it means that this palm is no longer into the scene, put it back
        // here there is an error, when you are at postion 9.5 in the curve you have still to be able to see
        // the palms in position 0.1. handle this case

    }
}
