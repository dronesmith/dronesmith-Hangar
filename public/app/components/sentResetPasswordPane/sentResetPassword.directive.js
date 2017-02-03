
'use strict';

angular
  .module('ForgeApp')
  .directive('sentResetPasswordPane', function() {
    return {
      templateUrl: 'app/components/sentResetPasswordPane/sentResetPasswordPane.html',
      controller: 'sentResetPasswordPaneCtrl'
    }
  })
;
