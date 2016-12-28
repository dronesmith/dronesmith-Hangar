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

  // Add dependencies here
  .module('ForgeApp', [
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'ui.uploader',
    'ui.map',
    'ui.ace',
    'nvd3',
    'ngCsv'
  ])

  // Global configuration here
  .config(function (
    $stateProvider,
    $urlRouterProvider,
    $locationProvider
  ) {

    // Configure app state machine
    $stateProvider

      // Forge is the global non-error state. The app should always rest here.
      .state('forge', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })

      .state('live', {
        url: '/live/:id',
        templateUrl: 'app/fullscreen/fullscreen.html',
        controller: 'FullScreenCtrl'
      })

      // Hangar view
      .state('hangar', {
        url: 'hangar',
        templateUrl: 'app/hangar/hangar.html',
        controller: 'HangarCtrl',
        parent: 'forge'
      })

      // Reporting view
      .state('analytics', {
        url: 'analytics',
        templateUrl: 'app/reporting/reporting.html',
        controller: 'ReportingCtrl',
        parent: 'forge'
      })

      // Upload flight state
      // .state('upload', {
      //   url: 'upload',
      //   template: '<uploader></uploader>',
      //   parent: 'forge'
      // })

      // Login state. The app should always redirect to this state whenever the
      // session returned is null.
      .state('login', {
        url: '/login',
        templateUrl: 'app/loginView/loginView.html',
        controller: 'LoginViewCtrl'
      })
    ;

    $urlRouterProvider
      .otherwise('/')
    ;

    $locationProvider
      .hashPrefix('!')
      .html5Mode(false)
    ;
  })
;

// Init Google Maps
window.onGoogleReady = function() {
  angular.bootstrap(document.getElementById("map"), ['ui.map']);
};
