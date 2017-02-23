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
  .controller('MainCtrl', function(
    $scope,
    $state,
    Session,
    Error
  ) {

    //
    // Get session
    //
    // Session
    //   .account.get(
    //     {},
    //     function(data) {
    //
    //       $scope.userInfo = data.userData || null;
    //
    //     if (!data.userData) {
    //       Error(null, 'session:null');
    //       if ($state.current.name == 'downloads') {
    //         $state.go('downloads');
    //       }
    //     } else {
    //       ga('set', '&uid', data.userData.id);
    //
    //       $scope.$broadcast("session:update", data.userData);
    //
    //       if ($state.current.name == 'forge') {
    //         $state.go('hangar');
    //       }
    //     }
    //   }, Error)
    // ;
  })
;
