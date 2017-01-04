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

      $rootScope.$on('drones:update', function(ev, data) {
        $scope.drones = data;
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
