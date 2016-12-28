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
  .controller('AppViewCtrl', function ($scope, $state, $http, $uibModal, User) {

    if (!$scope.userInfo) {
      $scope.$on('session:update', function(ev, data) {
        $scope.userInfo = data;
        init();
      });
    } else {
      init();
    }

    $http
      .get('/index/app/')
      .then(function(data) {
        $scope.apps = data.data;
      })
    ;

    function init() {
      User
        .get({id: $scope.userInfo.id})
        .$promise
        .then(function(data) {
          $scope.drones = data.drones;
        }, Error)
      ;
    }

    $scope.getApp = function(applinks) {
      var sshlink = null;
      for (var p in applinks) {
        if (applinks[p].name == 'ssh') {
          sshlink = applinks[p].href;
        }
      }

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'DroneSelectModal.html',
        controller: 'DroneSelectModalCtrl',
        size: 'md'
      });

      modalInstance.result.then(function (selectedItem) {
        $http
          .post('/index/app/', {})
          .then(function(data) {

          })
        ;
      }, function () {
      });

    };
  })
  .controller('DroneSelectModalCtrl', function($scope, $uibModalInstance) {

    if (!$scope.userInfo) {
      $scope.$on('session:update', function(ev, data) {
        $scope.userInfo = data;
        init();
      });
    } else {
      init();
    }

    function init() {
      User
        .get({id: $scope.userInfo.id})
        .$promise
        .then(function(data) {
          $scope.drones = data.drones;
        }, Error)
      ;
    }

    $scope.end = function () {
      $uibModalInstance.close();
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  })
;
