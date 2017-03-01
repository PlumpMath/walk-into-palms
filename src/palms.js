import PalmGenerator from './PalmGenerator.js';
import {BoxGeometry, BufferAttribute, BufferGeometry} from 'three';
import LeafGeometry from './LeafGeometry.js';

export default class Palms{
    //questo file deve generare solo 2 o tre palme e restituirle in un array
    constructor(){
        let n_palms = 2;
        let trunkGeometry = new BoxGeometry(5,5,5);
        let palms = [];
        for (let i =0; i< n_palms; i++){
            let leafGeometry = new LeafGeometry(this.leafOptions()[i]);
            let palm = new PalmGenerator(leafGeometry, trunkGeometry, this.palmOptions()[i]);
            let geometry = palm.geometry;
            let bufGeometry = new BufferGeometry().fromGeometry(geometry);
            let palmBuffers = palm.buffers;
            bufGeometry.addAttribute( 'angle', new BufferAttribute(
                palmBuffers.angle,
                1));

            palms.push(bufGeometry);
        }
        return palms;
    }

    leafOptions(){
        let leaf_one = {
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
        let leaf_two = {
            length: 50,
            length_stem: 26,
            width_stem: 0.5,
            leaf_width: 0.30,
            leaf_up: 0.1,
            density: 11,
            curvature: 0.01,
            curvature_border: 0.01,
            leaf_inclination: 1
        };
        let leaf_three = {
             trunk_regular : true,
             length : 57,
             length_stem : 20,
             width_stem : 0.2,
             leaf_width : 0.9,
             leaf_up : 6,
             density : 15,
             curvature : 0.05,
             curvature_border : 0.007,
             leaf_inclination : 1
        };
        return [leaf_one, leaf_two, leaf_three];
    }

    palmOptions(){
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
            buffers: true,
            angle_open: 52.93,
            starting_angle_open: 50
         };

        let palm_three = {
             spread : 0.30000000000000004,
             angle : 137.5,
             num : 394,
             growth : 0.25,
             foliage_start_at : 33.5190580237922,
             angle_open : 75.43439808552704,
             starting_angle_open : 65.17358582180142
        };

        let options = [palm_one, palm_two, palm_three];
        return options;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}
