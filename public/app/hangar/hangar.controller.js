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

      $scope.StartLoc = "";

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

      $scope.initDrone = function(stop, name, loc) {

        if (stop) {
          API.initDrone(stop, name);
        } else {
          if (!loc) {
            API.initDrone(stop, name);
            $scope.StartLoc = "";
          } else {
            MQ.geocode().search(loc).on('success', function(e) {
              var best = e.result.best,
              latlng = best.latlng;
              API.initDrone(stop, name, latlng.lat, latlng.lng);
            });
          }
        }

      }

      $scope.delDrone = function(name) {
        API.delDrone(name);
      }
  })
;
