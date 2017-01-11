'use strict';

var
  log = require('../log.js').getLogger(__filename),
  dss = require('../dronesmith-api')
  ;

// Logs in.
// TODO send back proper response.
exports.authenticate = function(req, res, next) {
  if (req.body.deauth) {
    if (!req.session) {
      return res
        .status(400)
        .json({error: "You're not logged in."});
    }

    req.session.destroy();
    res.json({userData: null});
  } else {
    if (req.body.email) {

      if (/^\w*@dronesmith.io$/.test(req.body.email)) {
        dss.getUser(req.body.email, function(user, error) {
          if (error) {
            res.status(400).json({error: error});
          } else {
            req.session.email = req.body.email;
            req.session.key = user.apiKey;
            req.session.save(function(err) {
              res.json({status: 'OK', user});
            });
          }
        });
      } else {
        res.status(400).json({error: "Hangar currently only open to users registered with a `dronesmith.io` domain name."});
      }
    } else {
      res.status(400).json({error: "Email required."});
    }
  }
};

// Send back session
exports.poll = function(req, res, next) {
  if (!req.session || !req.session.hasOwnProperty('email') || !req.session.hasOwnProperty('key')) {
    res.json({"status": "expired"});
  } else {
    res.json({
      status: "active",
      lastUpdate: new Date(),
      userData: {email: req.session.email, key: req.session.key}
    });
  }
};
