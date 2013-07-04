"use strict";

var emTasks = angular.module('em.tasks', ['ngResource']);

emTasks.factory('Tasks', ['$resource',
function($resource) {
  return $resource('/api/items');
}]);
