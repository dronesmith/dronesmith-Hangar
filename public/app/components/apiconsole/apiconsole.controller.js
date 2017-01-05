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


    // TODO: improve positioning of status text
    // TODO: validate url on change
    // TODO: remind user to select drone if {drone} is in url
    // TODO: change color of status text based on error or not, maybe colored circle


    $scope.methods = [
        {id: "1", name: "GET"},
        {id: "2", name: "POST"},
        {id: "4", name: "DELETE"},
        {id: "3", name: "PUT"}
    ];


    $scope.testJSON = function(json) {
      if (json === "") {
        $scope.consoleForm.body.$setValidity('json', true);

      } else {
        try {
          JSON.parse(json);
          $scope.consoleForm.body.$setValidity('json', true);
        } catch(e) {
          $scope.consoleForm.body.$setValidity('json', false);
        }
      }

    }

    $scope.bodyDisabled = true;

    $scope.testMethod = function(method) {
      if(method === "POST" || method === "PUT" || method === "DELETE" ){
        $scope.bodyDisabled = false;
      } else {
        $scope.bodyDisabled = true;
      }

    }
    $scope.requestIconColor = "#d3d3d3";

    $scope.sendRequest = function(method, drone, urlportion, body) {
      // Clear Response text
      $scope.response = null;

      // Determine if entered url contains {drone} and replace
      // with current selected drone
      if (/({drone})/.test(urlportion)) {
        urlportion = urlportion.replace(/({drone})/, $scope.request.drone.name);
      }

      // Send API request
      API.sendRequest(method, drone, urlportion, body, function(response){
        $scope.response = response;

        // set request status icon
        if(Number(String(response.status).charAt(0)) === 4){
          $scope.requestIconColor = "#e74c3c";
        } else {
          $scope.requestIconColor = "#a0d468";
        }

      });
    }


    $scope.selectHeight = {"height": "28px"};
    $scope.opened = false;
    $scope.selectGlyph = "glyphicon glyphicon-chevron-up";

    $scope.datalogs = [];

    $rootScope.$on('drones:update', function(ev, data) {
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

    $scope.toggleView = function() {
      $scope.opened = !$scope.opened;

      if (!$scope.opened) {
        $scope.selectHeight = {"height": "28px"};
        $scope.selectGlyph = "glyphicon glyphicon-chevron-up";
      } else {
        $scope.selectHeight = {"height": "40vh"};
        $scope.selectGlyph = "glyphicon glyphicon-chevron-down";
      }
    }
  })
;
