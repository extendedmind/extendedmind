/*global angular */
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
      INBOX: 0,
      MY: 1,
      DATES: 2,
      TASKS: 3,
      NOTES: 2
    };

    return slide;
  }]);
