'use strict';

var
  crypto = require('crypto'),
  async = require('async'),
  log = require('../log.js').getLogger(__filename),
  dss = require('../dronesmith-api'),
  sms = require('../sms.js'),
  mailer = require('../mailer.js'),
  config = require('../../config/config.js')
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
      async.waterfall([
        function (cbAsync) {
          dss.getUser(req.body.email, function(user, err) {

            if (err) {
                return cbAsync(err);

            } else {
              cbAsync(null, user);
            }
          });
        },
        function (user, cbAsync) {
          dss.checkUser(req.body.email, req.body.password, function(error) {
              if (error) {
                return cbAsync(error);
              } else {

                req.session.regenerate(function(err) {
                  if (err) {
                     cbAsync("Error regenerating session.");

                  } else {
                    req.session.key = user.apiKey;
                    req.session.email = req.body.email;

                    req.session.save(function(err) {
                      cbAsync(null);
                    });

                  }
                });

              }
          });
        }
      ], function asyncComplete(err) {
        if (err) {
          log.warn("Login Error: " + err);
          if(err == "No user found." || err == "Password invalid."){
            res.status(400).json({error: config.errorMessages.login});
          } else {
            res.status(400).json({error: config.errorMessages.error});
          }

        } else {
          log.warn("Login Success");
          res.json({status: "Login successful."});
        }
      })

    } else {
      res.status(400).json({error: "Email required."});
    }
  }
};

exports.forgotPassword = function (req, res, next) {

  async.waterfall([

    function(cbAsync) {
      dss.getUser(req.body.email, function(user, err) {

        if (err) {

            return cbAsync(err);

        } else {
            cbAsync(null);
        }
      });
    },
    function(cbAsync) {
      crypto.randomBytes(20, function(err, buff) {

        if (err) {
          return cbAsync("Error generating random bytes.");
        } else {

          var token = buff.toString('hex');
          req.session.email = req.body.email;
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

        var link = config.resetURL + '/#!/reset/' + token;
        mailer.sendPasswordResetLink(link,  req.body.email, function(err){
          if (err) {
            return cbAsync(err);
          } else {
            cbAsync(null);
          }
        });

    }
  ], function asyncComplete(err) {
      if (err) {
        log.warn("Forgot Error: " + err);
        if (err == "No user found.") {
          res.status(400).json({error: config.errorMessages.noUser});
        } else {
          res.status(400).json({error: config.errorMessages.error});
        }

      } else {
        log.warn("Forgot Success");
        res.json({status: 'Email sent'})
      }
  });

}
exports.validateEmail = function (req, res, next) {
  if(req.body.id){
    async.waterfall([
      function (cbAsync) {
        dss.getUser(req.body.id, function(user, err) {

          if (err) {
              return cbAsync(err);

          } else {
            if (user.isVerifiedEmail == true) {
              return cbAsync("Email already verified.")
            }
            cbAsync(null, user);
          }
        });
      },
      function (user, cbAsync) {
        dss.markEmailVerified(user.email, function(err){
          if (err) {
            cbAsync(err);
          } else {
            cbAsync(null, user);
          }
        });
      },
      function (user, cbAsync) {

        mailer.sendKey(user.email, user.firstname, user.apiKey, function(err){

          if (err) {
            return cbAsync(err);
          } else {
            cbAsync(null);
          }
        });
      }
    ], function asyncComplete(err) {
        if (err) {
          log.warn("Validate Email error:" + err);
          if(err == "Email already verified."){
            res.status(400).json({error: config.errorMessages.alreadyVerified});
          } else {
            res.status(400).json({error: config.errorMessages.error});
          }

        }else {
          res.json({status: "Success"});
        }

    });
  }


}
exports.validateToken = function (req, res, next) {

  if (req.body.token == req.session.token) {
    log.warn('body token: ' + req.body.token);
    log.warn('sess token: ' + req.session.token);
    req.session.touch();
    res.json({status: "Token validated"});

  } else {
    res.status(400).json({error: config.errorMessages.invalidResetLink});
  }

}

exports.resetPassword = function (req, res, next) {

  async.waterfall([

    function (cbAsync) {
      dss.updateUser(req.session.email, req.body.password, function(err){
        if (err) {
          cbAsync(err);
        } else {
          cbAsync(null);
          req.session.touch();
        }
      });
    },
    function (cbAsync) {

      mailer.sendPasswordChanged(req.session.email, function(err){

        if (err) {
          return cbAsync(err);
        } else {
          cbAsync(null);
        }
      });
    }
  ], function asyncComplete(err) {
    if (err) {
      log.warn("Reset Error: " + err);
      res.status(400).json({error: config.errorMessages.error});

    } else {
      log.warn("Reset Success");
      res.json({status: 'Password successfully reset.'})
    }
  });

}

exports.signUp = function(req, res, next) {
  async.waterfall([

    function (cbAsync) {
      dss.createUser(req.body.email, req.body.firstname, req.body.lastname, req.body.password, function(id, error){
        if(error){
          return cbAsync(error);
        } else {
          cbAsync(null, id);
        }
      });
    },

    function (id, cbAsync) {
      var link = config.resetURL + '/#!/confirm/' + id;
      mailer.sendEmailVerifyLink(link, req.body.email, function(err){

        if (err) {
          return cbAsync(err);
        } else {
          cbAsync(null, id);
        }
      });
    }
  ], function asyncComplete(err) {
    if (err) {
      log.warn("Signup Error: " + err);
      if(err == "Email already taken."){
        res.status(400).json({error: config.errorMessages.emailTaken});
      } else {
        res.status(400).json({error: config.errorMessages.error});
      }
    } else {
      log.warn("Signup Success");
      res.json({status: 'Signup successful.'})
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
