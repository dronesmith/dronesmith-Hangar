'use strict';

angular
  .module('ForgeApp')
  .controller('SignupViewCtrl', function(
    $scope,
    Session,
    API
  ) {
    API.disableUpdates();
  })
;
