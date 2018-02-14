uniform sampler2D t_pos;

void main(){

  vec4 pos = texture2D( t_pos , position.xy );

  vec3 dif = cameraPosition - pos.xyz;

  gl_PointSize = min( 1. ,  0.1 / length( dif ));
  // gl_PointSize = 0.4;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos.xyz , 1. );


}
