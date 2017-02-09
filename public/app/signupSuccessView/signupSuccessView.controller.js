'use strict';

angular
  .module('ForgeApp')
  .controller('SignupSuccessViewCtrl', function($scope, $state, $stateParams, Session) {
    $scope.email = $stateParams.email;
  })
;
