'use strict';

var
  request = require('request'),
  config = require('../config/config.js')
  ;

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
