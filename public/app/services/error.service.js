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
  .factory('Error', function($state, $uibModal) {

    return function(error, kind) {
      switch (kind) {
        case 'session:null': $state.go('login'); break;
        default:
          // error modal
          $uibModal.open({
            animation: true,
            templateUrl: 'app/components/errorModal/errorModal.html',
            controller: 'ErrorModalCtrl',
            resolve: {
              error: function() { return error }
            }
          });
          break;
      }

    };
  })
;
