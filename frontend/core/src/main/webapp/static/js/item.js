"use strict";

var emItem = angular.module('em.item', []);

emItem.factory('Item', ['$http', 'Items',
function($http, Items) {
  return {
    getItems : function(userUUID, success, error) {
      $http({
        method : 'GET',
        url : '/api/' + userUUID + '/items'
      }).success(function(userItems) {
        Items.setUserItems(userItems);
        success();
      }).error(function(error) {
        error(error);
      });
    },
    putItem : function(userUUID, item, success, error) {
      $http({
        method : 'PUT',
        url : '/api/' + userUUID + '/item',
        data : item
      }).success(function(putItemResponse) {
        Items.putUserItem(item, putItemResponse);
        success();
      }).error(error);
    },
    editItem : function(userUUID, item, success, error) {
      $http({
        method : 'PUT',
        url : '/api/' + userUUID + '/item/' + item.uuid,
        data : item
      }).success(function(putItemResponse) {
      }).error(error);
    },
    deleteItem : function(userUUID, itemUUID, success, error) {
      $http({
        method : 'DELETE',
        url : '/api/' + userUUID + '/item/' + itemUUID
      }).success(function() {
      }).error();
    }
  };
}]);

emItem.factory('Items', [
function() {
  var userItems;
  return {
    setUserItems : function(items) {
      userItems = items;
    },
    getUserItems : function() {
      return userItems;
    },
    putUserItem : function(item, itemUUID) {
      var newItem = {};
      newItem.title = item.title;
      newItem.uuid = itemUUID;
      userItems.push(newItem);
    }
  };
}]);
