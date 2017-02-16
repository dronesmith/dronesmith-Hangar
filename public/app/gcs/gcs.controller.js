'use strict';

angular
  .module('ForgeApp')
  .controller('GCSCtrl', function ($scope, Error, Session, $http,
    $uibModal, $state, $rootScope, API, leafletData, $timeout) {

      // =======================================================================
      // CONTROLLER PROPERTIES
      // =======================================================================

      // This object represents all of the dynamic map data for each drone,
      // such as its marker, and flight path.
      $scope.droneGeo = {};

      // This object represents the current selected drone.
      $scope.currentDrone = null;

      // Toggle action bar boolean
      $scope.showActionBar = true;

      // Change the button icon depending on toggle state.
      $scope.mapArrow = "glyphicon-menu-left";

      // Map offset style, used for resizing the map.
      $scope.mapOffset = {
        "margin-left": "250px"
      };

      $scope.routeOffset = {
        "margin-left": "300px"
      };

      $scope.routeToolClass = 'btn-primary';
      $scope.panToolClass = 'btn-success';
      $scope.gotoToolClass = 'btn-primary';
      $scope.homeToolClass = 'btn-primary';
      $scope.selectedTool = 'pan';

      var droneInModal = null;

      // =======================================================================
      // PRIVATE FUNCTIONS
      // =======================================================================

      // Generates a drone marker. Name will be the display name.
      function getDroneMarker(name) {
        return L.divIcon({
          'className': 'mapview-marker-icon',
          html:'<img style="margin-left:-13px;margin-top:-20px;" width="35px" src="/assets/img/waypoint.svg">'
        });
      }

      // Handles command responses from server.
      var cmdResponseHandler = function(res) {
        console.log("Command result:", res.data);

        if (res.data.StatusCode != 0) {
          Error({status: "Command Failed", statusText: res.data.Status});
        }
      }

      // Send alert message
      function modalAlert(title, content, cb) {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'app/components/alertModal/alertModal.html',
          controller: 'alertModalCtrl',
          size: 'md',
          resolve: {
            title: function () {
              return title;
            },
            text: function () {
              return content;
            }
          }
        });

        modalInstance.result.then(function() {
          cb(true);
        }, function() {
          cb(false);
        });
      }

      // Main function for setting up flight paths
      function performRoute(map, drone, locStr, land) {

        droneInModal = drone.name;

        // Initialize the mapQuest route API, and listen for successful route events.
        var directions = MQ.routing.directions().on('success', function(data) {

            //
            // The following code is used to draw a polyline to show the map route,
            // and calculate approx. time and distance. (Based on automobiles, unfortunately.)
            // The droneGeo object stores all of the dynamic map related data, such as the drone marker
            // and mission path.
            //

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

             if ($scope.droneGeo[drone.name].route) {
               $scope.droneGeo[drone.name].route.removeFrom(map);
               $scope.droneGeo[drone.name].route = undefined;
             }

             $scope.droneGeo[drone.name].route = L.polyline(dps, {color: 'red'}).addTo(map);

            // FIXME - MQ route layer wasn't showing up. So I drew a polyline instead.
            //  map.addLayer(MQ.routing.routeLayer({
            //    directions: directions,
            //    fitBounds: true
            //  }));

            //
            // Open a modal (popup) to task the user if they want to fly the drone to
            // this location.
            //
            var startLat = dps[0].lat;
            var startLon = dps[0].lng;
             var modalInstance = $uibModal.open({
               animation: true,
               templateUrl: 'gotoModal.html',
               controller: 'GotoModalCtrl',
               size: 'md',
               resolve: {
                 target: function () {
                   return {
                     name: drone.name,
                     lat: startLat, lon: startLon,
                     time: time * 1000, dist: dist,
                     dir: directions
                   };
                 }
               }
             });

             // Either cancel the mission, or upload and begin mission.
             modalInstance.result.then(function () {
               droneInModal = null;
               // Upload to server
               console.log("Uploading mission...");
               API.flyRoute(drone.name, mission, land);
              //  for (var k in $scope.droneGeo) {
              //    if ($scope.droneGeo[k].route && (k != drone.name)) {
              //     //  $scope.droneGeo[k].route.removeFrom(map);
              //     $scope.droneGeo[k].route.setStyle({color: '#2C3E50'});
              //    }
              //  }
             }, function() {
               droneInModal = null;
               $scope.droneGeo[drone.name].route.removeFrom(map);
               $scope.droneGeo[drone.name].route = undefined;
             });
           }
        });

        // calculate the route for the drone to fly here. Emits a `success`
        // event when finished, allowing the above code to executre.
        // We need to make sure there is a current drone with a valid
        // position before we do this.
        if (drone && drone.position) {
          var pos = drone.position;
          if (pos) {
            console.log("Routing...");
            directions.route({
              locations: [
                ''+pos.Latitude+', '+pos.Longitude,
                locStr
              ]
            });
          }
        }
      }

      // =======================================================================
      // CONTROLLER INIT CODE
      // =======================================================================

      // Tell the API Service to begin polling for udpdates.
      API.enableUpdates();

      // Set up dials
      var attitude = $.flightIndicator('#attitude');
      var heading = $.flightIndicator('#heading', 'heading');
      attitude.resize(150, 150);
      heading.resize(150, 150);

      // Set up default settings for our groundcontrol map.
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

      // Get the ground control map.
      leafletData.getMap('groundcontrol').then(function(map) {

        // Add MapQuest tiles
        map.addLayer(MQ.mapLayer());

        // Add Layers Control
        var layers = {
          'Map': MQ.mapLayer(),
          'Hybrid': MQ.hybridLayer(),
          'Satellite': MQ.satelliteLayer(),
          'Dark': MQ.darkLayer(),
          'Light': MQ.lightLayer(),
        };

        L.control.layers(layers, null, {position:'topleft'}).addTo(map);

        // Check for click events
        map.on('click', function(ev) {
          if ($scope.selectedTool == 'route') {
            performRoute(map, $scope.currentDrone, ''+ev.latlng.lat+', '+  ''+ev.latlng.lng, false);
          } else if ($scope.selectedTool == 'goto') {

            modalAlert("Fly directly to this location?", "Latitude: " + ev.latlng.lat + ", Longitude: " + ev.latlng.lng, function(good) {
              if (good) {
                API.droneCmd($scope.currentDrone.name, 'goto',
                  {lat: ev.latlng.lat, lon: ev.latlng.lng}, cmdResponseHandler);
                API.cancelRoute($scope.currentDrone.name);
              }
            });
          } else if ($scope.selectedTool == 'home') {
            modalAlert("Set home at this location?", "Latitude: " + ev.latlng.lat + ", Longitude: " + ev.latlng.lng, function(good) {
              if (good) {
                API.droneCmd($scope.currentDrone.name, 'home',
                  {lat: ev.latlng.lat, lon: ev.latlng.lng}, function() {
                    $timeout(function () {
                      $scope.updateHome($scope.currentDrone);
                    }, 2000);
                  });
              }
            });
          }
        });
      });

      // =======================================================================
      // CONTROLLER METHODS
      // =======================================================================

      // Command drone to takeoff
      $scope.takeoff = function(drone, alt) {
        API.droneCmd(drone, 'takeoff', {altitude: alt}, cmdResponseHandler);

        // Also, cancel the route if there is one.
        API.cancelRoute(drone);
      }

      // Command drone to land
      $scope.land = function(drone) {
        API.droneCmd(drone, 'land', {}, cmdResponseHandler);

        // Also, cancel the route if there is one.
        API.cancelRoute(drone);
      }

      // Get number of drones online
      $scope.getOnlineCnt = function() {
        var cnt = 0;
        angular.forEach($scope.drones, function(drone) {
          if (drone.online) {
            cnt++;
          }
        });
        return cnt;
      }

      // Arm/disarm drone
      $scope.setArming = function(drone, arm) {
        var armingStr = '';

        if (arm) {
          armingStr = "Arming " + drone + " will enable its motors, and could have adverse side effects.";
        } else {
          armingStr =  "Disarming " + drone + " will stop its motors from functioning, and could have adverse side effects.";
        }

        modalAlert("Are you sure?", armingStr, function(doAction) {
            if (doAction) {
              API.droneCmd(drone, arm ? 'arm' : 'disarm', {}, cmdResponseHandler);

              // Also, cancel the route if there is one.
              API.cancelRoute(drone);
            }
        });
      }

      $scope.selectTool = function(tool) {
        $scope.selectedTool = tool;
        if (tool == 'pan') {
          $scope.routeToolClass = 'btn-primary';
          $scope.panToolClass = 'btn-success';
          $scope.gotoToolClass = 'btn-primary';
          $scope.homeToolClass = 'btn-primary';
        } else if (tool == 'route') {
          $scope.routeToolClass = 'btn-success';
          $scope.panToolClass = 'btn-primary';
          $scope.gotoToolClass = 'btn-primary';
          $scope.homeToolClass = 'btn-primary';
        } else if (tool == 'goto') {
          $scope.routeToolClass = 'btn-primary';
          $scope.panToolClass = 'btn-primary';
          $scope.gotoToolClass = 'btn-success';
          $scope.homeToolClass = 'btn-primary';
        } else if (tool == 'home') {
          $scope.routeToolClass = 'btn-primary';
          $scope.panToolClass = 'btn-primary';
          $scope.gotoToolClass = 'btn-primary';
          $scope.homeToolClass = 'btn-success';
        }
      }

      $scope.sendFleetHome = function() {

        modalAlert("Are you sure?", "This action will send all online drones to their home locations.", function(good) {
         if (good) {
           angular.forEach($scope.drones, function(drone) {
             if (drone.online) {

               // Initialize the mapQuest route API, and listen for successful route events.
               var directions = MQ.routing.directions().on('success', function(data) {

                   //
                   // The following code is used to draw a polyline to show the map route,
                   // and calculate approx. time and distance. (Based on automobiles, unfortunately.)
                   // The droneGeo object stores all of the dynamic map related data, such as the drone marker
                   // and mission path.
                   //

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

                    console.log("Uploading mission...");
                    API.flyRoute(drone.name, mission, false);
                  }
                });

                API.getTelem(drone.name, 'home', function(data) {
                  if (drone && drone.position) {
                    var pos = drone.position;
                    if (pos) {
                      console.log("Routing...");
                      directions.route({
                        locations: [
                          ''+pos.Latitude+', '+pos.Longitude,
                          ''+data.data.Latitude+', '+  ''+data.data.Longitude
                        ]
                      });
                    }
                  }
                });
             }
           });
         }
       });
      }

      // change drone flight mode
      $scope.setMode = function(drone, mode) {
        API.droneCmd('mode', {'mode': mode}, cmdResponseHandler);

        // Also, cancel the route if there is one.
        API.cancelRoute(drone);
      }

      $scope.routeHome = function(drone) {
        API.getTelem('home', function(data) {
          leafletData.getMap('groundcontrol').then(function(map) {
            performRoute(map, drone, ''+data.data.Latitude+', '+  ''+data.data.Longitude, false);
          });
        });
      }


      function what3words(w3w, cb) {
        $http({
          method: 'GET',
          url: 'https://api.what3words.com/v2/forward?addr='+ w3w +'&display=minimal&format=json&key=BXIP296D'
        }).then(function successCallback(response) {

          cb(response.data.geometry.lat, response.data.geometry.lng);
        }, Error);
      }

      $scope.gotoLoc = function(drone, address) {
        what3words(address, function(lat, lng) {
          modalAlert("Fly directly to this location?", "Latitude: " + lat + ", Longitude: " + lng, function(good) {
            if (good) {
              API.droneCmd($scope.currentDrone.name, 'goto',
                {lat: lat, lon: lng}, cmdResponseHandler);
              API.cancelRoute($scope.currentDrone.name);
            }
          });
        });
      }

      $scope.homeLoc = function(drone, address) {
        var re = /^([a-z]+\.+[a-z]+\.+[a-z]*$)/g;

        if(address.match(re) != null){
            console.log("Valid what3words address");
            what3words(address, function(lat, lng) {
              modalAlert("Set home at this location?", "Latitude: " + lat + ", Longitude: " + lng, function(good) {
                if (good) {
                 API.droneCmd('home',
                   {lat: lat, lon: lng}, function() {
                     $timeout(function () {
                       $scope.updateHome($scope.currentDrone);
                     }, 2000);
                   });
                 }
               });
            });
        } else {

          MQ.geocode().search(address).on('success', function(ev) {
            debugger;
            var best = ev.result.best;
            var latlng = best.latlng;
            debugger;
            modalAlert("Set home at this location?", "Latitude: " + latlng.lat + ", Longitude: " + latlng.lng, function(good) {
             if (good) {
               debugger;
               API.droneCmd('home',
                 {lat: latlng.lat, lon: latlng.lng}, function(res) {
                     debugger;
                   $timeout(function () {
                     $scope.updateHome($scope.currentDrone);
                   }, 2000);
                 });
             }
            });
          });
        }


      }

      $scope.routeLoc = function(drone, address) {
        leafletData.getMap('groundcontrol').then(function(map) {
          var re = /^([a-z]+\.+[a-z]+\.+[a-z]*$)/g;

          if(address.match(re) != null){
              //console.log("Valid what3words address");
              what3words(address, function(lat, lng) {
                performRoute(map, drone, ''+lat+', '+  ''+lng, false);
              });

          } else {
            performRoute(map, drone, address, false);
          }

        });
      }

      // toggle the drone column
      $scope.toggleActionBar = function() {
        $scope.showActionBar = !$scope.showActionBar;

        if ($scope.showActionBar) {
          $scope.mapOffset["margin-left"] = "250px";
          $scope.routeOffset["margin-left"] = "300px";
          $scope.mapArrow = "glyphicon-menu-left";
        } else {
          $scope.mapOffset["margin-left"] = "0px";
          $scope.mapArrow = "glyphicon-menu-right";
          $scope.routeOffset["margin-left"] = "50px";
        }
      }

      $scope.updateHome = function(drone) {
        leafletData.getMap('groundcontrol').then(function(map) {

          angular.forEach($scope.droneGeo, function(drone) {
            if (drone.homeMarker) {
              drone.homeMarker.removeFrom(map);
              drone.homeMarker = undefined;
            }
          });

          API.getHome(function(res) {
            debugger;
            if (!$scope.droneGeo[drone.name].homeMarker) {
              $scope.droneGeo[drone.name].homeMarker = L.marker([res.data.Latitude, res.data.Longitude],
                {
                  icon: L.divIcon({
                    'className': 'mapview-marker-icon',
                    html: '<div><span style="color: #003B71; font-size: 2em;" class="glyphicon glyphicon-home"></span></div><p class="text-warning" style="font-weight: bold; position: relative; bottom: 2px;">'+drone.name+' home</p>'
                  })
                });
              $scope.droneGeo[drone.name].homeMarker.addTo(map);
            } else {
              var newLatLng = new L.LatLng(res.data.Latitude, res.data.Longitude);
              $scope.droneGeo[drone.name].homeMarker.setLatLng(newLatLng);
            }
          });
        });
      }

      // Select a drone.
      $scope.selectDrone = function(drone) {

        $scope.currentDrone = angular.copy(drone) || null;

        $scope.updateHome(drone);
debugger;
        // Pan to drone location.
        leafletData.getMap('groundcontrol').then(function(map) {
          if ($scope.currentDrone.position) {
            map.panTo(new L.LatLng($scope.currentDrone.position.Latitude, $scope.currentDrone.position.Longitude));
          }
        });

        if ($scope.currentDrone) {
          // Update current flight path.
          API.getAllRoutes(function(res) {
            if (!res) {
              return;
            }

            leafletData.getMap('groundcontrol').then(function(map) {
              for (var k in res) {
                var mission = res[k].chunk;
                var dps = [];

                for (var i  = 0; i < mission.length; ++i) {
                  dps.push(new L.LatLng(mission[i].startPoint.lat, mission[i].startPoint.lng));
                }

                if ($scope.currentDrone.name == k) {
                  if ($scope.droneGeo[k].route) {
                    $scope.droneGeo[k].route.setStyle({color: 'red'});
                  } else {
                    $scope.droneGeo[k].route = L.polyline(dps, {color: 'red'}).addTo(map);
                  }
                }
                else if ($scope.droneGeo[k].route) {
                  $scope.droneGeo[k].route.setStyle({color: '#2C3E50'});
                } else {
                  $scope.droneGeo[k].route = L.polyline(dps, {color: '#2C3E50'}).addTo(map);
                }
              }
            });
          });
        }
      }

      function updateRoutes() {
        // Update current flight path.
        API.getAllRoutes(function(res) {
          if (!res) {
            return;
          }

          leafletData.getMap('groundcontrol').then(function(map) {
            angular.forEach($scope.drones, function(drone) {
              var k = drone.name;

              // Don't update if in a modal
              if (k == droneInModal) {
                return;
              }

              if (res[k]) {
                // has a mission
                var mission = res[k].chunk;
                var dps = [];

                for (var i  = 0; i < mission.length; ++i) {
                  dps.push(new L.LatLng(mission[i].startPoint.lat, mission[i].startPoint.lng));
                }

                if (!$scope.droneGeo[k]) {
                  $scope.droneGeo[k] = {};
                }

                var lineStyle = {
                  color: '#2C3E50'
                };

                if ($scope.currentDrone && $scope.currentDrone.name == k) {
                  lineStyle['color'] = 'red';
                  lineStyle['z-index'] = '2000';
                }

                if ($scope.droneGeo[k].route) {
                  $scope.droneGeo[k].route.removeFrom(map);
                  $scope.droneGeo[k].route = L.polyline(dps, lineStyle).addTo(map);
                } else {
                  $scope.droneGeo[k].route = L.polyline(dps, lineStyle).addTo(map);
                }
              } else {
                // doesn't have a mission
                if ($scope.droneGeo[k] && $scope.droneGeo[k].route) {
                  // if there's a route, delete it
                  $scope.droneGeo[k].route.removeFrom(map);
                  $scope.droneGeo[k].route = undefined;
                }
              }
            });
          });
        });
      }

      // Deselect a drone
      $scope.deselectDrone = function() {

        $scope.currentDrone = null;

        leafletData.getMap('groundcontrol').then(function(map) {
          for (var k in $scope.droneGeo) {
            if ($scope.droneGeo[k].route) {
              $scope.droneGeo[k].route.setStyle({color: '#2C3E50'});
            }
          }
        });
      }

      // =======================================================================
      // EVENT LISTENER (UPDATE LOOP)
      // =======================================================================

      // Get updates from API.
      $rootScope.$on('drones:update', function(ev, data) {

        // Update drones object, which represents all drone telemetry data.
        $scope.drones = data;

        // Filter drones that aren't online
        angular.forEach($scope.drones, function(drone) {
          if (drone.online) {
            if ($scope.currentDrone) {
              if (drone.name == $scope.currentDrone.name) {
                $scope.currentDrone = angular.copy(drone);

                 var flightRoll = $scope.currentDrone.attitude.Roll;
                 var flightPitch = $scope.currentDrone.attitude.Pitch;
                 attitude.setRoll(flightRoll); // Sets the roll
                 attitude.setPitch(flightPitch);//Sets pitch

                 var flightHeading = $scope.currentDrone.attitude.Yaw
                 heading.setHeading(flightHeading); // Sets the heading
              }
            }

            // Update marker info
            if (drone.position) {
              // Update Geoloc
              if ($scope.droneGeo[drone.name] && $scope.droneGeo[drone.name].marker) {
                var pos = drone.position;
                if (pos) {
                  var newLatLng = new L.LatLng(pos.Latitude, pos.Longitude);
                  $scope.droneGeo[drone.name].marker.setLatLng(newLatLng);
                  $scope.droneGeo[drone.name].nameMarker.setLatLng(newLatLng);
                  $scope.droneGeo[drone.name].marker.setRotationAngle(pos.Heading);
                }
              } else {
                $scope.droneGeo[drone.name] = {};
                $scope.droneGeo[drone.name].marker = L.marker([drone.position.Latitude, drone.position.Latitude], {icon: getDroneMarker(drone.name)});
                $scope.droneGeo[drone.name].nameMarker = L.marker([drone.position.Latitude, drone.position.Longitude],
                  {icon: L.divIcon({
                    'className': 'mapview-marker-icon',
                    html: '<p class="text-warning" style="font-weight: bold; position: relative; bottom: 6px; left: 32px;">'+drone.name+'</p>'})
                  });
                leafletData.getMap('groundcontrol').then(function(map) {
                  $scope.droneGeo[drone.name].marker.addTo(map);
                  $scope.droneGeo[drone.name].nameMarker.addTo(map);
                });
              }
            }
          }
        });

        // Remove any geo data if a drones object doesn't exist
        angular.forEach($scope.droneGeo, function(drone, key) {
          var found = false;
          for (var i = 0; i < $scope.drones.length; ++i) {
            if ($scope.drones[i].name == key && $scope.drones[i].online) {
              found = true;
              break;
            }
          }

          if (!found) {
            // remove geodata
            leafletData.getMap('groundcontrol').then(function(map) {
              if (drone.marker) {
                drone.marker.removeFrom(map);
              }

              if (drone.nameMarker) {
                drone.nameMarker.removeFrom(map);
              }

              if (drone.homeMarker) {
                drone.homeMarker.removeFrom(map);
              }
            });
          }
        });


        updateRoutes();
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
