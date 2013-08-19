'use strict';

emServices.factory('userItemsFactory', ['itemFactory', 'itemsFactory',
function(itemFactory, itemsFactory) {
  return {
    getItems : function() {
      itemFactory.getItems(function(items) {
        itemsFactory.setUserItems(items);
      }, function(error) {
      });
    }
  };
}]);

emServices.factory('itemFactory', ['$http', 'itemsFactory', 'userSessionStorage',
function($http, itemsFactory, userSessionStorage) {
  return {
    getItems : function(success, error) {
      $http({
        method : 'GET',
        url : '/api/' + userSessionStorage.getUserUUID() + '/items',
        cache : true
      }).success(function(userItemsFactory) {
        success(userItemsFactory);
      }).error(function(userItemsFactory) {
        error(userItemsFactory);
      });
    },
    putItem : function(item, success, error) {
      $http({
        method : 'PUT',
        url : '/api/' + userSessionStorage.getUserUUID() + '/item',
        data : item
      }).success(function(putItemResponse) {
        itemsFactory.putUserItem(item, putItemResponse);
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

emServices.factory('itemsFactory', [
function() {
  var userItemsFactory;
  var userNewItems = [];
  var itemInArray = function(title) {
    for (var i = 0; i < userNewItems.length; i++) {
      if (userNewItems[i].title === title) {
        return true;
      }
    }
  };
  return {
    setUserItems : function(items) {
      userItemsFactory = items;
    },
    getUserItems : function() {
      return userItemsFactory;
    },
    getUserNewItems : function() {
      return userNewItems;
    },
    putUserItem : function(item, itemUUID) {
      if (item === undefined || item.title === '') {
        return;
      }
      if (!itemInArray(item.title)) {
        var newItem = [];
        newItem.title = item.title;
        newItem.uuid = itemUUID;
        userNewItems.push(newItem);
      }
    }
  };
}]);
