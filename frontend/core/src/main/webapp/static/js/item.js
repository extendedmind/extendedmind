"use strict";

var emItem = angular.module('em.item', []);

emItem.factory('Item', ['$http',
function($http) {
  var items;
  return {
    getUserItems : function(user, success, error) {
      $http.get('/api/' + user + '/items').success(function(itemsResponse) {
        items = itemsResponse;
        success(items);
      }).error(error);
    },
    putItem : function(newItemTitle, success, error) {
      $http.post('/api/item', newItemTitle).success(function(putItemResponse) {
        var newItem = {};
        newItem.title = newItemTitle;
        newItem.uuid = putItemResponse;
        items.push(newItem);
        success();
      }).error(error);
    }
  };
}]);
