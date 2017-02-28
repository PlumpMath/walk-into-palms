/* eslint-env browser */
import * as THREE from 'three';
import $ from "jquery";
import Tone from 'tone';

import Gui from './gui.js';
import Stats from 'stats.js';
import CollectionGeometries from './geometries.js';
import CollectionMaterials from './materials.js';
import {createPath} from './path.js';
import {loadAudio} from './audio_loader.js';
import Scenography from './scenography.js';
import Pool from './pool.js';
import {fragmentShader, vertexShader} from './shaders.js';
const OrbitControls = require('three-orbit-controls')(THREE);
import {PointLights} from './pointLights.js';

const debug = true;
let gui, scene, renderer, stats, pool, scenography, controls, camera, spline, materials;


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

// objects
const poolSize = 12;
const percent_covered = 0.2; // it means that objects will be placed only in the
// 20% part of the curve in front of the camera. It has to be tuned with the fog
const distance_from_path = 30;
let palmMaterial;

// AUDIO
let fftSize=32;
var fft = new Tone.Analyser("fft", fftSize);
// check property "smoothing", it does the decayRate I thinnk
let player = new Tone.Player("../Adventura.mp3").fan(fft).toMaster();
player.autostart = true;
player.loop = true;
var loadedAudio = new Promise(function(done){
		Tone.Buffer.on("load", done);
});
loadedAudio.then(init());

function init(){
    gui = new Gui();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    materials = new CollectionMaterials;

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.style.margin =0;
    document.body.appendChild(renderer.domElement);
    camera.position.z = cameraHeight;
    controls = new OrbitControls(camera, renderer.domElement);

    //scenography
    let fakeCamera = new THREE.Mesh(new THREE.BoxGeometry(30,30,30), materials["lambert"]);
    //scene.add(fakeCamera);
    spline = createPath(radius, radius_offset);
    scenography = new Scenography(camera, spline, t, cameraHeight, cameraSpeed);

    //stats
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom

    //palms
    palmMaterial = getMaterial();
    pool = new Pool(poolSize, scene, spline, percent_covered, distance_from_path, palmMaterial);

    //lights
    let ambientLight = new THREE.AmbientLight( 0x000000 );
    scene.add( ambientLight );
    gui.addScene(scene, ambientLight, renderer);
    gui.addMaterials(materials);

    PointLights().map((light) => {
        scene.add( light );
    });

    window.addEventListener('resize', function() {
        var WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    });

    addStats(debug);
    addAxis(debug);
    addPathToScene(scene, spline);
    render();
}

function passAudioToMaterial(values){
    let magAudio;
		for (var i = 0, len = values.length; i < len; i++){
				var fftVal = values[i] / 255;
        fftVal = fftVal === 0 ? 0.05 : fftVal;
        fftVal = fftVal * gui.params.magMult;
        if (i === gui.params.selectedBin) {
            magAudio = fftVal;
        }
		}
    palmMaterial.uniforms.magAudio.value = values[magAudio];
}

function render(){
    stats.begin();
    scenography.update(1);
    pool.update(scenography.getCameraPositionOnSpline());
	  renderer.render(scene, camera);
    passAudioToMaterial(fft.analyse());
    stats.end();
	  requestAnimationFrame(render);
}

function addPathToScene(scene, curve){
    let geometry = new THREE.Geometry();
    geometry.vertices = curve.getPoints( curveDensity );
    let material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    // Create the final object to add to the scene
    let curveObject = new THREE.Line( geometry, material );
    scene.add(curveObject);
}


function addAxis(debug){
    if (debug) {
        var axisHelper = new THREE.AxisHelper( 50 );
        scene.add( axisHelper );
    }
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
        magAudio: {value: 0.0},
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

function lerp(start, end, pos){
    return start + (end - start) * pos;
}
