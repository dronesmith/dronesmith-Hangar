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
  .controller('LoginPaneCtrl', function ($scope, $state, $stateParams, Session, progressSpinner, Error) {


    $scope.error = $stateParams.error;

    $scope.gotoSignup = function() {
      $state.go('signup');
    }
    $scope.testchange = function(){
      console.log("changed");
    }
    $scope.update = function(user) {

      progressSpinner.start();

      Session
        .account.authenticate(user)
        .$promise
        .then(function(data) {
          progressSpinner.complete();
          $state.go('hangar');

        }, function(data){

          progressSpinner.complete();
          $scope.error = data.data.error;
          $state.go('.', {error: $scope.error}, {reload: true});


        })
      ;
    };
  })
;
