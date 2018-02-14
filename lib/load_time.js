function Load_time_logger( ){
  this.t_start = Date.parse( new Date() );

  this.cal = function(dt){
    var res = Date.parse(dt) - this.t_start;
    console.log( res + 'ms' );
  }
}

var load_time_logger = new Load_time_logger();
