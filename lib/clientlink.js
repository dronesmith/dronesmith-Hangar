'use strict';

var
  config = require('../config/config.js'),
  log = require('./log.js').getLogger(__filename),
  droneConn = require('./droneconn.js'),

  // Drone connections (TODO)
  dConn5 = new droneConn(config.endpoints[5])
  ;

function initClient(app) {
  // init clientside connection
  var io = require('socket.io').listen(app);

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

    socket.on('error', onSocketError);

    socket.on('disconnect', function() {
      log.info('[IO] Disconnect');

      // Clean up.
      socket.removeListener('error', onSocketError);
      dConn5.removeListener('data', onMavlinkData);
    });

    //
    // Drone Link Events
    //
    dConn5.on('data',  onMavlinkData);

    //
    // Event Handlers
    //
    function onSocketError(error) {
      log.warn('[IO]', error);
    }

    function onMavlinkData(data) {

      data['online'] = true;
      data['name'] = 'dssprint5';

      // TODO
      var sendData = {
        'dssprint5': data
      };
      socket.emit('telem', sendData);
    }

  });
};
