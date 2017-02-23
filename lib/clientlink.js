'use strict';

var
  config = require('../config/config.js'),
  log = require('./log.js').getLogger(__filename),
  droneConn = require('./droneconn.js'),

  droneConns = {},
  droneData = {}
  ;

function createDroneConn(name, addr) {
  droneConns[name] = new droneConn(addr);

  droneConns[name].connect();
  var connected = true;

  droneConns[name].on('noconn', function() {
   connected = false;
  });

  setInterval(function() {
   if (connected == false) {
     log.info("Attempting reconnect...");
     droneConns[name].connect();
     connected = true;
   }
  }, 5000);
}

function initClient(app) {
  // init clientside connection
  var io = require('socket.io').listen(app);

  for (var i = 0; i < config.endpoints.length; ++i) {
    createDroneConn((config.endpoints[i]).split('.')[0], config.endpoints[i]);
  }

  for (var k in droneConns) {
    droneConns[k].on('data', (data) => onMavlinkData({name: k, data: data}));
  }

  function onMavlinkData(ev) {

    var data = ev.data;
    var name = ev.name;

    data['online'] = true;
    data['name'] = name;

    droneData[name] = data;
  }

  return io;
}

module.exports = function(app) {
  var io = initClient(app);

  // Frontend link.
  io.on('connection', function(socket) {
    log.info('[IO] Connect');

    //
    // Socket Events
    //

    var hb = setInterval(function() {
      socket.emit('telem', droneData);
    }, 100);

    socket.on('error', onSocketError);

    socket.on('disconnect', function() {
      log.info('[IO] Disconnect');

      // Clean up.
      socket.removeListener('error', onSocketError);
      clearInterval(hb);
    });

    //
    // Event Handlers
    //
    function onSocketError(error) {
      log.warn('[IO]', error);
    }

  });
};
