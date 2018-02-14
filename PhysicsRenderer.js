function PhysicsRenderer( size , shader , renderer ){

  // First Make sure everything Works
  this.checkCompatibility( renderer );
  this.renderer = renderer;
  //size of texture
  this.size = size || 128;
  //texture resolution (how big the texture)
  this.resolution = new THREE.Vector2( this.size , this.size );
  //total pixel with in texture
  this.s2   = size * size;
  this.renderer = renderer;
  this.clock = new THREE.Clock();


  // Sets up our render targets
  this.rt_1 = new THREE.WebGLRenderTarget( this.size, this.size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type:THREE.FloatType,
    stencilBuffer: false
  });
  this.rt_2 = this.rt_1.clone();
  this.rt_3 = this.rt_1.clone();
  this.rt_4 = this.rt_1.clone();

  this.counter = 0;

  this.debugScene = this.createDebugScene();

  //texture pass only excute once.
  this.texturePassProgram = this.createTexturePassProgram();

  // WHERE THE MAGIC HAPPENS
  //return shader material
  this.simulation = this.createSimulationProgram( shader );
  this.material = this.simulation;

  this.boundTextures = [];

  /*

    GPGPU Utilities
    From Sporel by Mr.Doob
    @author mrdoob / http://www.mrdoob.com

  */

  this.camera = new THREE.OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, 0, 1 );
  //buffer scene
  this.scene = new THREE.Scene();
  this.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 ) );
  this.scene.add( this.mesh );

} //main











PhysicsRenderer.prototype.checkCompatibility = function( renderer ){

  var gl = renderer.context;

  if ( gl.getExtension( "OES_texture_float" ) === null ) {
    this.onError( "No Float Textures");
    return;
  }

  if ( gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS ) === 0 ) {
    this.onError( "Vert Shader Textures don't work");
    return;
  }

}

PhysicsRenderer.prototype.onError = function( e ){
  console.log( e );
}

PhysicsRenderer.prototype.createDebugScene= function(){

  var debugScene = new THREE.Object3D();
  debugScene.position.z = 0;

  var geo = new THREE.PlaneBufferGeometry( 100 , 100 );

  var debugMesh = new THREE.Mesh( geo , new THREE.MeshBasicMaterial({
    map: this.rt_1
  }));
  debugMesh.position.set( -105 , 0 , 0 );

  debugScene.add( debugMesh );

  var debugMesh = new THREE.Mesh( geo , new THREE.MeshBasicMaterial({
    map: this.rt_2
  }));
  debugMesh.position.set( 0 , 0 , 0 );
  debugScene.add( debugMesh );

  var debugMesh = new THREE.Mesh( geo , new THREE.MeshBasicMaterial({
    map: this.rt_3
  }));
  debugMesh.position.set( 105, 0 , 0 );
  debugScene.add( debugMesh );

  var debugMesh = new THREE.Mesh( geo , new THREE.MeshBasicMaterial({
    map: this.rt_4
  }));
  debugMesh.position.set( 215, 0 , 0 );
  debugScene.add( debugMesh );

  return debugScene;

}

PhysicsRenderer.prototype.removeDebugScene = function( scene ){
  scene.remove( this.debugScene );
}

PhysicsRenderer.prototype.addDebugScene = function( scene ){
  scene.add( this.debugScene );
}

PhysicsRenderer.prototype.VSPass = [
  "varying vec2 vUv;",
  "void main() {",
  "  vUv = uv;",
  "  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
  "}"
].join("\n");

PhysicsRenderer.prototype.FSPass = [
  "uniform sampler2D texture;",
  "varying vec2 vUv;",
  "void main() {",
  "  vec4 c = texture2D( texture , vUv );",
  "  gl_FragColor = c ;",
  "}"
].join("\n");

PhysicsRenderer.prototype.createTexturePassProgram = function(){

  var uniforms = {
    texture:{  type:"t"  , value:null },
  }

  var texturePassShader = new THREE.ShaderMaterial({
    uniforms:uniforms,
    vertexShader:this.VSPass,
    fragmentShader:this.FSPass,
  });

  return texturePassShader;

}

PhysicsRenderer.prototype.createSimulationProgram = function(sim){

  this.simulationUniforms = {
    t_oPos:{      type:"t"  , value:null },
    t_pos:{       type:"t"  , value:null },
    resolution: { type:"v2" , value: this.resolution }
  }


  var program = new THREE.ShaderMaterial({

    uniforms:this.simulationUniforms,
    vertexShader:this.VSPass,
    fragmentShader:sim

  });

  return program;

}





PhysicsRenderer.prototype.update = function(){

  var flipFlop = this.counter % 3;

  if( flipFlop == 0 ){

    //set tpos and topos to simulation's uniform( those two all textures),
    //and compute the third as output.
    this.simulation.uniforms.t_oPos.value = this.rt_1;
    this.simulation.uniforms.t_pos.value = this.rt_2;

    this.pass( this.simulation, this.rt_3 );

    this.output = this.rt_3;

  }
  else if( flipFlop == 1 ){

    this.simulation.uniforms.t_oPos.value = this.rt_2;
    this.simulation.uniforms.t_pos.value = this.rt_3;

    this.pass( this.simulation , this.rt_1 );

    this.output = this.rt_1;


  }else if( flipFlop == 2 ){

    this.simulation.uniforms.t_oPos.value = this.rt_3;
    this.simulation.uniforms.t_pos.value = this.rt_1;

    this.pass( this.simulation , this.rt_2 );

    this.output = this.rt_2;

  }

  this.counter ++;

  this.bindTextures();

}

// Some GPGPU Utilities author: @mrdoob
PhysicsRenderer.prototype.render = function ( scene, camera, target ) {
  renderer.render( scene, camera, target, false );
};

PhysicsRenderer.prototype.pass = function ( shader , target ) {
  this.mesh.material = shader;
  this.renderer.render( this.scene, this.camera, target, false );

};

PhysicsRenderer.prototype.out = function ( shader ) {
  this.mesh.material = shader.material;
  this.renderer.render( this.scene, this.camera );
};

// Used if he have uniforms we want to update!
PhysicsRenderer.prototype.setUniforms = function( uniforms ){

  for( var propt in uniforms ){

    this.simulation.uniforms[ propt ]  = uniforms[ propt]

  }

  // Have to make sure that these always remain!
  this.simulation.uniforms.t_pos      = { type:"t"  , value:null            };
  this.simulation.uniforms.t_oPos     = { type:"t"  , value:null            };
  this.simulation.uniforms.resolution = { type:"v2" , value:this.resolution };

  console.log( this.simulation.uniforms );

}

PhysicsRenderer.prototype.setUniform = function( name , u ){
  this.simulation.uniforms[name] = u;
}

// resets the render targets to the from position
PhysicsRenderer.prototype.reset = function( texture , destiny_texture){
  //** main texture that created from resetRand.(random num generate from the loop)
  // this.texture = texture;
  this.texturePassProgram.uniforms.texture.value = texture;

  this.pass( this.texturePassProgram , this.rt_1 );
  this.pass( this.texturePassProgram , this.rt_2 );
  this.pass( this.texturePassProgram , this.rt_3 );

  this.texturePassProgram.uniforms.texture.value = destiny_texture;
  this.pass( this.texturePassProgram , this.rt_4 );
}
// resets the render targets to the from position(random)
PhysicsRenderer.prototype.resetRand = function( size , alpha ){
  //size here are the size of the boundary, not texture size.
  var size = size || 100;
  var data = new Float32Array( this.s2 * 4 );

  for( var i =0; i < data.length; i++ ){

    //console.log('ss');
    data[ i ] = (Math.random() - .5 ) * size;

    if( alpha && i % 4 ===3 ){
      data[i] = 0;
    }

  }


  var texture = new THREE.DataTexture(
    data,
    this.size,
    this.size,
    THREE.RGBAFormat,
    THREE.FloatType
  );

  texture.minFilter =  THREE.NearestFilter,
  texture.magFilter = THREE.NearestFilter,

  texture.needsUpdate = true;

  this.reset( texture);

}
// resets the render targets to the from position(base on data)
PhysicsRenderer.prototype.resetData = function(s, d){

  var size = s;
  var data_format = new Float32Array( this.s2 * 4 );

  for (var i = 0, j =0; j < data_format.length / 4 ; i+=4, j++ ) {

    data_format[i]     = d[j].x * size;
    data_format[i + 1] = d[j].y * size;
    data_format[i + 2] = d[j].z * size;

  }

  var texture = new THREE.DataTexture(
    data_format,
    this.size,
    this.size,
    THREE.RGBAFormat,
    THREE.FloatType
  );

  texture.minFilter =  THREE.NearestFilter,
  texture.magFilter = THREE.NearestFilter,

  texture.needsUpdate = true;

  // this.reset( texture);

  var data_destination = new Float32Array( this.s2 * 4 );

  for (var i = 0, j =0; j < data_format.length / 4 ; i+=4, j++ ) {

    data_destination[i]   = data_format[i];
    data_destination[i+1] = data_format[i+1];
    data_destination[i+2] = 1 * size;

  }

  var texture_destination = new THREE.DataTexture(
    data_destination,
    this.size,
    this.size,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  texture_destination.minFilter =  THREE.NearestFilter,
  texture_destination.magFilter = THREE.NearestFilter,
  texture_destination.needsUpdate = true;

  this.reset( texture, texture_destination );

}


// PhysicsRenderer.prototype.passTexture = function(  t1 , t2 ){
//
//   this.texturePassProgram.uniforms.texture.value = t1;
//   this.pass( this.texturePassProgram , t2 );
//
// }

PhysicsRenderer.prototype.addBoundTexture = function( uniform , value ){
  this.boundTextures.push( [ uniform , value ] );
}
PhysicsRenderer.prototype.bindTextures = function(){

  for( var i = 0; i < this.boundTextures.length; i++ ){

    var uniform = this.boundTextures[i][0];
    var textureToBind = this.boundTextures[i][1];

    uniform.value = this[ textureToBind ];

  }

}
