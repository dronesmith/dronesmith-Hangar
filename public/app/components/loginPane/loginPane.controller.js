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
  .controller('LoginPaneCtrl', function ($scope, $state, $stateParams, Session, Error) {


    $scope.error = $stateParams.error;
    $scope.spin = false;
    $scope.gotoSignup = function() {
      $state.go('signup');
    }

    $scope.update = function(user) {
      $scope.spin = true;
      Session
        .account.authenticate(user)
        .$promise
        .then(function(data) {
          $state.go('hangar');
          $scope.spin = false;
        }, function(data){
          $scope.error = data.data.error;
          $state.go('.', {error: $scope.error}, {reload: true});

          $scope.spin = false;
        })
      ;
    };
  })
;
