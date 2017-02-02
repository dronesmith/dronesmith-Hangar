'use strict';

var
  log = require('../log.js').getLogger(__filename),
  dss = require('../dronesmith-api'),
  sms = require('../sms.js')
  //mailer = require('../mailer.js')
  ;

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
      dss.checkUser(req.body.email, req.body.password, function(error) {
        if (error) {
          res.status(400).json({error: error});
        } else {

          dss.getUser(req.body.email, function(user, err) {
            if (err) {
              res.status(400).json({error: err});
            } else {
              req.session.key = user.apiKey;
              req.session.email = req.body.email;

              req.session.save(function(err) {
                res.json({status: 'OK', user});
              });
            }
          });

        }
      });

    } else {
      res.status(400).json({error: "Email required."});
    }
  }
};

exports.signUp = function(req, res, next) {

  dss.createUser(req.body.email, req.body.firstname, req.body.lastname, req.body.password, function(key, error){
    if(error){
      res.status(400).json({error: 'User could not be created.'});
    } else {
      // TODO Send email using 'mailer' module
      log.warn("API Key: " + key);
      res.json({status: 'OK'});
    }
  });

};

// Call this when the user finishes entering their sign in information
exports.sendSMSVerification = function(req, res, next) {
  sms.SMSAuth(req.body.email, req.body.phone, req.body.country, function(ret, err) {
    if (!err && ret && ret.success) {
      return res.json(ret);
    } else if (ret && !ret.success) {
      return res.status(400).json({error: ret});
    } else {
      return next(err);
    }
  });
}

// Call this when user enters their SMS text authentication code
exports.verifyPhone = function(req, res, next) {
  sms.Verify(req.body.phone, req.body.country, req.body.code, function(result, err) {
    if (err) {
      return res.status(400).json({error: err});
    } else {
      return res.json(result);
    }
  });
}

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
