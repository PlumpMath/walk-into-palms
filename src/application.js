/* eslint-env browser */
import * as THREE from 'three';
import $ from "jquery";
import Tone from 'tone';

import Gui from './gui.js';
import Stats from 'stats.js';
import {createPath} from './path.js';
import {loadAudio} from './audio_loader.js';
import Scenography from './scenography.js';
import Pool from './pool.js';
import {fragmentShader, vertexShader} from './shaders.js';
const OrbitControls = require('three-orbit-controls')(THREE);
import {PointLights} from './pointLights.js';

const debug = true;
let gui, scene, renderer, stats, pool, scenography, controls, camera, spline, current_time;

//camera
var cameraSpeedDefault = 0.0008;
var cameraSpeed = cameraSpeedDefault;
var cameraZposition = 100;
var curveDensity = 600; // how many points define the path
var cameraHeight = 70; // how high is the camera on the y axis

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
    var clock = new Tone.Clock(function(time){
        maybeChangeScene(time);
    }, 1);
    clock.start(0.0);
    current_time = 0;

    palmMaterial = getMaterial();
    gui = new Gui(palmMaterial);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.style.margin =0;
    document.body.appendChild(renderer.domElement);
    camera.position.z = cameraHeight;
    controls = new OrbitControls(camera, renderer.domElement);

    //scenography
    spline = createPath(radius, radius_offset);
    scenography = new Scenography(camera, spline, t, cameraHeight, cameraSpeed, palmMaterial);

    //stats
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom

    //palms
    pool = new Pool(poolSize, scene, spline, percent_covered, distance_from_path, palmMaterial);

    //lights
    let ambientLight = new THREE.AmbientLight( 0x000000 );
    scene.add( ambientLight );
    gui.addScene(scene, ambientLight, renderer);

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
        fftVal = fftVal;
        if (i === gui.params.selectedBin) {
            magAudio = fftVal;
        }
		}
    palmMaterial.uniforms.magAudio.value = magAudio;
}

function render(){
    stats.begin();
    palmMaterial.uniforms.magAudio.needUpdate = true;
    palmMaterial.uniforms.amplitude.needUpdate = true;
    palmMaterial.uniforms.minColor.needUpdate = true;
    palmMaterial.uniforms.maxColor.needUpdate = true;
    palmMaterial.uniforms.saturation.needUpdate = true;
    palmMaterial.uniforms.brightness.needUpdate = true;
    palmMaterial.uniforms.displacement.needUpdate = true;
    scenography.update(current_time);
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

function getMaterial(){
    let screenResolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    let tmp_uniforms = {
		    time: { value: 1.0 },
        magAudio: {value: 0.0},
        amplitude: {value: 0.0},
        displacement: {value: 0.0},
        minColor: {value: 0.2},
        maxColor: {value: 0.4},
        saturation: {value: 0.2},
        brightness: {value: 0.2},
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

function maybeChangeScene(time){
    current_time = time;
};

