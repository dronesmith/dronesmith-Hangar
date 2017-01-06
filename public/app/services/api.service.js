/**
 * Dronesmith Cloud
 *
 * Principle Engineer: Geoff Gardner <geoff@dronesmith.io>
 *
 * Copyright (C) 2016 Dronesmith Technologies Inc, all rights reserved.
 * Unauthorized copying of any source code or assets within this project, via
 * any medium is strictly prohibited.
 *
 * Proprietary and confidential.
 */

'use strict';

angular
  .module('ForgeApp')
  .factory('API', function(
    $http, $interval, $rootScope, Error) {

      // Mxa API log size
      var LOG_SIZE = 100;

      // API log
      var apiLog = [];

      // Static drone data
      var drones = {};

      var updatesEnabled = false;

      var selectedDrone = null;

      // Logging
      var logAPICall = function(method, string, body, response) {
        apiLog.push({
          method: method,
          url: 'http://api.dronesmith.io'+string,
          body: body,
          response: response,
          time: new Date(),
          toString: '['+method.toUpperCase()+'] ' + string
        });

        if (apiLog.length >= 200) {
          apiLog.shift();
        }
      }

      var getLog = function() {
        return apiLog;
      }

      // Update loop
      $interval(function () {
        if (updatesEnabled) {
          checkOnline();

          // Don't want to overload telem
          $rootScope.$broadcast('drones:update', drones);
        }
      }, 2000);

      var getTelem = function(drone, name, cb) {
        $http({
          method: 'GET',
          url: '/api/drone/'+drone+'/'+name
        }).then(function successCallback(response) {
          logAPICall('GET', '/api/drone/'+drone+'/'+name, {}, response.data);
          cb(response.data);
        }, Error);
      };

      var droneCmd = function(droneName, cmd, body, cb) {
        $http({
          method: 'POST',
          url: '/api/drone/'+droneName+'/'+cmd,
          data: body
        }).then(function successCallback(response) {
          logAPICall('POST', '/api/drone/'+droneName+'/'+cmd, body, response.data);
          cb(response.data);
        }, Error);
      }

      var getDrones = function() {
        $http({
          method: 'GET',
          url: '/api/drone'
        }).then(function successCallback(response) {
          logAPICall('GET', '/api/drone/', {}, response.data);
          drones = response.data.data.drones;

        }, Error);
      }

      var updateDrone = function(oldname, newname) {
          $http({
            method: 'PUT',
            url: '/api/drone/' + oldname,
            data: {"$set": {"name": newname}}
          }).then(function successCallback(response) {
            logAPICall('PUT', '/api/drone/'+oldname,  {"$set": {"name": newname}}, response.data);
            // getDrones();
          }, Error);
      }


      var newDrone = function() {
        $http({
          method: 'POST',
          url: '/api/drone'
        }).then(function successCallback(response) {
          logAPICall('POST', '/api/drone/', {}, response.data);
          // getDrones();
        }, Error);
      }

      var initDrone = function(stop, name, startLat, startLon) {
        var action = stop ? '/stop' : '/start'
        var obj = {};

        if (startLat) {
          obj["lat"] = startLat;
        }

        if (startLon) {
          obj["lon"] = startLon;
        }

        $http({
          method: 'POST',
          url: '/api/drone/'+name+action,
          data: obj
        }).then(function successCallback(response) {
          logAPICall('POST', '/api/drone/'+name+action, obj, response.data);
          // getDrones();
        }, Error);
      }

      var delDrone = function(name) {
        $http({
          method: 'DELETE',
          url: '/api/drone/'+name
        }).then(function successCallback(response) {
          logAPICall('DELETE', '/api/drone/'+name, {}, response.data);
          // getDrones();
        }, Error);
      }

      var flyRoute = function(name, route, cb) {
        $http({
          method: 'POST',
          url: '/mission/start',
          data: {name: name, mission: route}
        }).then(function(res) {
          if (cb) { cb(res) };
        }, Error);
      }

      var cancelRoute = function(name, cb) {
        $http({
          method: 'POST',
          url: '/mission/' + name + '/stop'
        }).then(function(res) {
          if (cb) { cb(res) };
        }, Error);
      }

      var getRoute = function(name, cb) {
        $http({
          method: 'GET',
          url: '/mission/'+name
        }).then(function(res) {
          cb(res.data.mission);
        }, Error);
      }

      var enableUpdates = function() {
        updatesEnabled = true;
        checkOnline();
        // getDrones(); // force reload
      }

      var disableUpdates = function() {
        updatesEnabled = false;
      }

      var checkOnline = function() {
        $http({
          method: 'GET',
          url: '/index/online'
        }).then(function successCallback(response) {
          drones = response.data.drones;
        }, Error);
      }

      var selectDrone = function(name) {
        if (drones[drone.name]) {
          $scope.selectedDrone = drones[drone.name];
        } else {
          $scope.selectedDrone = null;
        }
      }

      var getSelectedDrone = function() {
        return $scope.selectedDrone;
      };
      // Send API request
      var sendRequest = function(method, drone, urlportion, body, callback){
        $http({
          method: method,
          url: "/api/" + urlportion,
          data: body
        }).then(function successCallback(response) {
            logAPICall(method, "/api/" + urlportion, body, response.data);
          callback(response);
          // getDrones();
        }, function errorCallback(response) {
          callback(response);
        });
      }

      return {
        getDrones:          getDrones,
        getTelem:           getTelem,
        newDrone:           newDrone,
        initDrone:          initDrone,
        delDrone:           delDrone,
        updateDrone:        updateDrone,
        enableUpdates:      enableUpdates,
        disableUpdates:     disableUpdates,
        droneCmd:           droneCmd,
        checkOnline:        checkOnline,
        getLog:             getLog,
        selectDrone:        selectDrone,
        getSelectedDrone:   getSelectedDrone,
        sendRequest:        sendRequest,
        flyRoute:           flyRoute,
        getRoute:           getRoute,
        cancelRoute:        cancelRoute
      };
  })
;
