'use strict';

var dss = require('../dronesmith-api');
var async = require('async');

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
  dss.postAPI(req.path, req.body, req.session, function(data, error) {
    if (error) {
      res.status(400).json({error: error});
    } else {
      res.json({data: data});
    }
  });
}

exports.delHandler = function(req, res, next) {
  dss.delAPI(req.path, req.session, function(data, error) {
    if (error) {
      res.status(400).json({error: error});
    } else {
      res.json({data: data});
    }
  });
}

exports.putHandler = function(req, res, next) {
  dss.putAPI(req.path, req.body, req.session, function(data, error) {
    if (error) {
      res.status(400).json({error: error});
    } else {
      res.json({data: data});
    }
  });
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

exports.checkDrones = function(req, res, next) {
  dss.getAPI('/api/drone', req.session, function(data, error) {

    if (!error && data) {
      var drones = data.drones;

      async
        .eachSeries (drones, function(drone, callback) {
          drone.online = false;
          dss.getAPI('/api/drone/'+drone.name+'/status', req.session, function(info, error) {
            if (!error && info) {
              drone.online = info.Online || false;
              if (info.Online) {
                drone['status'] = info;

                async
                  .parallel([
                    (cb) => { dss.getAPI('/api/drone/'+drone.name+'/info',     req.session, (info, error) => { drone['info'] = info;     cb(error, info);   }); },
                    (cb) => { dss.getAPI('/api/drone/'+drone.name+'/attitude', req.session, (info, error) => { drone['attitude'] = info; cb(error, info);   }); },
                    (cb) => { dss.getAPI('/api/drone/'+drone.name+'/position', req.session, (info, error) => { drone['position'] = info; cb(error, info);   }); },
                    (cb) => { dss.getAPI('/api/drone/'+drone.name+'/rates',    req.session, (info, error) => { drone['rates'] = info;    cb(error, info);   }); },
                    (cb) => { dss.getAPI('/api/drone/'+drone.name+'/mode',     req.session, (info, error) => { drone['mode'] = info;     cb(error, info);   }); }
                  ], (error, data) => { callback(error, drone); });
              } else {
                callback(null, drone);
              }
            } else {
              callback(null, drone);
            }
          });
        }, function() {
          return res.json({drones: drones});
        })
      ;
    } else {
      return res.json({drones: []});
    }
  });
}
