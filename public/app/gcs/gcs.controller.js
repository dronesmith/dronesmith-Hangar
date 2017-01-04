'use strict';

angular
  .module('ForgeApp')
  .controller('GCSCtrl', function ($scope, Error, Session, $http,
    $uibModal, $state, $rootScope, API, leafletData) {
      API.enableUpdates();

      function getDroneMarker(name) {
        return L.divIcon({
          className: 'chevron',
          html:'<div id="'+ name +'" class="icon"></div><p class="text-danger" style="font-weight: bold;position: relative; right: 50px;">'+name+'</p><div class="arrow" />'
        });

      }

      angular.extend($scope, {
        defaults: {
          maxZoom: 20,
          center: {
            lat: 40.7420,
            lng: -73.9876,
            zoom: 18
          },
          path: {
            weight: 10,
            color: '#800000',
            opacity: 1
          }
        }
      });

      leafletData.getMap('groundcontrol').then(function(map) {
        map.addLayer(MQ.mapLayer());
        map.on('click', function(ev) {

          var directions = MQ.routing.directions().on('success', function(data) {

            console.log($scope.droneGeo[$scope.currentDrone.name]);

            var legs = data.route.legs;
            console.log("Got route:", legs);
             if (legs && legs.length > 0) {
               var mission = legs[0].maneuvers;
               console.log(mission);
               var time = 0;
               var dist = 0;
               var dps = [];

               for (var i  = 0; i < mission.length; ++i) {
                 time += mission[i].time
                 dist += mission[i].distance
                 dps.push(new L.LatLng(mission[i].startPoint.lat, mission[i].startPoint.lng));
               }

               if ($scope.droneGeo[$scope.currentDrone.name].route) {
                 $scope.droneGeo[$scope.currentDrone.name].route.removeFrom(map);
               }

               $scope.droneGeo[$scope.currentDrone.name].route = L.polyline(dps, {color: 'red'}).addTo(map);

              //  map.addLayer(MQ.routing.routeLayer({
              //    directions: directions,
              //    fitBounds: true
              //  }));

               var modalInstance = $uibModal.open({
                 animation: true,
                 templateUrl: 'gotoModal.html',
                 controller: 'GotoModalCtrl',
                 size: 'md',
                 resolve: {
                   target: function () {
                     return {
                       name: $scope.currentDrone.name,
                       lat: ev.latlng.lat, lon: ev.latlng.lng,
                       time: time * 1000, dist: dist,
                       dir: directions
                     };
                   }
                 }
               });

               modalInstance.result.then(function () {
                 // Upload to server
                 console.log("Uploading mission...");
                 API.flyRoute($scope.currentDrone.name, mission);
               });
             }
          });

          if ($scope.currentDrone && $scope.currentDrone.position) {
            var pos = $scope.currentDrone.position;
            if (pos) {
              directions.route({
                locations: [
                  ''+pos.Latitude+', '+pos.Longitude,
                  ''+ev.latlng.lat+', '+ev.latlng.lng
                ]
              });
            }
          }
        });
      });

      $scope.droneGeo = {};

      $scope.currentDrone = null;

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
        $scope.currentDrone = drone || null;

        if ($scope.currentDrone) {
          API.getRoute($scope.currentDrone.name, function(res) {
            console.log(res);

            if (!res) {
              return;
            }
            var mission = res.chunk;
            var dps = [];

            for (var i  = 0; i < mission.length; ++i) {
              dps.push(new L.LatLng(mission[i].startPoint.lat, mission[i].startPoint.lng));
            }

            leafletData.getMap('groundcontrol').then(function(map) {
              if ($scope.droneGeo[$scope.currentDrone.name].route) {
                $scope.droneGeo[$scope.currentDrone.name].route.removeFrom(map);
              }

              $scope.droneGeo[$scope.currentDrone.name].route = L.polyline(dps, {color: 'red'}).addTo(map);
            });
          });
        }
      }

      $scope.deselectDrone = function() {
        $scope.currentDrone = null;
      }

      $rootScope.$on('drones:update', function(ev, data) {
        $scope.drones = data;

        angular.forEach($scope.drones, function(drone) {
          if (drone.online) {
            if ($scope.currentDrone) {
              if (drone.name == $scope.currentDrone.name) {
                $scope.currentDrone = drone;
              }
            }

            if (drone.position) {
              // Update Geoloc
              if ($scope.droneGeo[drone.name]) {
                var pos = drone.position;
                if (pos) {
                  var newLatLng = new L.LatLng(pos.Latitude, pos.Longitude);
                  $scope.droneGeo[drone.name].marker.setLatLng(newLatLng);
                  $scope.droneGeo[drone.name].marker.setRotationAngle(pos.Heading);
                }
              } else {
                $scope.droneGeo[drone.name] = {};
                $scope.droneGeo[drone.name].marker = L.marker([drone.position.Latitude, drone.position.Latitude], {icon: getDroneMarker(drone.name)});
                leafletData.getMap('groundcontrol').then(function(map) {
                  $scope.droneGeo[drone.name].marker.addTo(map);
                });
              }
            }
          }
        });
      });
    }
  )
  .controller('GotoModalCtrl', function ($scope, $uibModalInstance,
    leafletData, target) {
    $scope.target = target;

    $scope.ok = function() {
      $uibModalInstance.close();
    }

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    }
  })
;
