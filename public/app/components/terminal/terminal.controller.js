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
  .controller('TerminalCtrl', function ($scope, $rootScope, Stream, $stateParams, $uibModal) {

    function initGateOne(server, connect) {
      GateOne.noSavePrefs['theme'] = 'solarized';
      GateOne.noSavePrefs['autoConnectURL'] = connect;
      GateOne.noSavePrefs['embedded'] = true;

      GateOne.init({
        url: server,
        theme: 'solarized',
        embedded: true,
        autoConnectURL: connect
      }, function() {
        GateOne.Base.superSandbox("NewExternalTerm", ["GateOne.Terminal", "GateOne.Terminal.Input"], function(window, undefined) {
          "use strict";
          GateOne.Terminal.newTerminal(null, null, '#term');
          $scope.loaded = true;
        });
      });
    }

    $scope.endSession = function() {
      GateOne.Terminal.closeTerm(1);
      Stream.emit('terminal:update', {drone: $stateParams.id, enable: false});
      window.close();
    };

    $scope.loaded = false;
    $scope.initial = false;

    // request terminal info from the server

    Stream.on('hb', function(data) {

      $scope.drone = data[$stateParams.id];
      $scope.terminalInfo = $scope.drone.terminalInfo;

      if (!$scope.terminalInfo) {
        if ($scope.initial) {
          $scope.error = "No terminal session currently open.";
        }
      } else if (!$scope.initial) {
        $scope.initial = true;
        $scope.pass = $scope.terminalInfo.pass;
        $scope.loginInfo = 'ssh://' + $scope.terminalInfo.uname
          + '@' + $scope.terminalInfo.url + ':' + $scope.terminalInfo.port;

          var modal = $uibModal.open({
            animation: true,
            templateUrl: 'app/components/alertModal/alertModal.html',
            controller: 'alertModalCtrl',
            resolve: {
              title: function() {
                return 'Login Info: ' + $scope.loginInfo + ' Password: ' + $scope.pass;
              },
              text: function () {
                return "The terminal somtimes to fails to log in automatically. Please note the above information. If it fails, use this login info to log in. You can also navigate back to hangar to get the info. Refreshing this page will kill your terminal session.";
              }
            }
          });

          modal.result.then(function (selectedItem) {
            initGateOne(DSSProps.gateone, $scope.loginInfo);
          }, function() {
            Stream.emit('terminal:update', {drone: $stateParams.id, enable: false});
          });
      }
    });
  })
;
