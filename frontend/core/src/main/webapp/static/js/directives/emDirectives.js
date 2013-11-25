/*global Swiper */
/*jslint white: true */
'use strict';

angular.module('em.directives').directive('swiperDirective', ['$rootScope', 'location', 'userPrefix', function($rootScope, location, userPrefix) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var mySwiper;
      $rootScope.slideIndex = 0;

      function changePath() {
        location.skipReload().path('/' + userPrefix.getPrefix() + mySwiper.getSlide(mySwiper.activeIndex).getData('path'));
        $rootScope.$apply();
      }

      // http://www.idangero.us/sliders/swiper/api.php
      mySwiper = new Swiper('.swiper-container', {
        // initialSlide: 0,
        noSwiping: true,
        simulateTouch: true,
        queueEndCallbacks: true,
        onSlideChangeEnd: function(sw) {
          $rootScope.slideIndex = sw.activeIndex;
          changePath();
        }
      });

      mySwiper.getSlide(0).setData('path', '');
      mySwiper.getSlide(1).setData('path', '/tasks');
      mySwiper.getSlide(2).setData('path', '/tasks/today');
    }
  };
}]);

angular.module('em.directives').directive('appVersion', ['version',
  function(version) {
    return function(scope, element, attrs) {
      return element.text(version);
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

angular.module('em.directives').directive('emFooter', [
  function() {
    return {
      controller : 'NavbarController',
      restrict : 'A',
      transclude : true,
      templateUrl : 'static/partials/templates/footer.html',
      link : function(scope, element, attrs) {
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

angular.module('em.directives').directive('emHeader', [
  function() {
    return {
      restrict : 'A',
      templateUrl : 'static/partials/templates/header.html'
    };
  }]);

angular.module('em.directives').directive('omniBar', [
  function() {
    return {
      controller : 'OmniBarController',
      restrict : 'A',
      templateUrl : 'static/partials/templates/omniBar.html'
    };
  }]);

angular.module('em.directives').directive('urlList', [
  function() {
    return {
      restrict : 'A',
      templateUrl : 'static/partials/templates/urlList.html'
    };
  }]);

angular.module('em.directives').directive('newTag', [
  function() {
    return {
      restrict : 'A',
      templateUrl : 'static/partials/templates/newTag.html',
      link : function(scope, element, attrs) {
        scope.showEditNewTag = false;

        scope.editNewTag = function editNewTag() {
          scope.showEditNewTag = !scope.showEditNewTag;
        };
      }
    };
  }]);

angular.module('em.directives').directive('contextsList', [
  function() {
    return {
      restrict : 'A',
      templateUrl : 'static/partials/templates/contextsList.html',
      transclude : true
    };
  }]);

angular.module('em.directives').directive('my', [
  function() {
    return {
      restrict : 'A',
      templateUrl : 'static/partials/my.html'
    };
  }]);

angular.module('em.directives').directive('inbox', [
  function() {
    return {
      restrict : 'A',
      templateUrl : 'static/partials/my/inbox.html'
    };
  }]);

angular.module('em.directives').directive('projectsList', [
  function() {
    return {
      restrict : 'A',
      templateUrl : 'static/partials/templates/projectsList.html',
      transclude : true
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
        attrs.$observe('equals', function (val) {
          validate();
        });
      }
    };
  }]);
