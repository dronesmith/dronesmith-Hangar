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
  .controller('ResetPasswordPaneCtrl', function ($scope, $state, $stateParams, Session, progressSpinner) {
    $scope.error = $stateParams.error;

    Session
      .validateToken.send($stateParams)
      .$promise.then(function(data) {

      }, function(data) {
        $scope.error = data.data.error;
        //$state.go('forgotPassword', {error: $scope.error});
      });

    $scope.update = function(user) {
      progressSpinner.start();
      user.token = $stateParams.token;

      Session
        .resetPassword.send(user)
        .$promise
        .then(function(data) {

          progressSpinner.complete();
          $state.go('resetPasswordSuccess');
        }, function(data) {
          $scope.error = data.data.error;
          progressSpinner.complete();
          $state.go('.', {error: $scope.error}, {reload: true});
        })
      ;
    };

  })
;
