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
      my: {
        my: 0,
        tasks: 1,
        today: 2,
        inbox: 1,
        notes: 1
      }
    };
    return slide;
  }]);

angular.module('em.services').factory('carouselSlide', ['$location', 'location', 'Enum', 'userPrefix',
  function($location, location, Enum, userPrefix) {

    var carouselPath, carouselSlideIndex, carouselSlides;

    function setSlidePath() {

      if ($location.path() !== '/' + userPrefix.getPrefix() + carouselPath) {
        location.skipReload().path('/' + userPrefix.getPrefix() + carouselPath);
      }
    }

    return {
      setSlideIndex: function(slide) {
        carouselSlideIndex = slide;
        // carouselPath = carouselSlides[carouselSlideIndex].path;
        // setSlidePath();
      },
      getSlideIndex: function() {
        return carouselSlideIndex;
      },
      setSlidePath: function() {

      },
      setTasksSlides: function() {
        carouselSlides = [
        {
          path: '',
          index: 0
        },
        {
          path: '/tasks',
          index: 1
        },
        {
          path: '/tasks/today',
          indes: 2
        }];
      },
      setInboxSlides: function() {
        carouselSlides = [
        {
          path: '',
          index: 0
        },
        {
          path: '/inbox',
          index: 1
        }];
      }
    };
  }]);
