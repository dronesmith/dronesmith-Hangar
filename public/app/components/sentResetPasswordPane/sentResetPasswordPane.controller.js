
'use strict';

angular
  .module('ForgeApp')
  .controller('sentResetPasswordPaneCtrl', function ($scope, $state, Session, $stateParams) {

        console.log($stateParams);
    $scope.email = $stateParams.email;

    $scope.gotoLogin = function() {
      $state.go('login');
    }

  });
