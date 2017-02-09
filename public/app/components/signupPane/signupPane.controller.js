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
  .controller('SignupPaneCtrl', function ($scope, $state, $stateParams, Session, progressSpinner, Error) {
    $scope.error =  $stateParams.error;

    $scope.update = function(user) {
      progressSpinner.start();
      Session
        .signup.send(user)
        .$promise
        .then(function(data) {
          progressSpinner.complete();
          $state.go('signupSuccess', {email: user.email});
        }, function(data) {
          $scope.error = data.data.error;
          progressSpinner.complete();
          $state.go('.', {error: $scope.error}, {reload: true});
        })
      ;
    };
  })
;
