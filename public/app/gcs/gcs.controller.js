'use strict';

angular
  .module('ForgeApp')
  .controller('GCSCtrl', function ($scope, Error, Session, $http,
    $uibModal, $state, $rootScope, API, leafletData) {
      API.enableUpdates();

      var droneMarker = L.divIcon({
        className: 'map-marker chevron',
        iconSize: null,
        html:'<div class="icon"></div><div class="arrow" />'
      });

       // var attitude = $.flightIndicator('#attitude', 'attitude');
       //     attitude.setRoll(30); // Sets the roll to 30 degrees


      angular.extend($scope, {
        defaults: {
          // tileLayer: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
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
                 // API.beginMission()
               });
             }
          });

          if ($scope.currentDroneTelem) {

            var pos = $scope.currentDroneTelem.position;


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
        // API.selectDrone(name);
        // $scope.currentDrone = API.getSelectedDrone();
        $scope.currentDrone = drone || null;
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
            API.addListener(key, 'position');
            API.addListener(key, 'attitude');
            API.addListener(key, 'rates');
          } else {
            API.removeListener(key, 'status');
            API.removeListener(key, 'mode');
            API.removeListener(key, 'position');
            API.removeListener(key, 'attitude');
            API.removeListener(key, 'rates');
          }
        });
      });

      $rootScope.$on('telem:update', function(ev, data) {
        $scope.telem = data;

        angular.forEach($scope.telem, function(drone, key) {
          if ($scope.droneGeo[key]) {
            var pos = $scope.telem[key].position;
            if (pos) {
              var newLatLng = new L.LatLng(pos.Latitude, pos.Longitude);
              $scope.droneGeo[key].marker.setLatLng(newLatLng);
              $scope.droneGeo[key].marker.setRotationAngle(pos.Heading);
            }
          } else {
            $scope.droneGeo[key] = {};
            $scope.droneGeo[key].marker = L.marker([40.7420, -73.9876], {icon: droneMarker});
            leafletData.getMap('groundcontrol').then(function(map) {
              $scope.droneGeo[key].marker.addTo(map);
            });
          }
        });

        if ($scope.currentDrone) {          

          $scope.currentDroneTelem = $scope.telem[$scope.currentDrone.name];
         
           var attitude = $.flightIndicator('#attitude');
           
           var flightRoll = $scope.currentDroneTelem.attitude.Roll
           var flightPitch = $scope.currentDroneTelem.attitude.Pitch
           
           attitude.setRoll(flightRoll); // Sets the roll 
           attitude.setPitch(flightPitch);//Sets pitch
      
        }


      if ($scope.currentDrone) {          

          $scope.currentDroneTelem = $scope.telem[$scope.currentDrone.name];

           var heading = $.flightIndicator('#heading', 'heading');
           
           var flightHeading = $scope.currentDroneTelem.attitude.Yaw
           
           heading.setHeading(flightHeading); // Sets the heading 
      
        }
     

      if ($scope.currentDrone) {          

          $scope.currentDroneTelem = $scope.telem[$scope.currentDrone.name];

           var climb = $.flightIndicator('#climb', 'variometer');
           
           var flightClimb = $scope.currentDroneTelem.rates.Climb
           
           climb.setVario(flightClimb); // Sets the heading 
      
        }
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
