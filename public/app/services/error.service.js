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
  .factory('Error', function($state, $uibModal, $rootScope) {

    var ModalOpened = false;
    var APIoff = true;

    $rootScope.$on('api:disable', function() {
      APIoff = true;
    });

    $rootScope.$on('api:enable', function() {
      APIoff = false;
    });

    return function(error, kind) {
      switch (kind) {
        case 'session:null': $state.go('hangar'); break;
        default:
          // error modal
          if (!ModalOpened && !APIoff) {
            ModalOpened = true;
            var instance = $uibModal.open({
              animation: true,
              templateUrl: 'app/components/errorModal/errorModal.html',
              controller: 'ErrorModalCtrl',
              resolve: {
                error: function() { return error }
              }
            });

            instance.result.then(function () {
              ModalOpened = false;
            }, function() { ModalOpened = false; });
          }
          break;
      }

    };
  })
;
