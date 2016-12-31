'use strict';

angular
  .module('ForgeApp')
  .controller('GCSCtrl', function ($scope, Error, Session, $http,
    $uibModal, $state, $rootScope, API, leafletData) {
      API.enableUpdates();

      $rootScope.$on('drone:update', function(ev, data) {
        $scope.drones = data;
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
