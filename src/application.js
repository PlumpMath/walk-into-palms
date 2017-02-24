/* eslint-env browser */
import * as THREE from 'three';
import {Perlin} from './perlin.js';
import Gui from './gui.js';
import Stats from 'stats.js';
import CollectionGeometries from './geometries.js';
import CollectionMaterials from './materials.js';

const gui = new Gui();
const debug = true;
const scene = new THREE.Scene();
const OrbitControls = require('three-orbit-controls')(THREE);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.style.margin =0;
document.body.appendChild(renderer.domElement);
camera.position.z = 80;
this.controls = new OrbitControls(camera, renderer.domElement);


//camera
var cameraSpeedDefault = 0.00008;
var cameraSpeed = cameraSpeedDefault;
var jumpFrequency = 0.0009; // how often is the camera jumping
var cameraZposition = 100;
var curveDensity = 600; // how many points define the path
var cameraHeight = 15; // how high is the camera on the y axis

//curve
let spline;
let t = 0;
const radius = 200;
const radius_offset = 100;

// stats
const stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom

//scene
const materials = new CollectionMaterials;
const geometries = new CollectionGeometries;
var objects = [];
var group = new THREE.Group();

//lights
let ambientLight = new THREE.AmbientLight( 0x000000 );
scene.add( ambientLight );
gui.addScene(scene, ambientLight, renderer);
gui.addMaterials(materials);

let lights = [];
lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 0 ].position.set( 0, 200, 0 );
lights[ 1 ].position.set( 100, 200, 100 );
lights[ 2 ].position.set( - 100, - 200, - 100 );

scene.add( lights[ 0 ] );
scene.add( lights[ 1 ] );
scene.add( lights[ 2 ] );

var axisHelper = new THREE.AxisHelper( 50 );
scene.add( axisHelper );

window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
});

addStats(debug);
spline = createPath();
addPathToScene(scene, spline);
render();


function createPath(){
    //Create a closed wavey loop
    let complete_round = Math.PI * 2;
    let definition = 0.05; //the smaller, the higher the definition of the curve
    let vertices = [];
    let perlin = new Perlin(Math.random());
    let x_offset = 0;
    for (let angle = 0; angle <= complete_round; angle+= definition){
        let noise = perlin.noise(x_offset, 0, 0);
        //console.log(noise);
        let smoothed_offset = smoothLastPoints(radius_offset, angle, complete_round);
        let offset = map(noise, 0 ,1 , -smoothed_offset, smoothed_offset);
        console.log(offset);
        let r = radius + offset;
        let x = r * Math.cos(angle);
        let z = r * Math.sin(angle);
        let v = new THREE.Vector3(x,0, z);
        vertices.push(v);
        x_offset += 0.1;
    }
    let curve = new THREE.CatmullRomCurve3(vertices);
    curve.closed = true;
    return curve;
}

function smoothLastPoints(offset, angle, round){
    // this function is to close the circle in a more uniform way
    let arc_to_smooth =round * 0.92;
    if(angle >= arc_to_smooth){
        let smoothed = map(angle,arc_to_smooth, round, radius_offset, 0);
        return smoothed;
    }else{
        return offset;
    }
}

function addPathToScene(scene, curve){
    let geometry = new THREE.Geometry();
    geometry.vertices = curve.getPoints( curveDensity );
    let material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    // Create the final object to add to the scene
    let curveObject = new THREE.Line( geometry, material );
    scene.add(curveObject);
}


function addStats(debug) {
    if (debug) {
        document.body.appendChild(stats.domElement);
    }
}

function map(val, in_min, in_max, out_min, out_max) {
    return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};


function moveCamera(spline) {
    var camPos = spline.getPoint(t);
    var yPos;
    if (false) {
        var sinYpos = Math.sin(new Date().getTime() * jumpFrequency) * cameraHeight;
        yPos = sinYpos.map(-cameraHeight, cameraHeight, cameraHeight, (cameraHeight * 1.2));
    } else {
        yPos = cameraHeight;
    }
    camera.position.set(camPos.x, yPos, camPos.z);

    // the lookAt position is just 20 points ahead the current position
    // but when we are close to the end of the path, the look at point
    // is the first point in the curve
    var next = t + cameraSpeed * 20;
    var lookAtPoint = (next > 1) ? 0 : next;
    var look = spline.getPoint(lookAtPoint);
    look.y = yPos;
    camera.lookAt(look);

    var limit = 1 - cameraSpeed;
    t = (t >= limit) ? 0 : t += cameraSpeed;
}


function render(){
    stats.begin();
    //moveCamera(spline);
	  renderer.render(scene, camera);
    stats.end();
	  requestAnimationFrame(render);
}
