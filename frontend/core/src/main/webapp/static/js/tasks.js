"use strict";
var emTasks = angular.module('em.tasks', []);

emTasks.factory('Tasks', [
function() {
  return {
    getUserTasks : function() {
      return 'true';
    }
  };
}]);