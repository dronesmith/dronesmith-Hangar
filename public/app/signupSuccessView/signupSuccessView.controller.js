'use strict';

angular
  .module('ForgeApp')
  .controller('SignupSuccessViewCtrl', function($scope, $state, $stateParams, Session, API) {
    $scope.email = $stateParams.email;

    API.disableUpdates();
  })
;
