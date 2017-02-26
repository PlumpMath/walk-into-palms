/* eslint-env browser */
import * as THREE from 'three';
import Gui from './gui.js';
import Stats from 'stats.js';
import CollectionGeometries from './geometries.js';
import CollectionMaterials from './materials.js';
import {createPath} from './path.js';
import Scenography from './scenography.js';
import Pool from './pool.js';

const gui = new Gui();
const debug = true;
const scene = new THREE.Scene();
const OrbitControls = require('three-orbit-controls')(THREE);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.style.margin =0;
document.body.appendChild(renderer.domElement);
camera.position.z = 50;
this.controls = new OrbitControls(camera, renderer.domElement);


//camera
var cameraSpeedDefault = 0.00008;
var cameraSpeed = cameraSpeedDefault;
var jumpFrequency = 0.0009; // how often is the camera jumping
var cameraZposition = 100;
var curveDensity = 600; // how many points define the path
var cameraHeight = 30; // how high is the camera on the y axis

//curve
let t = 0;
const radius = 200;
const radius_offset = 150;
let spline = createPath(radius, radius_offset);
// stats
const stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom

//scene
const materials = new CollectionMaterials;
const geometries = new CollectionGeometries;
var objects = [];
var group = new THREE.Group();

let fakeCamera = new THREE.Mesh(new THREE.BoxGeometry(30,30,30), materials["lambert"]);
//scene.add(fakeCamera);
let scenography = new Scenography(camera, spline, t, cameraHeight, cameraSpeed);

//lights
let ambientLight = new THREE.AmbientLight( 0x000000 );
scene.add( ambientLight );
gui.addScene(scene, ambientLight, renderer);
gui.addMaterials(materials);
import {fragmentShader, vertexShader} from './shaders.js';

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

// objects
const poolSize = 12;
const percent_covered = 0.2; // it means that objects will be placed only in the
// 20% part of the curve in front of the camera. It has to be tuned with the fog
const distance_from_path = 30;
//let mat = materials["phong"];
let mat = getMaterial();
let pool = new Pool(poolSize, scene, spline, percent_covered, distance_from_path, mat);



window.addEventListener('resize', function() {
    var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
});

addStats(debug);
addPathToScene(scene, spline);
render();



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


function moveCamera(spline) {
    var camPos = spline.getPoint(t);
    var yPos;
    yPos = cameraHeight;
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

function getMaterial(){
    let screenResolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    let tmp_uniforms = {
		    time: { value: 1.0 },
        color: {type: "c", value: new THREE.Color( 0xff3322 )},
		    uResolution: { value: screenResolution }
	  };
    //console.log(vertexShader());
    let material = new THREE.ShaderMaterial( {
	      uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib['lights'],
            tmp_uniforms
        ]),
        lights: true,
	      vertexShader: vertexShader(),
	      fragmentShader: fragmentShader()

    } );
    //console.log(material.vertexShader);
    return material;
}


function render(){
    stats.begin();
    scenography.update(1);
    pool.update(scenography.getCameraPositionOnSpline());
	  renderer.render(scene, camera);
    stats.end();
	  requestAnimationFrame(render);
}
