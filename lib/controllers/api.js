'use strict';

var dss = require('../dronesmith-api');
var async = require('async');
var config = require('../../config/config.js');

exports.getUser = function(req, res, next) {
  res.json({user: {}});
}

exports.postHandler = function(req, res, next) {
  var paths = req.path.split('/');
  var newpath = paths.slice(1).join('/');
  console.log(paths, paths[0], newpath);
  dss.postAPI(+paths[0], newpath, req.body, function(data, error) {
    if (error) {
      res.status(400).json({error: error});
    } else {
      res.json({data: data});
    }
  });
}

exports.delHandler = function(req, res, next) {
  dss.delAPI(0, req.path, function(data, error) {
    if (error) {
      res.status(400).json({error: error});
    } else {
      res.json({data: data});
    }
  });
}

exports.putHandler = function(req, res, next) {
  dss.putAPI(0, req.path, req.body, function(data, error) {
    if (error) {
      res.status(400).json({error: error});
    } else {
      res.json({data: data});
    }
  });
}

exports.getHandler = function(req, res, next) {
  dss.getAPI(0, req.path, function(data, error) {
    if (error) {
      res.status(400).json({error: error});
    } else {

      res.json({data: data});
    }
  });
}

exports.checkDrones = function(req, res, next) {
  // dss.getAPI(0, '/api/drone/*', function(data, error) {
  //
  //   if (!error) {
  //     return res.json({drones: { "Local Drone": data}});
  //   } else if (error.code == 'ENOTFOUND' || error.code == 'ETIMEDOUT') {
  //     return res.json({drones: {}});
  //   } else {
  //     return res.status(400).json({"error": error});
  //   }
  // });
}
