'use strict';

function loadingAnimationDirective() {

  // From: http://css-tricks.com/examples/Loadingdotdotdot/

  (function($) {

      $.Loadingdotdotdot = function(el, options) {

          var base = this;

          base.$el = $(el);

          base.$el.data("Loadingdotdotdot", base);

          base.dotItUp = function($element, maxDots) {
              if ($element.text().length == maxDots) {
                  $element.text("");
              } else {
                  $element.append(".");
              }
          };

          base.stopInterval = function() {
              clearInterval(base.theInterval);
          };

          base.init = function() {

              if ( typeof( speed ) === "undefined" || speed === null ) var speed = 300;
              if ( typeof( maxDots ) === "undefined" || maxDots === null ) var maxDots = 3;

              base.speed = speed;
              base.maxDots = maxDots;

              base.options = $.extend({},$.Loadingdotdotdot.defaultOptions, options);

              base.$el.html("<span>" + base.options.word + "<em></em></span>");

              base.$dots = base.$el.find("em");
              base.$loadingText = base.$el.find("span");

              base.$el.css("position", "relative");
              base.$loadingText.css({
                  "position": "absolute",
                  "left": (base.$el.width() / 2) - (base.$loadingText.width() / 2)
              });

              base.theInterval = setInterval(base.dotItUp, base.options.speed, base.$dots, base.options.maxDots);

          };

          base.init();

      };

      $.Loadingdotdotdot.defaultOptions = {
          speed: 400,
          maxDots: 3,
          word: "loading"
      };

      $.fn.Loadingdotdotdot = function(options) {

          if (typeof(options) == "string") {
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
      element.Loadingdotdotdot();
    }
  };
}
angular.module('common').directive('loadingAnimation', loadingAnimationDirective);
