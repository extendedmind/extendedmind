/*jslint eqeq: true, white: true */
'use strict';

angular.module('em.services').factory('location', ['$location', '$rootScope', '$route',
  function($location, $rootScope, $route) {

    $location.skipReload = function() {
      var lastRoute, un;

      lastRoute = $route.current;

      un = $rootScope.$on('$locationChangeSuccess', function() {
        $route.current = lastRoute;
        un();
      });

      return $location;
    };

    return $location;
  }]);

angular.module('em.services').factory('userPrefix', ['userSessionStorage',
  function(userSessionStorage) {
    var prefix = 'my';

    return {
      setCollectivePrefix: function() {
        this.setPrefix('collective' + '/' + userSessionStorage.getActiveUUID());
      },
      setMyPrefix: function() {
        this.setPrefix('my');
      },
      setPrefix: function(name) {
        prefix = name;
      },
      getPrefix: function() {
        return prefix;
      }
    };
  }]);

angular.module('em.services').factory('Enum', [
  function() {
    var slide = {
      MY: 1,
      TASKS: 2,
      TODAY: 3,
      INBOX: 0,
      NOTES: 2
    };

    return slide;
  }]);

angular.module('em.services').factory('swiperSlides', [
  function() {
    var initialSlideIndex;

    return {
      getInitiaSlideIndex: function() {
        return initialSlideIndex;
      },
      setInitialSlideIndex: function(slideIndex) {
        initialSlideIndex = slideIndex;
      }
    };
  }]);
