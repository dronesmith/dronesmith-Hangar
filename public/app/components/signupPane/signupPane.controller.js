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
  .controller('signupPaneCtrl', function ($scope, Session, User, Error) {

    $scope.signupSubmitted = false;

    $scope.update = function(model) {
      var user = new User(model);
        user
          .$save()
          .then(function(data) {
            $scope.signupSubmitted = true;
          }, Error)
        ;
    };
  })
;
