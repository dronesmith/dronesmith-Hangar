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
  .controller('DownloadsCtrl', function(
    $scope,
    $state,
    $http,
    Session,
    $window,
    Error
  ) {
    $scope.structure = {
    };

    var storage = firebase.storage();
    var storageRef = storage.ref();

    // Get the meta file
    storageRef
      .child('manifest.json')
      .getDownloadURL()
      .then(function(url) {
        $http.get(url).then(function(file) {
          $scope.structure = angular.copy(file.data);
        });
      })
    ;

     $scope.getDlRef = function(key, obj) {
      var fRef = storageRef.child(key+'/'+obj);
      fRef.getDownloadURL().then(function(f) {
        $window.open(f, "_blank");
      });
    };
  })
;
