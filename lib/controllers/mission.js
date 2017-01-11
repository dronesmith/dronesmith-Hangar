'use strict';

var
  dss = require('../dronesmith-api'),
  async = require('async')
  ;

var droneMissions = {};

exports.init = function() {
  setInterval(function() {

    async
      .each(droneMissions, function(missionMeta, cb) {
        if (!missionMeta) {
          return;
        }

        var mission = missionMeta.chunk;
        var pos;

        var missionPrefix = missionMeta.name;

        dss.getAPI('/api/drone/'+missionMeta.name+'/position', missionMeta.apiInfo, (info, error) => {
          if (!error && info) {
            pos = info;

            if (missionMeta.state == 'takeoff') {

              if (!missionMeta.takeoffCnt) {
                missionMeta.takeoffCnt = 4;
              }

              console.log(missionPrefix, "| TAKEOFF STATE ");
              if (pos.Altitude > 28) {
                console.log(missionMeta.name + '|', 'Got target altitude');
                missionMeta.takeoffCnt--;
                if (missionMeta.takeoffCnt <= 1) {
                  missionMeta.state = 'goto';
                }
              }
            } else if (missionMeta.state == 'goto') {
              console.log(missionPrefix, "| GOTO STATE ");
              var path = mission[missionMeta.iter];
              var ll = path.startPoint;

              // TODO
              var alt = 0 /* * path.distance*/;

              console.log(missionMeta.name + ':', path.narrative);

              dss.postAPI('/api/drone/'+missionMeta.name+'/goto',
                {"lat": ll.lat, "lon": ll.lng, "altitude": alt},
                missionMeta.apiInfo, (info, error) => {
                  if (error) {
                    console.log(missionPrefix, "| ERROR ", error);
                  }
                  if (info) {
                    console.log(missionPrefix, "| INFO ", info);
                  }
                });

              if (Math.abs(pos.Latitude - ll.lat) < 0.0001
              && Math.abs(pos.Longitude - ll.lng) < 0.0001) {
                console.log(missionMeta.name + ':', " INC MISSION");
                missionMeta.iter++;

                if (missionMeta.iter >= mission.length) {
                  console.log(missionMeta.name + ':', " MISSION COMPLETE");
                  missionMeta.state = 'land';
                }
              }
            } else if (missionMeta.state == 'land') {
              console.log(missionMeta.name + '|', "LANDING STATE");

              if (missionMeta.autoLand) {
                dss.postAPI('/api/drone/'+missionMeta.name+'/land', {},
                  missionMeta.apiInfo, (info, error) => {
                    if (error) {
                      console.log(missionPrefix, "| ERROR ", error);
                    }
                    if (info) {
                      console.log(missionPrefix, "| INFO ", info);
                    }
                });
              }
              console.log(missionPrefix, "| MISSION DEL");
              droneMissions[missionMeta.name] = undefined;
            }
            cb();
          } else {
            console.log(missionPrefix, "| ERROR ", error);
            console.log(missionPrefix, "| INFO ", info);
          }
        });
      });
    ;

  }, 2000);
}

exports.get = function(req, res, next) {
  res.json({mission: droneMissions[req.params.name] || null});
}

exports.getAll = function(req, res, next) {
  res.json({mission: droneMissions || null});
}


exports.start = function(req, res, next) {
  if (!req.body) {
    return res.status(400).json({error: "mission required"});
  } else {
    var landOnComplete = req.body.land
    var autoTakeoff = req.body.takeoff

    dss.getAPI('/api/drone/'+req.body.name+'/mode',
      req.session, (info, error) => {
        if (!error && info) {
          if (info != "Takeoff" && info != "Hold") {
            dss.postAPI('/api/drone/'+req.body.name+'/takeoff', {"altitude": 30},
              req.session, function(info, error) {
              if (!error && info) {

                if (info.StatusCode != 0) {
                  return res.status(400).json({error: info.Status});
                } else {
                  droneMissions[req.body.name] = {
                    name: req.body.name,
                    chunk: req.body.mission,
                    iter: 0,
                    paused: false,
                    apiInfo: req.session,
                    state: autoTakeoff? 'takeoff' : 'goto',
                    autoLand: landOnComplete
                  };

                  res.json({status: "OK"});
                }
              }
            });
          } else {
            droneMissions[req.body.name] = {
              name: req.body.name,
              chunk: req.body.mission,
              iter: 0,
              paused: false,
              apiInfo: req.session,
              state: 'goto',
              autoLand: landOnComplete
            };

            res.json({status: "OK"});
          }
        } else {
          res.status(400).json({error: error || info});
        }
    });
  }
}

exports.stop = function(req, res, next) {
  droneMissions[req.params.name] = undefined;
  return res.json({status: "OK"});
}

exports.pause = function(req, res, next) {
  if (  droneMissions[req.params.name]) {
    droneMissions[req.params.name].pause = true;
  }

  return res.json({status: "OK"});
}
