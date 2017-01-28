'use strict';

angular
  .module('ForgeApp')
  .controller('SignupSuccessViewCtrl', function(
    $scope,
    Session,
    API
  ) {
    API.disableUpdates();
  })
;
