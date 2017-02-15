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
  .controller('AccountModalCtrl',
    function (
      $scope,
      $uibModalInstance,
      Session,
      Error,
      userAccount) {
        $scope.emailSent = false;
        // always poll session since it may have been updated.
        Session.account.get({}, function(data) {
          $scope.userAccount = data.userData;
        }, Error);

        $scope.status = "";

        $scope.ok = function() {
          $uibModalInstance.dismiss('cancel');
        };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };

    $scope.resendEmail = function() {
      Session
        .resendEmailValidate.send({})
        .$promise
        .then(function functionName(data) {
          $scope.emailSent = true;
        }, Error);
    };
  })
;
