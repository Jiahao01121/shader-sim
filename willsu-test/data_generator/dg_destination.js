const fs = require('fs');

var data = JSON.parse(fs.readFileSync('sample.json','utf8'));



for (var i = 0; i < data.length; i++) {
  data[i].z = 1
}

console.log(data);
fs.writeFileSync('./sample_destination.json',JSON.stringify(data),'utf8');
