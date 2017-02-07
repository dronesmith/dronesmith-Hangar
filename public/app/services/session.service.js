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
  .factory('Session', function($resource) {

      return {

        account: $resource('/index/session', {

        }, {
          sync: {
            method: 'PUT'
          },
          authenticate: {
            method: 'POST'
          },

        }),
        temp: $resource('/index/session/temp', {
        },{
          send: {
            method: 'POST'
          }
        }),
        signup: $resource('/index/session/newuser', {
        },{
          send: {
            method: 'POST'
          }
        }),
        forgotPassword: $resource('/index/session/forgot', {
        },{
          send: {
            method: 'POST'
          }
        }),
        validateToken: $resource('/index/session/reset/validate', {
        },{
          send: {
            method: 'POST'
          }
        }),
        resetPassword: $resource('/index/session/reset', {
        },{
          send: {
            method: 'POST'
          }
        }),
        sendsms: $resource('/index/session/sms/send'),
        verifysms: $resource('/index/session/sms/verify')

    };
  });
