
'use strict';

angular
  .module('ForgeApp')
  .controller('ValidateEmailPaneCtrl', function ($scope, $state, $stateParams, Session) {
    $scope.error = $stateParams.error;
    $scope.message = ""
    $scope.messageHeader = ""

    Session
      .validateEmail.send($stateParams)
      .$promise.then(function(data) {
        $scope.messageHeader = "Thank you!";
        $scope.message = "Your email has been confirmed. We sent you an email containing your API key.";
      }, function(data) {
        $scope.error = data.data.error;
      });



  })
;
