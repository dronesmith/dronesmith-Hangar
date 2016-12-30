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
    $uibModal, $state, $rootScope, $interval) {

      // get user info example
      // $http({
      //   method: 'GET',
      //   url: '/index/user'
      // }).then(function successCallback(response) {
      //   $scope.user = response;
      // }, Error);

      $interval(function () {
        getDrones();
      }, 5000);

      getDrones();


      function getDrones() {
        $http({
          method: 'GET',
          url: '/api/drone'
        }).then(function successCallback(response) {
          $scope.drones = response.data.data.drones;
        }, Error);
      }

      $scope.newDrone = function() {
        $http({
          method: 'POST',
          url: '/api/drone'
        }).then(function successCallback(response) {
          getDrones();
        }, Error);
      }

      $scope.initDrone = function(stop, name) {
        var action = stop ? '/stop' : '/start'
        $http({
          method: 'POST',
          url: '/api/drone/'+name+action
        }).then(function successCallback(response) {
          getDrones();
        }, Error);
      }

      $scope.delDrone = function(name) {
        $http({
          method: 'DELETE',
          url: '/api/drone/'+name
        }).then(function successCallback(response) {
          getDrones();
        }, Error);

      }
  })
;
