uniform sampler2D t_oPos;
uniform sampler2D t_pos;

uniform sampler2D t_destination;
uniform sampler2D t_origin;

uniform vec2  resolution;



void main(){
  // pixel index
  vec2 uv = gl_FragCoord.xy / resolution;

  vec4 oPos = texture2D( t_oPos , uv );
  vec4 pos  = texture2D( t_pos , uv );

  vec4 pos_destination = texture2D(t_destination, uv);
  vec4 pos_origin = texture2D(t_origin, uv);
  vec3 transitionDirection = pos_destination.xyz - pos_origin.xyz;

  float newPos_x;
  float force_x;

  //
  // force_x = smoothstep(0.,100.,transitionDirection.x) * normalize(transitionDirection.x);
  // newPos_x = oPos.x + force_x;

  if(transitionDirection.x > 0.){

      force_x = smoothstep(0.,100.,transitionDirection.x) * normalize(transitionDirection.x);

      newPos_x = oPos.x + force_x;

    if( pos_destination.x - pos.x <= 0. ) {
      force_x = 0.;
      newPos_x = pos.x;
    };
  }
  else if(transitionDirection.x == 0.){
      force_x = 0.;
      newPos_x = pos.x;
  }
  else if(transitionDirection.x < 0.){

      force_x = smoothstep(0.,-100.,transitionDirection.x) * normalize(transitionDirection.x);

      newPos_x = oPos.x + force_x;

    if( pos_destination.x - pos.x >= 0. ) {
      force_x = 0.;
      newPos_x = pos.x;
    };
  };




  gl_FragColor = vec4( newPos_x, pos.yz, 0.1 );

}
