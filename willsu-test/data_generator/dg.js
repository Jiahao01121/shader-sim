// data generator

const fs = require('fs');
const d3 = require('d3');
const _ = require('underscore');


function Utils() {
  this.scale = d3.scaleLinear()
    .domain([0, 50000])
    .range([0,1]);
}

function generator(){
  var data = [];
  var util = new Utils();
  for (var i = 0; i < 1048576; i++) {
    data[i] = {
      'x': util.scale( Math.abs(Math.cos(i*.6)) *50000 ),
      'y': util.scale( Math.random() *50000 ),
      'z': util.scale( Math.abs(Math.sin(i*.1)) *50000 +Math.random() *7000 ),
    }

  }
 return data;
}

function init(){

  out();

}

function out(){
  var data = generator();

  fs.writeFileSync( './sample.json', JSON.stringify(data),'utf8');
}

init()
