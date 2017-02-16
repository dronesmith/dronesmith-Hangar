'use strict';

var dss = require('../dronesmith-api');
var async = require('async');
var config = require('../../config/config.js');

exports.getUser = function(req, res, next) {
  dss.getUser(req.session.email, function(user, error) {
    if (error) {
      res.status(400).json({error: error});
    } else {
      res.json({user: user});
    }
  });
}

exports.postHandler = function(req, res, next) {
  dss.postAPI(req.path, req.body, function(data, error) {
    if (error) {
      res.status(400).json({error: error});
    } else {
      res.json({data: data});
    }
  });
}

exports.delHandler = function(req, res, next) {
  dss.delAPI(req.path, function(data, error) {
    if (error) {
      res.status(400).json({error: error});
    } else {
      res.json({data: data});
    }
  });
}

exports.putHandler = function(req, res, next) {
  dss.putAPI(req.path, req.body, function(data, error) {
    if (error) {
      res.status(400).json({error: error});
    } else {
      res.json({data: data});
    }
  });
}

exports.getHandler = function(req, res, next) {
  dss.getAPI(req.path, function(data, error) {
    if (error) {
      res.status(400).json({error: error});
    } else {

      res.json({data: data});
    }
  });
}

exports.checkDrones = function(req, res, next) {
  dss.getAPI('/api/drone/*', function(data, error) {

    if (!error) {

      return res.json({drones: { "Local Drone": data}});
    } else {
      return res.status(400).json({"error": error});
    }
  });
}
