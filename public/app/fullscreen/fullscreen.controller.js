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
  .controller('FullScreenCtrl', function ($scope, User, Drone, Error,
    Stream, $state, $stateParams) {

      var flight = [];
      var flightPath = null;
      var marker = null;

      var isMapInit = false;
      var throttler = 0;

      flightPath = new google.maps.Polyline({
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });


      function addLatLng(event) {
        var path = flightPath.getPath();

        // Because path is an MVCArray, we can simply append a new coordinate
        // and it will automatically appear.
        path.push(event.latLng);

        // Add a new marker at the new plotted point on the polyline.
        var marker = new google.maps.Marker({
          position: event.latLng,
          title: '#' + path.getLength(),
          map: $scope.myMap
        });
      }


    $scope.droneId = $stateParams.id;
    $scope.mavStream = {};
    $scope.simStream = {};
    $scope.cameraMode = 'follow';

    $scope.mapOptions = {
      // vegas
      center: new google.maps.LatLng(36.1215, -115.1739),
      zoom: 18,
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };



    if (!$scope.userInfo) {
      $scope.$on('session:update', function(ev, data) {
        $scope.userInfo = data;
        init();
      });
    } else {
      init();
    }

    function init() {
      User
        .get({id: $scope.userInfo.id})
        .$promise
        .then(function(data) {
          $scope.drones = data.drones;
        }, Error)
      ;
    }

    // Null drone means use sim.
    if (!$scope.droneId) {
      Stream.on('sim:mavlink', function(data) {
        $scope.simStream[data.header] = data.data;
        updateHud($scope.simStream);

      });

    } else {

      Stream.on('hb', function(data) {
        // console.log(data);
        $scope.liveDroneData = data;

      });

      Stream.on('mavlink', function(data) {
        $scope.preview = data;

        if (!$scope.mavStream[data.drone]) {
          $scope.mavStream[data.drone] = {};
        }

        $scope.mavStream[data.drone][data.payload.header] = data.payload.data;
        updateHud($scope.mavStream[data.drone]);
      });
    }

    $scope.updateGPS = function(stream) {

      if (!isMapInit) {
        isMapInit = true;
        flightPath.setMap($scope.myMap);
        // $scope.myMap.addListener('click', addLatLng);

        marker = new google.maps.Marker({
          title: '#0',
          map: $scope.myMap
        });
      }

      // For Simly
      if (stream['GLOBAL_POSITION_INT']) {
        var latlon = new google.maps.LatLng(
          stream['GLOBAL_POSITION_INT'].lat / 1e7,
          stream['GLOBAL_POSITION_INT'].lon / 1e7);

          throttler++;

          if (throttler > 100) {
            $scope.myMap.panTo(latlon);
            var path = flightPath.getPath();
            path.push(latlon);
            marker.setPosition(latlon);
            throttler = 0;
          }
      }



      // if (stream['GPS_GLOBAL_ORIGIN']) {
      //
      //   var latlon = new google.maps.LatLng(
      //     stream['GPS_GLOBAL_ORIGIN'].latitude / 1e7,
      //     stream['GPS_GLOBAL_ORIGIN'].longitude / 1e7);
      //
      //   throttler++;
      //
      //   if (throttler > 200) {
      //     $scope.myMap.panTo(latlon);
      //     var path = flightPath.getPath();
      //     path.push(latlon);
      //     throttler = 0;
      //   }
      //
      // }

      // if (stream['VFR_HUD']) {
      //   $scope.myMap.panBy(
      //     -(stream['VFR_HUD'].groundspeed*Math.cos(stream['VFR_HUD'].heading * (3.14159 / 180))),
      //     -(stream['VFR_HUD'].groundspeed*Math.sin(stream['VFR_HUD'].heading * (3.14159 / 180)))
      //   );
      // }
    };

    $scope.getDisplayText = function(str) {
      var stream;
      if ($scope.droneId) {
        stream = $scope.mavStream[$scope.droneId];
      } else {
        stream = $scope.simStream;
      }

      if (!stream || !stream['ATTITUDE']
        || !stream['VFR_HUD'] || !stream['SYS_STATUS']) {
        return 0;
      }

      switch (str) {
        case 'roll': return (stream['ATTITUDE'][str] * (180 / 3.1415)).toFixed(2); break;

        case 'alt':
        case 'groundspeed':
        case 'throttle': return (stream['VFR_HUD'][str]).toFixed(2); break;

        case 'battery_remaining': return (stream['SYS_STATUS'][str]); break;

        case 'roll': return (stream['ATTITUDE'][str] * (180 / 3.1415)).toFixed(2); break;
      }
    }

    function updateHud(stream) {
      var width = window.innerWidth;
      var height = window.innerHeight;
      var loch;
      var locw;

      stream.camera = $scope.cameraMode;

      $scope.updateGPS(stream);

      $('#throttleHeading').css({
        top: (height / 2) - 60,
        left: (width / 2) - 180
      });
      $('#speedHeading').css({
        top: (height / 2) - 60,
        left: (width / 2) + 135
      });

      $('#batteryHeading').css({
        top: (height / 2),
        left: (width / 2) - 80
      });

      $('#bat').css({
        top: (height / 2) + 10,
        left: (width / 2) - 80
      });

      $('#altHeading').css({
        top: (height / 2),
        left: (width / 2) + 80
      });

      $('#alt').css({
        top: (height / 2) + 10,
        left: (width / 2) + 80
      });

      if (stream['VFR_HUD']) {
        var throttlegui = $('#throttleArrow');
        var throttletext = $('#throttleAngle');

        var groundspeedArrow = $('#groundspeedArrow');
        var groundspeedText = $('#speed');

        loch = (height / 2) + 140 - stream['VFR_HUD'].throttle;
        locw = (width / 2) - 150;

        throttlegui.css({
          top: loch,
          left: locw
        });

        throttletext.css({
          top: loch,
          left: locw - 40
        });

        loch = (height / 2) + 140 - stream['VFR_HUD'].groundspeed * 10;
        locw = (width / 2) + 135;
        groundspeedArrow.css({
          top: loch,
          left: locw,
          transform: 'scaleX(-1)'
        });

        groundspeedText.css({
          top: loch,
          left: locw + 20
        });

        var scaling = 1.5;

        // if (stream['VFR_HUD'].heading < 225 || stream['VFR_HUD'].heading > 315) {
          $('#compassN').css({
            position: 'fixed',
            top: '14%',
            left: (width / 2) - (stream['VFR_HUD'].heading) * scaling
          });
        // }

        // $('#compassN2').css({
        //   position: 'fixed',
        //   top: '14%',
        //   left: (width / 2) - (stream['VFR_HUD'].heading + 360) * scaling
        // });

        $('#compassE').css({
          position: 'fixed',
          top: '14%',
          left: (width / 2) - (stream['VFR_HUD'].heading + 90) * scaling
        });

        $('#compassS').css({
          position: 'fixed',
          top: '14%',
          left: (width / 2) - (stream['VFR_HUD'].heading - 90) * scaling
        });

        $('#compassW').css({
          position: 'fixed',
          top: '14%',
          left: (width / 2) - (stream['VFR_HUD'].heading - 180) * scaling
        });
      }

      if (stream['ATTITUDE']) {

        // Grab elements
        var elem = $('#flightangle');
        var arrow = $('#angleArrow');
        var rollText = $('#rollAngle');


        var rval = stream['ATTITUDE'].roll * (180 / 3.1415);
        var pval = stream['ATTITUDE'].pitch * (180 / 3.1415);

        loch = (height / 2) + 18 - (100 * Math.cos(stream['ATTITUDE'].roll * 2 * 3.1415));
        locw = (width / 2) - (100 * Math.sin(stream['ATTITUDE'].roll * 2 * 3.1415));

        elem.css({
            transform: 'rotate(' + -rval + 'deg)' + 'rotateX(' + -pval + 'deg)'
        });

        arrow.css({
          top: loch,
          left: locw
        });

        rollText.css({
          top:    loch - 10,
          left:   locw
        });

      }
    }

  })
;
