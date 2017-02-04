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
  .controller('ForgotPasswordPaneCtrl', function ($scope, $state, Session) {
    $scope.error = null;

    $scope.gotoLogin = function() {
      $state.go('login');
    }

    $scope.update = function(user) {
      Session
        .forgotPassword.send(user)
        .$promise
        .then(function(data) {

          console.log(data.status);
          $state.go('sentResetPassword', {email: user.email});
          //$state.go('signupSuccess');
        }, function(data) {
          console.log(data.data.error);
          $scope.error = data.data.error;

        })
      ;
    };


  })
;
