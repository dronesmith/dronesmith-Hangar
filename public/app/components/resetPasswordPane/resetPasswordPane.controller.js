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
  .controller('ResetPasswordPaneCtrl', function ($scope, $state, $stateParams, Session) {
$scope.error = null;
    console.log("Validate token");
    Session
      .validateToken.send($stateParams)
      .$promise.then(function(data) {

      }, function(data) {
        //$scope.error = data.data.error;
        $state.go('forgotPassword', {error: "We apologize, that password reset link has expired."});
      });



    $scope.update = function(user) {
      user.token = $stateParams.token;

      Session
        .resetPassword.send(user )
        .$promise
        .then(function(data) {

        }, function(data) {


        })
      ;
    };

  })
;
