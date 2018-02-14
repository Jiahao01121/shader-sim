uniform sampler2D t_oPos;
uniform sampler2D t_pos;

uniform sampler2D t_destination;

uniform vec2  resolution;



void main(){

  vec2 uv = gl_FragCoord.xy / resolution;

  // vec4 oPos = texture2D( t_oPos , uv );
  // vec4 pos  = texture2D( t_pos , uv );
  //
  // vec3 vel = pos.xyz - oPos.xyz;
  //
  // vec3 force = vec3( 0. , 0. , 0. );
  //

  // vel += force;

  vec4 pos_destination = texture2D(t_destination, uv);

  // vec3 newPos = pos.xyz + vel;
  vec3 newPos = pos_destination.xyz;

// color or not is not important
  gl_FragColor = vec4( newPos , 0.1 );
  // will su Feb2018


}
