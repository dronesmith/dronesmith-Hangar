'use strict';

var
  crypto = require('crypto'),
  async = require('async'),
  log = require('../log.js').getLogger(__filename),
  dss = require('../dronesmith-api'),
  sms = require('../sms.js'),
  mailer = require('../mailer.js')
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





exports.forgotPassword = function (req, res, next) {

  async.waterfall([
    function(cbAsync) {
      crypto.randomBytes(20, function(err, buff) {

        if (err) {
          return cbAsync("Error generating random bytes.");
        } else {

          var token = buff.toString('hex');
          req.session.token = token;
          req.session.save(function(err) {
            if (err) {
              return cbAsync("Error saving token.")
            }
          });

          cbAsync(null, token);
        }
      });
    },
    function(token, cbAsync) {
      dss.getUser(req.body.email, function(user, err) {

        if (err) {

          if (err == "User not found.") {
            return cbAsync('The email you entered does not belong to any account.');
          } else {
            return cbAsync(err);
          }

        } else {
            cbAsync(null, token);
        }
      });
    },
    function(token, cbAsync) {

        var link = 'http://localhost:4000/#!/reset?token=' + token;
        mailer.sendPasswordResetLink(link,  req.body.email, function(err){
          if (err) {
            return cbAsync("Error sending email");
          } else {
            cbAsync(null);
          }
        });

    }
  ], function asyncComplete(err) {
      if (err) {
        log.warn("Async Error: " + err);
        res.status(400).json({error: err});

      } else {
        log.warn("Async success");
        res.json({status: 'Email sent'})
      }
  });

}

exports.validateToken = function (req, res, next) {

  if (req.body.token == req.session.token) {
    res.json({status: "Token validated"})
  } else {
    res.status(400).json({error: "Not a valid password reset link"});
  }

}

exports.resetPassword = function (req, res, next) {


  dss.getUser(req.body.email, function(user, err) {

    if (err) {

      if (err == "User not found.") {
        res.status(400).json({error: 'The email you entered does not belong to any account.'});
      } else {
        res.status(400).json({error: err});
      }

    } else {

      dss.updateUser(req.body.email, req.body.password, function(password, error){
        if (error) {
          res.status(400).json({error: 'Password could not be reset.'});
        } else {

          res.json({status: 'Password succesfully reset.'});
        }
      });

    }
  });


}

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
