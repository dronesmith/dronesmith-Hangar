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
  .controller('UploaderCtrl', function (
      $scope, $http, uiUploader, User, Error) {

    var FileUploadElem = '#uploader form input[type=file]';

    $scope.uploadStatus = "";
    $scope.uploaded = false;
    $scope.files = [];
    $scope.progressBar = 0;

    // NOTE since ng-change doesn't work for file inputs, we're grabbing the
    // the element here.
    $(FileUploadElem)
      .on('change', function(e) {
        var files = e.target.files;
        uiUploader.addFiles(files);
        $scope.files = uiUploader.getFiles();
        $scope.$apply();
      })
    ;

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
          $scope.uploaderControl.drone = $scope.UserObject.drones[0];
        }, Error)
      ;
    }

    $scope.upload = function() {
        uiUploader.startUpload({
          url: '/index/mission/' + $scope.uploaderControl.kind,
          concurrency: 2,
          onProgress: function(file) {
            $scope.progressBar = (file.loaded / file.size) * 100;
            $scope.uploadStatus = "working";
            $scope.uploaded = true;
            $scope.$apply();
          },
          onCompleted: function(file, response) {
            $scope.progressBar = 100;
            if (!response) {
              Error({
                "status": "UPLOADER",
                "statusText": "Got no response from the server",
                in: "directive::uploader::controller::$scope.upload::onCompleted"});
              $scope.uploadStatus = "error";
            } else {
              var res = JSON.parse(response); // this is most likely a bug on ui Uploader's part.
              if (res.error) {
                Error({status: 400,
                  statusText: "Parse error.",
                  data: {error: res.error}});
                $scope.uploadStatus = "error";
              } else {
                if (!$scope.uploaderControl.drone) {
                  $scope.uploadStatus = "success";
                } else {
                  // TODO use drone service
                  $http
                    .put('/index/drone/addMission/' + $scope.uploaderControl.drone._id, {missionId: res.id})
                    .success(function(res) {
                      $scope.uploadStatus = "success";
                    }, Error)
                  ;
                }
              }
            }
          },
          onCompletedAll: function(files) {
            //
          },
          onError: function(error) {
            Error(error);
            $scope.uploadStatus = "error";
          }
        });
    };

    $scope.clear = function() {
      uiUploader.removeAll();
      $(FileUploadElem)
        .replaceWith($(FileUploadElem).val('').clone(true));
      $scope.uploadStatus = "";
      $scope.uploaded = false;
      $scope.progressBar = 0;
    };

  })
;
