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
  .controller('ResetPasswordPaneCtrl', function ($scope, $state, Session, $stateParams) {
    $scope.error = null;


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
