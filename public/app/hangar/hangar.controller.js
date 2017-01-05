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
  .controller('HangarCtrl', function ($scope, $rootScope, Error, API) {

      API.enableUpdates();

      $rootScope.$on('drone:update', function(ev, data) {
        $scope.drones = data;
      });

      $rootScope.$on('telem:update', function(ev, data) {
        $scope.telem = data;

        // if online, subscribe
        angular.forEach($scope.telem, function(drone, key) {

          // We don't use these
          API.removeListener(key, 'attitude');
          API.removeListener(key, 'rates');
          API.removeListener(key, 'mode');

          if (drone.online) {
            API.addListener(key, 'status');
            API.addListener(key, 'position');
            API.addListener(key, 'info');
          } else {
            API.removeListener(key, 'status');
            API.removeListener(key, 'position');
            API.removeListener(key, 'info');
          }
        });
      });

      $scope.updateDrone = function(collapse, oldname, newname) {
        if (collapse) {
          API.updateDrone(oldname, newname);
        }
      }

      $scope.newDrone = function() {
        API.newDrone();
      }

      $scope.initDrone = function(stop, name) {
        API.initDrone(stop, name);
      }

      $scope.delDrone = function(name) {
        API.delDrone(name);
      }
  })

;
