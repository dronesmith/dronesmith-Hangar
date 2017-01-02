'use strict';

angular
  .module('ForgeApp')
  .controller('GCSCtrl', function ($scope, Error, Session, $http,
    $uibModal, $state, $rootScope, API, leafletData) {
      API.enableUpdates();

      $scope.currentDrone = null;
      $scope.currentDroneTelem = null;

      $scope.showActionBar = true;
      $scope.mapArrow = "glyphicon-menu-left";

      $scope.mapOffset = {
        "margin-left": "250px"
      };

      var cmdResponseHandler = function(res) {
        console.log("Command result:", res.data);

        if (res.data.StatusCode != 0) {
          Error({status: "Command Failed", statusText: res.data.Status})
        }
      }

      $scope.takeoff = function(drone, alt) {
        API.droneCmd(drone, 'takeoff', {altitude: alt}, cmdResponseHandler);
      }

      $scope.land = function(drone) {
        API.droneCmd(drone, 'land', {}, cmdResponseHandler);
      }

      $scope.setArming = function(drone, arm) {
        API.droneCmd(drone, arm ? 'arm' : 'disarm', {}, cmdResponseHandler);
      }

      $scope.setMode = function(drone, mode) {
        console.log({'mode': mode});
        API.droneCmd(drone, 'mode', {'mode': mode}, cmdResponseHandler);
      }

      $scope.toggleActionBar = function() {
        $scope.showActionBar = !$scope.showActionBar;

        if ($scope.showActionBar) {
          $scope.mapOffset["margin-left"] = "250px";
          $scope.mapArrow = "glyphicon-menu-left";
        } else {
          $scope.mapOffset["margin-left"] = "0px";
          $scope.mapArrow = "glyphicon-menu-right";
        }
      }

      $scope.selectDrone = function(drone) {
        if ($scope.currentDrone) {
          console.log('Sys: Removing events for ' + $scope.currentDrone.name);
          API.removeListener($scope.currentDrone.name, 'position');
          API.removeListener($scope.currentDrone.name, 'attitude');
          API.removeListener($scope.currentDrone.name, 'rates');
        }

        // API.selectDrone(name);
        // $scope.currentDrone = API.getSelectedDrone();
        $scope.currentDrone = drone || null;

        if ($scope.currentDrone) {
          console.log('Sys: Adding events for ' + $scope.currentDrone.name);
          API.addListener($scope.currentDrone.name, 'position');
          API.addListener($scope.currentDrone.name, 'attitude');
          API.addListener($scope.currentDrone.name, 'rates');
        }
      }

      $rootScope.$on('drone:update', function(ev, data) {
        $scope.drones = data;

        // Add or remove drones that are online
        angular.forEach($scope.telem, function(drone, key) {

          // We don't use info here
          API.removeListener(key, 'info');

          if (drone.online) {
            API.addListener(key, 'status');
            API.addListener(key, 'mode');
          } else {
            API.removeListener(key, 'status');
            API.removeListener(key, 'mode');
          }
        });
      });

      $rootScope.$on('telem:update', function(ev, data) {
        $scope.telem = data;

        if ($scope.currentDrone) {
          $scope.currentDroneTelem = $scope.telem[$scope.currentDrone.name];
        }
      });


      leafletData.getMap('groundcontrol').then(function(map) {
        map.addLayer(MQ.mapLayer());
      })

      angular.extend($scope, {
        defaults: {
          // tileLayer: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
          maxZoom: 18,
          center: {
            lat: 40.7420,
            lng: -73.9876,
            zoom: 14
          },
          path: {
            weight: 10,
            color: '#800000',
            opacity: 1
          }
        }
      });
    }
  )
;
