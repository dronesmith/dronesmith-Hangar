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
  .controller('APIConsoleCtrl', function ($scope, $rootScope, $interval, API) {

    $scope.selectHeight = {"height": "5vh"};
    $scope.opened = false;
    $scope.selectGlyph = "glyphicon-triangle-top";

    $scope.datalogs = [];

    $rootScope.$on('telem:update', function(ev, data) {
      $scope.datalogs = [];
      var logs = API.getLog();

      for (var i = logs.length-1; i >= 0; --i) {
        var log = logs[i];

        switch (log.method) {
          case 'GET': log.methodClass = 'label-success'; break;
          case 'POST': log.methodClass = 'label-info'; break;
          case 'PUT': log.methodClass = 'label-default'; break;
          case 'DELETE': log.methodClass = 'label-danger'; break;
        }

        $scope.datalogs.push(log);
      }
    });

    // $scope.datalogs = {};
    // $scope.datalogs.get = function(index, count, success) {
    //
    //   $interval(function() {
    //     var logs = API.getLog();
    //     var chunk = [];
    //
    //     for (var i = index; i < logs.length && i <= index + count - 1; i++) {
    //       var log = logs[i];
    //
    //       if (log) {
    //         switch (log.method) {
    //           case 'GET': log.methodClass = 'label-success'; break;
    //           case 'POST': log.methodClass = 'label-info'; break;
    //           case 'PUT': log.methodClass = 'label-default'; break;
    //           case 'DELETE': log.methodClass = 'label-danger'; break;
    //         }
    //
    //         chunk.push(log);
    //       }
    //     }
    //
    //     success(chunk);
    //   }, 2000);
    // };

    $scope.toggleView = function() {
      $scope.opened = !$scope.opened;

      if (!$scope.opened) {
        $scope.selectHeight = {"height": "5vh"};
        $scope.selectGlyph = "glyphicon-triangle-top";
      } else {
        $scope.selectHeight = {"height": "40vh"};
        $scope.selectGlyph = "glyphicon-triangle-bottom";
      }
    }
  })
;