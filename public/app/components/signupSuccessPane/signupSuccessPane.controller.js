
'use strict';

angular
  .module('ForgeApp')
  .controller('SignupSuccessPaneCtrl', function ($scope, $state, Session, $stateParams) {

    $scope.email = $stateParams.email;


  });
