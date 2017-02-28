import PalmGenerator from './PalmGenerator.js';
import {BoxGeometry} from 'three';
import LeafGeometry from './LeafGeometry.js';

export default class Palm{
    constructor(){
        let leaf_opt = {
            length: 60,
            length_stem: 20,
            width_stem: 0.2,
            leaf_width: 0.8,
            leaf_up: 1.5,
            density: 11,
            curvature: 0.04,
            curvature_border: 0.005,
            leaf_inclination: 0.9
        };

        let palm_opt = {
            spread: 0.1,
            angle: 137.5,
            num: 406,
            growth: 0.12,
            foliage_start_at: 56,
            trunk_regular: false,
            buffers: true,
            angle_open: 36.17,
            starting_angle_open: 50
        };

        let leafGeometry = new LeafGeometry(leaf_opt);
        let trunkGeometry = new BoxGeometry(5,5,5);
        let palm = new PalmGenerator(leafGeometry, trunkGeometry, this.randomPalmOpt());
        return palm;
    }


    randomPalmOpt(){
        let palm_one = {
            spread: 0.1,
            angle: 137.5,
            num: 406,
            growth: 0.12,
            foliage_start_at: 56,
            trunk_regular: false,
            buffers: true,
            angle_open: 36.17,
            starting_angle_open: 50
        };
        let palm_two = {
            spread: 0.30,
            angle: 135.71,
            num: 307,
            growth: 0.25,
            foliage_start_at: 48.52,
            trunk_regular: false,
            buffers: false,
            angle_open: 52.93,
            starting_angle_open: 50
         };

        let options = [palm_one, palm_two];
        return options[this.getRandomInt(0, (options.length -1))];
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}
