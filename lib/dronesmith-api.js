'use strict';

var
  log = require('../lib/log.js').getLogger(__filename),
  request = require('request'),
  config = require('../config/config.js')
  ;



module.exports.createUser = function(email, firstname, lastname, password, cb) {
  request({
    url: config.api + '/admin/user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'admin-key': config.adminKey
    },
    body: {
      "email": email,
      "firstname": firstname,
      "lastname": lastname,
      "company": "n/a",
      "password": password
    },
    json: true
  }, function(error, response, body) {
    if (error) {
        cb(null, error);
    } else {
        if (response.statusCode == 200) {
          try {
            cb(body.apiKey, null);
          } catch (e) {
            cb(null, error);
          }
        } else {
          cb(null, response.statusCode + ' ' + response.error);
        }
    }
  });
};

module.exports.checkUser = function(email, password, cb) {
  //TODO update this function whe API bug is fixed. The API currently
  // returns a 200 status on error.

  // This method calls POST /admin/user/{id|email}/password
  // when the user logs in, to see if their password is valid.

  var encodedPassword =new Buffer(password).toString('base64');

  request({
    url: config.api + '/index/user/' + email + "/password",
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'admin-key': config.adminKey
    },
    body: {
      "password": encodedPassword
    },
    json: true
  }, function(error, response, body) {
    if (error) {

        cb(error);
    } else {
        if (response.statusCode == 200) {

          if (body.error == "Password invalid.") {
            cb("Password and email do not match.");

          } else {
            cb(null);
          }

        } else {
          cb(''+response.statusCode + ' ' + response.error);
        }
    }
  });

};

module.exports.updateUser = function(email, password, cb) {

  // TODO
  // This method calls PUT /admin/user/{id|email}
  // When the user wishes to reset their password, will generate a random password
  // of 8 characters and email it to them.


  // PUT /admin/user/{id|email} request requires password in base64
  var encodedPassword = new Buffer(password).toString('base64');

  request({
    url: config.api + '/admin/user/' + email,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'admin-key': config.adminKey
    },
    body: {
      "password": encodedPassword
    },
    json: true
  }, function(error, response, body) {
    if (error) {
        cb(error);
    } else {
        if (response.statusCode == 200) {
          cb(null);
          log.warn("Password reset");
        } else {
          log.warn("Failed password reset");
          cb(response.body.error);
        }
    }
  });
};

module.exports.getUser = function(email, cb) {


  request({
    url: config.api + '/admin/user',
    qs: {email: email},
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'admin-key': config.adminKey
    }
  }, function(error, response, body) {
    if (error) {
        cb(null, error);
    } else {
        if (response.statusCode == 200) {
          var userData;
          try {
            userData = JSON.parse(body);
            if (userData.users.length == 0 ) {
              cb(null, "User not found.");
            } else {
              cb(userData.users[0], null);
            }
          } catch (e) {
            cb(null, error);
          }
        } else {
          cb(null, ''+response.statusCode + ' ' + response.error)
        }
    }
  });
}

module.exports.getAPI = function(path, data, cb) {
  request({
    url: config.api + path,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'user-email': data.email,
        'user-key': data.key
    }
  }, function(error, response, body) {
    if (error) {
        cb(null, error);
    } else {
        if (response.statusCode == 200) {
          var data;
          try {
            data = JSON.parse(body);
            cb(data, null);
          } catch (e) {
            cb(null, error);
          }
        } else {
          cb(null, 'API Error ' + response.statusCode + ' ' + response.error);
        }
    }
  });
}

module.exports.delAPI = function(path, data, cb) {
  request({
    url: config.api + path,
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
        'user-email': data.email,
        'user-key': data.key
    }
  }, function(error, response, body) {
    if (error) {
        cb(null, error);
    } else {
        if (response.statusCode == 200) {
          var data;
          try {
            data = JSON.parse(body);
            cb(data, null);
          } catch (e) {
            cb(null, error);
          }
        } else {
          cb(null, 'API Error ' + response.statusCode + ' ' + response.error);
        }
    }
  });
}

module.exports.postAPI = function(path, pdata, data, cb) {
  var compiled = "";
  try {
    compiled = JSON.stringify(pdata);
  } catch (e) {
    cb(null, e);
  }

  request({
    url: config.api + path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'user-email': data.email,
        'user-key': data.key
    },
    body: compiled
  }, function(error, response, body) {
    if (error) {
        cb(null, error);
    } else {
        if (response.statusCode == 200) {
          var data;
          try {
            data = JSON.parse(body);
            cb(data, null);
          } catch (e) {
            cb(null, error);
          }
        } else {
          cb(null, 'API Error ' + response.statusCode + ' ' + response.error);
        }
    }
  });
}

module.exports.putAPI = function(path, pdata, data, cb) {
  var compiled = "";
  try {
    compiled = JSON.stringify(pdata);
  } catch (e) {
    cb(null, e);
  }

  request({
    url: config.api + path,
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'user-email': data.email,
        'user-key': data.key
    },
    body: compiled
  }, function(error, response, body) {
    if (error) {
        cb(null, error);
    } else {
        if (response.statusCode == 200) {
          var data;
          try {
            data = JSON.parse(body);
            cb(data, null);
          } catch (e) {
            cb(null, error);
          }
        } else {
          cb(null, 'API Error ' + response.statusCode + ' ' + response.error);
        }
    }
  });
}
