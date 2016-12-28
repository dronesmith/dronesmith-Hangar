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
  .filter('limit', function() {
    var DEFAULT_AMT = 20;

    return function(input, amt) {
      if (!amt) {
        amt = DEFAULT_AMT;
      }

      var str = input.substring(0, amt);

      if (input.length > amt) {
        str += '…';
      }

      return str;
    }
  })
;
