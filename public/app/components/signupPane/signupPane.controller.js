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
  .controller('SignupPaneCtrl', function ($scope, $state, Session, Error) {

    $scope.gotoLogin = function() {
      $state.go('login');
    }


    $scope.update = function(user) {
      Session
        .signup.send(user)
        .$promise
        .then(function(data) {
          $state.go('signupSuccess');
        }, Error)
      ;
    };
  })
;
