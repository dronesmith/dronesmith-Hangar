/*
 * angular-loading-bar
 *
 * intercepts XHR requests and creates a loading bar.
 * Based on the excellent nprogress work by rstacruz (more info in readme)
 *
 * (c) 2013 Wes Cruver
 * License: MIT
 */


(function() {

'use strict';


angular.module('progressSpinner', [])
  .provider('progressSpinner', function() {

    this.autoIncrement = true;
    this.includeSpinner = true;
    this.includeBar = false;
    this.latencyThreshold = 100;
    this.startSize = 0.02;
    this.parentSelector = 'body';
    this.spinnerTemplate =
    '<div id="loading-bar-spinner">' +
    '<div class="spinner-icon">' +

    '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"' +
    	 'width="50px" height="50px" viewBox="0 0 50 50" enable-background="new 0 0 50 50" xml:space="preserve">' +
      '<g>' +
      	'<polyline fill-rule="evenodd" clip-rule="evenodd" fill="#28406F" points="25.581,39.872 37.791,47.309 50,39.872 50,25 ' +
      	'	37.791,32.437 25.581,25 25.581,39.872 	"/>' +
      	'<polyline fill-rule="evenodd" clip-rule="evenodd" fill="#28406F" points="12.791,2.691 0,10.128 0,25 12.791,17.563 25.581,25 ' +
      	'	25.581,10.128 12.791,2.691 	"/>' +
      '</g>' +
    '</svg>' +

    '</div></div>';
    this.loadingBarTemplate = '<div id="loading-bar"><div class="bar"><div class="peg"></div></div></div>';

    this.$get = ['$injector', '$document', '$timeout', '$rootScope', function ($injector, $document, $timeout, $rootScope) {
      var $animate;
      var $parentSelector = this.parentSelector,
        loadingBarContainer = angular.element(this.loadingBarTemplate),
        loadingBar = loadingBarContainer.find('div').eq(0),
        spinner = angular.element(this.spinnerTemplate);

      var incTimeout,
        completeTimeout,
        started = false,
        status = 0;

      var autoIncrement = this.autoIncrement;
      var includeSpinner = this.includeSpinner;
      var includeBar = this.includeBar;
      var startSize = this.startSize;

      /**
       * Inserts the loading bar element into the dom, and sets it to 2%
       */
      function _start() {
        if (!$animate) {
          $animate = $injector.get('$animate');
        }

        $timeout.cancel(completeTimeout);

        // do not continually broadcast the started event:
        if (started) {
          return;
        }

        var document = $document[0];
        var parent = document.querySelector ?
          document.querySelector($parentSelector)
          : $document.find($parentSelector)[0]
        ;

        if (! parent) {
          parent = document.getElementsByTagName('body')[0];
        }

        var $parent = angular.element(parent);
        var $after = parent.lastChild && angular.element(parent.lastChild);

        $rootScope.$broadcast('cfpLoadingBar:started');
        started = true;

        var appendSpinnerTo = $after;
        if (includeBar) {
          $animate.enter(loadingBarContainer, $parent, $after);
          appendSpinnerTo = loadingBarContainer;
        }

        if (includeSpinner) {
          $animate.enter(spinner, $parent, appendSpinnerTo);
        }

        _set(startSize);
      }

      /**
       * Set the loading bar's width to a certain percent.
       *
       * @param n any value between 0 and 1
       */
      function _set(n) {
        if (!started) {
          return;
        }
        var pct = (n * 100) + '%';
        loadingBar.css('width', pct);
        status = n;

        // increment loadingbar to give the illusion that there is always
        // progress but make sure to cancel the previous timeouts so we don't
        // have multiple incs running at the same time.
        if (autoIncrement) {
          $timeout.cancel(incTimeout);
          incTimeout = $timeout(function() {
            _inc();
          }, 250);
        }
      }

      /**
       * Increments the loading bar by a random amount
       * but slows down as it progresses
       */
      function _inc() {
        if (_status() >= 1) {
          return;
        }

        var rnd = 0;

        // TODO: do this mathmatically instead of through conditions

        var stat = _status();
        if (stat >= 0 && stat < 0.25) {
          // Start out between 3 - 6% increments
          rnd = (Math.random() * (5 - 3 + 1) + 3) / 100;
        } else if (stat >= 0.25 && stat < 0.65) {
          // increment between 0 - 3%
          rnd = (Math.random() * 3) / 100;
        } else if (stat >= 0.65 && stat < 0.9) {
          // increment between 0 - 2%
          rnd = (Math.random() * 2) / 100;
        } else if (stat >= 0.9 && stat < 0.99) {
          // finally, increment it .5 %
          rnd = 0.005;
        } else {
          // after 99%, don't increment:
          rnd = 0;
        }

        var pct = _status() + rnd;
        _set(pct);
      }

      function _status() {
        return status;
      }

      function _completeAnimation() {
        status = 0;
        started = false;
      }

      function _complete() {
        if (!$animate) {
          $animate = $injector.get('$animate');
        }

        _set(1);
        $timeout.cancel(completeTimeout);

        // Attempt to aggregate any start/complete calls within 500ms:
        completeTimeout = $timeout(function() {
          var promise = $animate.leave(loadingBarContainer, _completeAnimation);
          if (promise && promise.then) {
            promise.then(_completeAnimation);
          }
          $animate.leave(spinner);
          $rootScope.$broadcast('cfpLoadingBar:completed');
        }, 500);
      }

      return {
        start            : _start,
        set              : _set,
        status           : _status,
        inc              : _inc,
        complete         : _complete,
        autoIncrement    : this.autoIncrement,
        includeSpinner   : this.includeSpinner,
        latencyThreshold : this.latencyThreshold,
        parentSelector   : this.parentSelector,
        startSize        : this.startSize
      };


    }];     //
  });       // wtf javascript. srsly
})();       //
