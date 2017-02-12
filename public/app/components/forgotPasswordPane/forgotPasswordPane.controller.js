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
  .controller('ForgotPasswordPaneCtrl', function ($scope, $state, $stateParams, Session, progressSpinner) {
    $scope.error =  $stateParams.error;

    $scope.gotoLogin = function() {
      $state.go('login');
    }

    $scope.update = function(user) {
      progressSpinner.start();

      Session
        .forgotPassword.send(user)
        .$promise
        .then(function(data) {

          progressSpinner.complete();
          $state.go('sentResetPassword', {email: user.email});

        }, function(data) {

          progressSpinner.complete();
          $scope.error = data.data.error;
          $state.go('.', {error: $scope.error}, {reload: true});

        })
      ;
    };


  })
;
