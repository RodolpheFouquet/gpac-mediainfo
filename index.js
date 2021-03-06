const spawnSync = require('child_process').spawnSync;
const exec = require('child_process').exec;


function parseLine(line, callback) {
  var typeRE = new RegExp('^(\\w+)$');
  var matches = typeRE.exec(line);
  if(matches) {
    callback(null, matches[1], null);
    return;
  }

  var keyValueRE = new RegExp('^(\.+)\\s+:\\s(.+)$');
  matches = keyValueRE.exec(line);
  if(!matches) {
    console.log(line);
    callback("Error: wrong mediainfo output", null, null);
  } else
    callback(null, matches[1], matches[2]);
};
function parseOutput(stdout, callback) {
  var lines = stdout.toString().split("\n");
  var output = {};

  output.format = {};
  output.tracks = [];
  var isTrack = false;
  for(var i = 0; i < lines.length; i++) {
    if(lines[i].length == 0)
      continue;
    var line = lines[i];
    parseLine(line, (err, key, value) => {
      if(err) {
        callback(err, output);
        return;
      }
      else if(value) {
        if(!isTrack)
          output.format[key.trim()] = value;
        else
          output.tracks[output.tracks.length-1][key.trim()] = value;
      }
      else {
        if(key != "General") {
          isTrack = true;
          output.tracks.push({ type: key });
        }
      }
    });
    i++;
  }
  callback(null, output);
}

module.exports = {
  mediainfo: function(file, callback) {
    exec('mediainfo ' + file, (error, stdout, stderr) => {
      parseOutput(stdout, callback);
    });
  },
  mediainfoSync: function(file, callback) {
    var output = spawnSync('mediainfo', [file]);
    parseOutput(output.stdout, callback);
  }

};
