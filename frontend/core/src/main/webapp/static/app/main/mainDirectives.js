/*global angular */
'use strict';

angular.module('em.directives').directive('appVersion', ['version',
  function(version) {
    return function(scope, element) {
      return element.text(version);
    };
  }]);

angular.module('em.directives').directive('errorAlertBar', ['$parse',
  function($parse) {
    return {
      restrict: 'A',
      templateUrl: 'static/app/base/errorMessage.html',
      link: function(scope, elem, attrs) {
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

angular.module('em.directives').directive('emFooter', [
  function() {
    return {
      controller: 'NavbarController',
      restrict: 'A',
      templateUrl: 'static/app/main/footer.html',
      link: function(scope, element, attrs) {
        var mainlinksFilterAttr = attrs.mainlinksfilter;
        scope.collapse = false;

        scope.$watch(mainlinksFilterAttr, function(newValue) {
          scope.mainlinksFilter = newValue;
        });

        scope.collapseNavbar = function collapseNavbar() {
          scope.collapse = !scope.collapse;
        };
      }
    };
  }]);

angular.module('em.directives').directive('featureHeader', [
  function() {
    return {
      controller: 'NavbarController',
      restrict: 'A',
      scope: {
        feature: '@featureHeader'
      },
      templateUrl: 'static/app/base/featureHeader.html'
    };
  }]);

angular.module('em.directives').directive('mainHeader', [
  function() {
    return {
      controller: 'NavbarController',
      restrict: 'A',
      templateUrl: 'static/app/main/mainHeader.html'
    };
  }]);

angular.module('em.directives').directive('omniBar', [ '$rootScope',
  function($rootScope) {
    return {
      controller: 'OmniBarController',
      restrict: 'A',
      templateUrl: 'static/app/main/omniBar.html',
      link: function(scope) {
        $rootScope.omniBarActive = false;
        scope.omniBarFocus = function(focus) {
          if (focus) {
            $rootScope.omniBarActive = true;
          } else {
            if (scope.newItem == null || scope.newItem.title == null || scope.newItem.title.length === 0) {
              $rootScope.omniBarActive = false;
            }
          }
        };
      }
    };
  }]);

angular.module('em.directives').directive('urlList', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/app/main/urlList.html'
    };
  }]);

angular.module('em.directives').directive('contextsList', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/app/main/contextsList.html',
      transclude: true
    };
  }]);

angular.module('em.directives').directive('home', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/app/main/home.html'
    };
  }]);

angular.module('em.directives').directive('inbox', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/app/main/inbox.html'
    };
  }]);

angular.module('em.directives').directive('projectsList', [
  function() {
    return {
      restrict: 'A',
      templateUrl: 'static/app/base/projectsList.html',
      transclude: true
    };
  }]);

angular.module('em.directives').directive('emPassword', [
  function() {
    // http://stackoverflow.com/a/18014975
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, elem, attrs, ngModel) {
        if(!ngModel) {
          return;
        }

        var validate = function() {
          var val1 = ngModel.$viewValue;
          var val2 = attrs.equals;

          ngModel.$setValidity('equals', val1 === val2 && val1.length >= 8);
        };

        // watch own value and re-validate on change
        scope.$watch(attrs.ngModel, function() {
          validate();
        });

        // observe the other value and re-validate on change
        attrs.$observe('equals', function() {
          validate();
        });
      }
    };
  }]);

angular.module('em.directives').directive('scrollTo',
  function ($location, $anchorScroll) {
    return function(scope, element, attrs) {
      element.bind('click', function(event) {
        event.stopPropagation();
        scope.$on('$locationChangeStart', function(ev) {
          ev.preventDefault();
        });
        var location = attrs.scrollTo;
        $location.hash(location);
        $anchorScroll();
      });
    };
  });
