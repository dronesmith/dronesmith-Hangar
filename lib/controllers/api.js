'use strict';

var dss = require('../dronesmith-api');

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

}

exports.delHandler = function(req, res, next) {

}

exports.putHandler = function(req, res, next) {

}

exports.getHandler = function(req, res, next) {
  dss.getAPI(req.path, req.session, function(data, error) {
    if (error) {
      res.status(400).json({error: error});
    } else {
      res.json({data: data});
    }
  });
}
