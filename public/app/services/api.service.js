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

      var updatesEnabled = false;

      // Update loop
      $interval(function () {
        if (updatesEnabled) {
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

      var getDrones = function() {
        $http({
          method: 'GET',
          url: '/api/drone'
        }).then(function successCallback(response) {
          drones = response.data.data.drones;

          // Fire event
          $rootScope.$broadcast('drone:update', drones);

          // Need to manually set this due to API being sluggish on it.
          angular.forEach(drones, function(drone) {
            if (!telem[drone.name]) {
              telem[drone.name] = {};
            }

            // Ping each drone to see if it's online
            getTelem(drone.name, 'status');
            getTelem(drone.name, 'info');
            getTelem(drone.name, 'position');
          });
        }, Error);
      }

      var updateDrone = function(oldname, newname) {
          $http({
            method: 'PUT',
            url: '/api/drone/' + oldname,
            data: {"$set": {"name": newname}}
          }).then(function successCallback(response) {
            getDrones();
          }, Error);
      }


      var newDrone = function() {
        $http({
          method: 'POST',
          url: '/api/drone'
        }).then(function successCallback(response) {
          getDrones();
        }, Error);
      }

      var initDrone = function(stop, name) {
        var action = stop ? '/stop' : '/start'
        $http({
          method: 'POST',
          url: '/api/drone/'+name+action
        }).then(function successCallback(response) {
          getDrones();
        }, Error);
      }

      var delDrone = function(name) {
        $http({
          method: 'DELETE',
          url: '/api/drone/'+name
        }).then(function successCallback(response) {
          getDrones();
        }, Error);
      }

      var enableUpdates = function() {
        updatesEnabled = true;
      }

      var disableUpdates = function() {
        updatesEnabled = false;
      }

      getDrones();

      return {
        getDrones:    getDrones,
        getTelem:     getTelem,
        newDrone:     newDrone,
        initDrone:    initDrone,
        delDrone:     delDrone,
        updateDrone:  updateDrone,
        enableUpdates: enableUpdates,
        disableUpdates: disableUpdates
      };
  })
;
