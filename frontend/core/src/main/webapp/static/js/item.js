"use strict";

var emItem = angular.module('em.item', []);

emItem.factory('Item', function($http) {
  return {
    AddNewItem : function(item, success, error) {
      $http.post('/api/item', item).success(function(item) {
        success(item);
      }).error(error);
    }
  };
});
