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
    'nemLogging',
    'ui-leaflet',
    'ngAnimate',
    'progressSpinner'
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

      // Hangar view
      .state('gcs', {
        url: 'gcs',
        templateUrl: 'app/gcs/gcs.html',
        controller: 'GCSCtrl',
        parent: 'forge'
      })

      // Login state. The app should always redirect to this state whenever the
      // session returned is null.
      .state('loginView', {
        abstract:true ,
        templateUrl: 'app/loginView/loginView.html',
        controller: 'LoginViewCtrl'

      })
      // Login state. The app should always redirect to this state whenever the
      // session returned is null.
      .state('login', {
        url: '/login',
        templateUrl: 'app/components/loginPane/loginPane.html',
        parent: 'loginView',
        controller: 'LoginPaneCtrl',
        params: {
          error: null
        }
      })
      // Signup state.
      .state('signup', {
        url: '^/signup',
        templateUrl: 'app/components/signupPane/signupPane.html',
        controller: 'SignupPaneCtrl',
        parent: 'loginView',
        params: {
          error: null
        }
      })

     // Whenever the user wishes to reset their password.
     .state('forgotPassword', {
       url: '^/forgot',
       templateUrl: 'app/components/forgotPasswordPane/forgotPasswordPane.html',
       controller: 'ForgotPasswordPaneCtrl',
       parent: 'loginView',
       params: {
         error: null
       }
     })

     .state('sentResetPassword', {
       url: '^/forgot/sent',
       templateUrl: 'app/components/sentResetPasswordPane/sentResetPasswordPane.html',
       controller: 'SentResetPasswordPaneCtrl',
       parent: 'loginView',
       params: {
        email: null
       }
     })
     .state('resetPassword', {
       url: '^/reset/{token}',
       templateUrl: 'app/components/resetPasswordPane/resetPasswordPane.html',
       controller: 'ResetPasswordPaneCtrl',
       parent: 'loginView',
       params: {
        error: null,
        token: null
       }
     })
     .state('resetPasswordSuccess', {
       url: '^/resetSuccess',
       templateUrl: 'app/components/resetPasswordSuccessPane/resetPasswordSuccessPane.html',
       controller: 'ResetPasswordSuccessPaneCtrl',
       parent: 'loginView',
       params: {
        error: null
       }
     })

     // Signup success state.
     .state('signupSuccess', {
       url: '/success',
       templateUrl: 'app/signupSuccessView/signupSuccessView.html',
       controller: 'SignupSuccessViewCtrl',
       params: {
        email: null
       }
     })
     //
    ;

    $urlRouterProvider
      .otherwise('/')
    ;

    $locationProvider
      .html5Mode(false)
    ;
  })

;
