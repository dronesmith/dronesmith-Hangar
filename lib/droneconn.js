'use strict';

var
  http = require('http'),
  events = require('events'),
  log = require('./log.js').getLogger(__filename),
  config = require('../config/config.js');

var DroneConn = function(url) {

  var emitter = new events.EventEmitter();

  var req = http.request({
    host: url,
    path: '/api/stream/',
    timeout: 200,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
  }, function(res) {
    var buf = ''; // stream buffer

    res.on('data', function (chunk) {
      var pos;

      buf += chunk;

      while ((pos = buf.indexOf('\n')) >= 0) {
        if (pos == 0) {
            buf = buf.slice(1);
            continue;
        }
        var line = buf.slice(0,pos);
        if (line[line.length-1] == '\r') {
          line = line.substr(0, line.length-1);
        }

        if (line.length > 0) {
          try {
            var obj = JSON.parse(line);

            // console.log('emitting', obj);
            emitter.emit('data', obj);
          } catch(e) {
            console.log(e);
          }
        }

        buf = buf.slice(pos + 1);
      }
    });

    res.on('end', function () {
      emitter = undefined;
    });
  });

  req.end();

  return emitter;
}

// DroneConn.prototype.

module.exports = DroneConn;
