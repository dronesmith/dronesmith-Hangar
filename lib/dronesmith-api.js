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
            cb(null, e);
          }
        } else {
          cb(null, body.error);
        }
    }
  });
};

module.exports.checkUser = function(email, password, cb) {
  //TODO update this function whe API bug is fixed. The API currently
  // returns a 200 status on error.

  // This method calls POST /admin/user/{id|email}/password
  // when the user logs in, to see if their password is valid.

  // API requires password in base64
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
            cb(body.error);
          } else {
            cb(null);
          }

        } else {
          cb(body.error);
        }
    }
  });

};

module.exports.updateUser = function(email, password, cb) {

  // API requires password in base64
  var encodedPassword = new Buffer(password).toString('base64');

  request({
    url: config.api + '/admin/user/' + email+"d",
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
        } else {
          cb(body.error);
        }
    }
  });
};

module.exports.getUser = function(email, cb) {


  request({
    url: config.api + '/admin/user/' + email,
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
            cb(userData[0], null);

          } catch (e) {
            cb(null, e);
          }
        } else {
          var responseData = JSON.parse(body);
          cb(null, responseData.error);
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
