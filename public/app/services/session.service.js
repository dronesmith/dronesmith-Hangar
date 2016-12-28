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
  .factory('Session', function(
    $resource) {

    return $resource('/index/session', {

    }, {
      sync: {
        method: 'PUT'
      },
      authenticate: {
        method: 'POST'
      }
    })
  })
;
