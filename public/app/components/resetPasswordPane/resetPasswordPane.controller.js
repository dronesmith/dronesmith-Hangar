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
  .controller('resetPasswordPaneCtrl', function ($scope, Session, User, Error) {

    $scope.passwordSubmitted = false;

    $scope.update = function(user) {
      User
        .forgotPassword(user)
        .$promise
        .then(function(data) {
          $scope.passwordSubmitted = true;
        }, Error)
      ;
    };
  })
;
