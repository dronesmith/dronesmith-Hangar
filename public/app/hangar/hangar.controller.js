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
    $uibModal, $state, $rootScope) {

      // get user info example
      // $http({
      //   method: 'GET',
      //   url: '/index/user'
      // }).then(function successCallback(response) {
      //   $scope.user = response;
      // }, Error);

      $http({
        method: 'GET',
        url: '/api/drone'
      }).then(function successCallback(response) {
        $scope.drones = response;
      }, Error);
  })
;
