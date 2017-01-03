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

      // Live drone data
      var telem = {};

      // Static drone data
      var drones = {};

      // Event listeners
      var events = {};

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
          getDrones();

          // Don't want to overload telem
          $rootScope.$broadcast('telem:update', telem);
        }
      }, 5000);

      var getTelem = function(drone, name) {
        $http({
          method: 'GET',
          url: '/api/drone/'+drone+'/'+name
        }).then(function successCallback(response) {
          logAPICall('GET', '/api/drone/'+drone+'/'+name, {}, response.data);
          if (telem[drone] == {}) {
            telem[drone] = {
              online: false
            };
          }
          telem[drone][name] = response.data.data;
          telem[drone].online = true;

        }, function () {
          telem[drone].online = false;
        });
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

          // console.log(events);

          // Fire event
          $rootScope.$broadcast('drone:update', drones);

          // Need to manually set this due to API being sluggish on it.
          angular.forEach(drones, function(drone) {
            if (!telem[drone.name]) {
              telem[drone.name] = {};
            }

            // Ping each drone to see if it's online
            if (telem[drone.name].online) {
              // Fire events
              for (var k in events) {
                if (events[k]) {
                  var ev = k.split(':')
                  getTelem(ev[0], ev[1]);
                }
              }
            }
          });
        }, Error);
      }

      var addListener = function(droneName, telem) {
        events[droneName+":"+telem] = true;
      }

      var removeListener = function(droneName, telem) {
        events[droneName+":"+telem] = false;
      }

      var removeAllListeners = function(droneName) {
        for (var k in events) {
          if (k.split(':')[0] == droneName) {
            events[k] = false;
          }
        }
      }

      var updateDrone = function(oldname, newname) {
          $http({
            method: 'PUT',
            url: '/api/drone/' + oldname,
            data: {"$set": {"name": newname}}
          }).then(function successCallback(response) {
            logAPICall('PUT', '/api/drone/'+oldname,  {"$set": {"name": newname}}, response.data);
            getDrones();
          }, Error);
      }


      var newDrone = function() {
        $http({
          method: 'POST',
          url: '/api/drone'
        }).then(function successCallback(response) {
          logAPICall('POST', '/api/drone/', {}, response.data);
          getDrones();
        }, Error);
      }

      var initDrone = function(stop, name) {
        var action = stop ? '/stop' : '/start'
        $http({
          method: 'POST',
          url: '/api/drone/'+name+action
        }).then(function successCallback(response) {
          logAPICall('POST', '/api/drone/'+name+action, {}, response.data);
          getDrones();
        }, Error);
      }

      var delDrone = function(name) {
        $http({
          method: 'DELETE',
          url: '/api/drone/'+name
        }).then(function successCallback(response) {
          logAPICall('DELETE', '/api/drone/'+name, {}, response.data);
          getDrones();
        }, Error);
      }

      var enableUpdates = function() {
        updatesEnabled = true;
        checkOnline();
        getDrones(); // force reload
      }

      var disableUpdates = function() {
        updatesEnabled = false;
      }

      var checkOnline = function() {
        $http({
          method: 'GET',
          url: '/index/online'
        }).then(function successCallback(response) {
          var drones = response.data.drones;
          for (var k in drones) {
            var online = drones[k];
            telem[k].online = online;
          }
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
        addListener:        addListener,
        removeListener:     removeListener,
        removeAllListeners: removeAllListeners,
        getLog:             getLog,
        selectDrone:        selectDrone,
        getSelectedDrone:   getSelectedDrone
      };
  })
;
