import DAT from 'dat-gui';
import {Color, Fog} from 'THREE';

export default class Gui extends DAT.GUI{
    constructor(material){
        super(
            {
                load: JSON,
                preset: 'Flow'
            }
        );
        this.params = {
            magMult: 100.0,
            minColor:0.2,
            maxColor:0.4,
            saturation: 0.2,
            brightness: 0.2,
            displacement:0.9,
            selectedBin:0
        };
        this.material = material;

        this.add(this.params, 'magMult', 0.5, 100.0).step(1);
        this.add(this.params, 'selectedBin', 0, 32).step(1);
        this.add(this.params, 'minColor', 0.01, 1.0).step(0.01).onChange(this._onMinColorUpdate(this.material));
        this.add(this.params, 'maxColor', 0.01, 1.0).step(0.01).onChange(this._onMaxColorUpdate(this.material));
        this.add(this.params, 'saturation', 0.01, 1.0).step(0.01).onChange(this._onSaturationUpdate(this.material));
        this.add(this.params, 'brightness', 0.01, 1.0).step(0.01).onChange(this._onBrightnessUpdate(this.material));
        this.add(this.params, 'displacement', 0.01, 1.0).step(0.01).onChange(this._onDisplacementUpdate(this.material));;

    }

    addMaterial(material){
        this.material = material;
    }

    // credtis to these methods goes to Greg Tatum https://threejs.org/docs/scenes/js/material.js
    addScene ( scene, ambientLight, renderer ) {
	      let folder = this.addFolder('Scene');
	      let data = {
		        background : "#000000",
		        "ambient light" : ambientLight.color.getHex()
	      };

	      let color = new Color();
	      let colorConvert = this._handleColorChange( color );

	      folder.addColor( data, "background" ).onChange( function ( value ) {
		        colorConvert( value );
		        renderer.setClearColor( color.getHex() );

	      } );

	      folder.addColor( data, "ambient light" ).onChange( this._handleColorChange( ambientLight.color ) );
	      this.guiSceneFog( folder, scene );
    }

    guiSceneFog ( folder, scene ) {
	      let fogFolder = folder.addFolder('scene.fog');
	      let fog = new Fog( 0x3f7b9d, 0, 60 );
	      let data = {
		        fog : {
			          "THREE.Fog()" : false,
			          "scene.fog.color" : fog.color.getHex()
		        }
	      };

	      fogFolder.add( data.fog, 'THREE.Fog()' ).onChange( function ( useFog ) {
		        if ( useFog ) {
			          scene.fog = fog;
		        } else {
			          scene.fog = null;
		        }
	      } );
	      fogFolder.addColor( data.fog, 'scene.fog.color').onChange( this._handleColorChange( fog.color ) );
    }

    _handleColorChange ( color ) {
	      return function ( value ){
		        if (typeof value === "string") {
			          value = value.replace('#', '0x');
		        }
		        color.setHex( value );
        };
    }

    _onMinColorUpdate(material) {
	      return function ( value ){
            material.uniforms.minColor.value = value;
        };
    }

    _onMaxColorUpdate(material) {
	      return function ( value ){
            material.uniforms.maxColor.value = value;
        };
    }

    _onSaturationUpdate(material) {
	      return function ( value ){
            material.uniforms.saturation.value = value;
        };
    }

    _onBrightnessUpdate(material) {
	      return function ( value ){
            material.uniforms.brightness.value = value;
        };
    }

    _onDisplacementUpdate(material) {
	      return function ( value ){
            material.uniforms.displacement.value = value;
        };
    }

}
