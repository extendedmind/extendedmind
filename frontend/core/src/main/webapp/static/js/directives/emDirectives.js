/*global $, angular*/

( function() {'use strict';

    angular.module('em.directives').directive('appVersion', ['version',
    function(version) {
      return function(scope, element, attrs) {
        return element.text(version);
      };
    }]);

    angular.module('em.directives').directive('eatClick', [
    function() {
      return function(scope, element, attrs) {
        $(element).click(function(event) {
          event.preventDefault();
        });
      };
    }]);

    angular.module('em.directives').directive('errorAlertBar', ['$parse',
    function($parse) {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/errorMessage.html',
        link : function(scope, elem, attrs) {
          var alertMessageAttr = attrs.alertmessage;
          scope.errorMessage = null;

          scope.$watch(alertMessageAttr, function(newValue) {
            scope.errorMessage = newValue;
          });

          scope.hideAlert = function() {
            scope.errorMessage = null;
            $parse(alertMessageAttr).assign(scope, null);
          };
        }
      };
    }]);

    angular.module('em.directives').directive('urlList', [
    function() {
      return {
        restrict : 'A',
        templateUrl : 'static/partials/templates/urlList.html'
      };
    }]);
  }());
