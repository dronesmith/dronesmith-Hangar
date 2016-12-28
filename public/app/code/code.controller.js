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

angular
  .module('ForgeApp')
  .controller('CodeCtrl', function ($scope, $http, Stream, User) {

    $scope.output = [];
    $scope.droneToCode = null;

    $('.aceEditor').css({
      height: window.innerHeight
    });

    Stream.on('sim:output', function(data) {
      $scope.output.push(data);
    });

    $scope.aceLoaded = function(_editor) {
      // Options
      // _editor.setReadOnly(true);

      var session = _editor.session;

      $scope.aceSession = session;

      $http.get('app/code/demo2.py').then(function(ev) {
        session.insert({}, ev.data);
      });
    };

    $scope.aceChanged = function(e) {
      //
    };

    $scope.runSim = function() {
      // upload and run on simly
      $scope.output = [];

      var code = $scope.aceSession.getValue();

      $http
        .post('/index/code/exec/run', {code: code})
        .then(function(ev) {
          // $scope.output.push(ev);
        })
      ;

    };

    $scope.runDroneCode = function() {
      $scope.output = [];
      var code = $scope.aceSession.getValue();

      Stream.emit('drone:code', {code: code, drone: $scope.droneToCode._id});
    }

    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize(e) {
      $('.aceEditor').css({
        height: window.innerHeight
      });
    }

    if (!$scope.userInfo) {
      $scope.$on('session:update', function(ev, data) {
        $scope.userInfo = data;
        initUser();
      });
    } else {
      initUser();
    }

    function initUser() {
      // Get user information
      User
        .get({id: $scope.userInfo.id})
        .$promise
        .then(function(data) {
          $scope.UserObject = data;
          $scope.droneToCode = $scope.UserObject.drones[0];
        }, Error)
      ;
    }

  })
;
