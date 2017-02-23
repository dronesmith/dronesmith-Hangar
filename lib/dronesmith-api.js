'use strict';

var
  log = require('../lib/log.js').getLogger(__filename),
  request = require('request'),
  config = require('../config/config.js')
  ;

module.exports.getAPI = function(offset, path, cb) {
  request({
    url: config.endpoints[offset] + path,
    timeout: 200,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
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

module.exports.delAPI = function(offset, path, data, cb) {
  request({
    url: config.endpoints[offset] + path,
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json'
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

module.exports.postAPI = function(offset, path, pdata, cb) {
  var compiled = "";
  try {
    compiled = JSON.stringify(pdata);
  } catch (e) {
    cb(null, e);
  }

  request({
    url: config.endpoints[offset] + path,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
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

module.exports.putAPI = function(offset, path, pdata, data, cb) {
  var compiled = "";
  try {
    compiled = JSON.stringify(pdata);
  } catch (e) {
    cb(null, e);
  }

  request({
    url: config.endpoints[offset] + path,
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json'
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
