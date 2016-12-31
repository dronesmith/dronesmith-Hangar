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
  .controller('HangarCtrl', function ($scope, Error, Session, $http,
    $uibModal, $state, $rootScope, API) {

      API.enableUpdates();

      // get user info example
      // $http({
      //   method: 'GET',
      //   url: '/index/user'
      // }).then(function successCallback(response) {
      //   $scope.user = response;
      // }, Error);

      // $interval(function () {
      //   getDrones();
      // }, 5000);

      $rootScope.$on('drone:update', function(ev, data) {
        console.log(data);
        $scope.drones = data;
      });

      $rootScope.$on('telem:update', function(ev, data) {
        $scope.telem = data;
      });

      // getDrones();

      // $scope.getTelem = function(drone, name) {
      //   $http({
      //     method: 'GET',
      //     url: '/api/drone/'+drone+'/'+name
      //   }).then(function successCallback(response) {
      //     if ($scope.telem[drone] == {}) {
      //       $scope.telem[drone] = {
      //         online: false
      //       };
      //     }
      //     $scope.telem[drone][name] = response.data.data;
      //     $scope.telem[drone].online = true;
      //   }, function () {
      //     $scope.telem[drone].online = false;
      //   });
      // };


      // function getDrones() {
      //   $http({
      //     method: 'GET',
      //     url: '/api/drone'
      //   }).then(function successCallback(response) {
      //     $scope.drones = response.data.data.drones;
      //
      //     // Need to manually set this due to API being sluggish on it.
      //     angular.forEach($scope.drones, function(drone) {
      //       if (!$scope.telem[drone.name]) {
      //         $scope.telem[drone.name] = {};
      //       }
      //
      //       // Ping each drone to see if it's online
      //       $scope.getTelem(drone.name, 'status');
      //       $scope.getTelem(drone.name, 'info');
      //       $scope.getTelem(drone.name, 'position');
      //     });
      //   }, Error);
      // }

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
