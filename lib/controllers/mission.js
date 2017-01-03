'use strict';

var dss = require('../dronesmith-api');

var droneMissions = {};

exports.start = function(req, res, next) {
  if (!req.body) {
    return res.status(400).json({error: "mission required"});
  } else {
    droneMissions[req.body.name] = {
      chunk: req.body.mission,
      iter: 0,
      paused: false
    }

    setInterval(function() {
      // start mission

    }, 2000);

    return res.json({status: "OK"});
  }
}

exports.stop = function(req, res, next) {

}

exports.pause = function(req, res, next) {

}
