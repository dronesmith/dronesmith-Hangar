'use strict';

var
  http = require('http'),
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  log = require('./log.js').getLogger(__filename),
  config = require('../config/config.js');

var DroneConn = function(url) {
  EventEmitter.call(this);

  this.url = url;
}

DroneConn.prototype.connect = function() {
  var scope = this;

  var updated = false;

  var checker = setInterval(function() {
    if (!updated) {
      clearInterval(checker);
      req.abort();
    } else {
      updated = false;
    }
  }, 5000);

  var req = http.request({
    host: this.url,
    path: '/api/stream/',
    timeout: 100,
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
            scope.emit('data', obj);
            updated = true;
          } catch(e) {
            log.error(e);
          }
        }

        buf = buf.slice(pos + 1);
      }
    });

    res.on('end', function () {
      scope.emit('noconn');
    });

    res.on('close', function() {
      scope.emit('noconn');
    });

    res.on('aborted', function() {
      scope.emit('noconn');
    });
  });

  req.on('error', function(data) {
    log.warn(data);
    scope.emit('noconn');
  });

  req.on('aborted', function(data) {
    scope.emit('noconn');
  });

  req.end();
}

util.inherits(DroneConn, EventEmitter);
module.exports = DroneConn;
