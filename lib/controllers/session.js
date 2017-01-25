'use strict';

var
  log = require('../log.js').getLogger(__filename),
  dss = require('../dronesmith-api'),
  sms = require('../sms.js'),
  mailer = require('../mailer.js')
  ;

// Logs in.
// TODO check password with admin API
// You will need to update this to check the password is valid from the API.
// Call `dss.checkUser`
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

      // if (/^\w*@dronesmith.io$/.test(req.body.email)) {
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
      // } else {
        // res.status(400).json({error: "Hangar currently only open to users registered with a `dronesmith.io` domain name."});
      // }
    } else {
      res.status(400).json({error: "Email required."});
    }
  }
};

exports.signUp = function(req, res, next) {
  // TODO
  // This should be called when the user signs up AND has verified their phone.
  // The procedure is as follows:
  // 1. Call `dss.createUser` to attempt to create a new user. This will return an API key.
  // 2. If successful, use the `mailer` module to mail the sendgrid template to the user's email, including the API key.
  // 3. Send a 200.
  // If either of these steps fail, send a 400 error back.
  next(); // remove this when implemented.
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
