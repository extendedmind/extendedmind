/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /* global jQuery */
 /* jshint funcscope: true */
 'use strict';

 function loadingAnimationDirective() {
  // From: http://css-tricks.com/examples/Loadingdotdotdot/
  (function($) {

    $.Loadingdotdotdot = function(element, options) {

      var base = this;
      base.$element = $(element);
      base.$element.data('Loadingdotdotdot', base);

      base.dotItUp = function($element, maxDots) {
        if ($element.text().length == maxDots) {
          $element.text('');
        } else {
          $element.append('.');
        }
      };

      base.stopInterval = function() {
        clearInterval(base.theInterval);
      };

      base.init = function() {

        if ( typeof( speed ) === 'undefined' || speed === null ) var speed = 300;
        if ( typeof( maxDots ) === 'undefined' || maxDots === null ) var maxDots = 3;

        base.speed = speed;
        base.maxDots = maxDots;

        base.options = $.extend({},$.Loadingdotdotdot.defaultOptions, options);

        base.$element.html('<span>' + base.options.word + '<em></em></span>');

        base.$dots = base.$element.find('em');
        base.$loadingText = base.$element.find('span');

        base.$element.css('position', 'relative');
        base.$loadingText.css({
          'position': 'absolute',
          'left': (base.$element.width() / 2) - (base.$loadingText.width() / 2)
        });

        if (!base.options.paused)
          base.theInterval = setInterval(base.dotItUp, base.options.speed, base.$dots, base.options.maxDots);

      };

      base.init();

    };

    $.Loadingdotdotdot.defaultOptions = {
      speed: 400,
      maxDots: 3,
      word: 'loading'
    };

    $.fn.Loadingdotdotdot = function(options) {

      if (typeof(options) == 'string') {
        var safeGuard = $(this).data('Loadingdotdotdot');
        if (safeGuard) {
          safeGuard.stopInterval();
        }
      } else {
        return this.each(function(){
          (new $.Loadingdotdotdot(this, options));
        });
      }

    };

  })(jQuery);

  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.addClass('loading-animation');
      var options;
      if (attrs.loadingAnimation === 'paused') {
        options = {};
        options.paused = true;
      }
      element.Loadingdotdotdot(options);
    }
  };
}
angular.module('common').directive('loadingAnimation', loadingAnimationDirective);
