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
  .controller('NavbarCtrl',
    function (
      $scope,
      $location,
      $uibModal,
      $state,
      Session,
      Error) {

        $scope.userInfo = {};
        $scope.previewMode = DSSProps.previewMode;

        $scope.isActive = function(route) {
          return route === $location.path();
        };

        $scope.logout = function() {
          Session
            .authenticate({
              email: $scope.userInfo.email,
              deauth: true
            })
            .$promise
            .then(function(data) {
              if (!data.userData) {
                $state.go('login');
              }
            }, Error)
          ;
        };

        $scope.editAccount = function() {
          $uibModal.open({
            templateUrl: 'app/components/accountModal/accountModal.html',
            controller: 'AccountModalCtrl',
            resolve: {
              userAccount: function() { return $scope.userInfo;  }
            }
          })
        ;
      };
  })
;
