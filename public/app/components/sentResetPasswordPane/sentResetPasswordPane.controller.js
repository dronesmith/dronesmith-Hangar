
'use strict';

angular
  .module('ForgeApp')
  .controller('SentResetPasswordPaneCtrl', function ($scope, $state, Session, $stateParams) {

    $scope.email = $stateParams.email;


  });
