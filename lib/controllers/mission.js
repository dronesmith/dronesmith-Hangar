'use strict';

var
  dss = require('../dronesmith-api')
  ;

var droneMissions = {};

exports.init = function() {
  setInterval(function() {

    for (var k in droneMissions) {
      var missionMeta = droneMissions[k];

      if (!missionMeta) {
        continue;
      }

      var mission = missionMeta.chunk;
      var pos;

      dss.getAPI('/api/drone/'+k+'/position', missionMeta.apiInfo, (info, error) => {
        if (!error && info) {
          pos = info;

          var path = mission[missionMeta.iter];
          var ll = path.startPoint;

          console.log(k + ':', path.narrative);

          dss.postAPI('/api/drone/'+k+'/goto', {"lat": ll.lat, "lon": ll.lng}, missionMeta.apiInfo,  function(info, error) { console.log(error)});

          // console.log(pos.Latitude - ll.lat);

          if (Math.abs(pos.Latitude - ll.lat) < 0.0001
          && Math.abs(pos.Longitude - ll.lng) < 0.0001) {
            console.log(k + ':', " Inc mission");
            missionMeta.iter++;

            if (missionMeta.iter >= mission.length) {
              console.log(k + ':', " Mission Complete.");
              droneMissions[k] = undefined;
            }
          }
        }
      });
    }

  }, 2000);
}

exports.get = function(req, res, next) {
  res.json({mission: droneMissions[req.params.name] || null});
}

exports.start = function(req, res, next) {
  if (!req.body) {
    return res.status(400).json({error: "mission required"});
  } else {
    droneMissions[req.body.name] = {
      chunk: req.body.mission,
      iter: 0,
      paused: false,
      apiInfo: req.session
    }

    return res.json({status: "OK"});
  }
}

exports.stop = function(req, res, next) {

}

exports.pause = function(req, res, next) {

}
