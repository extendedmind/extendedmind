'use strict';

emServices.factory('userItems', ['Item', 'Items',
function(Item, Items) {
  return {
    getItems : function() {
      Item.getItems(function(items) {
        Items.setUserItems(items);
      }, function(error) {
      });
    }
  };
}]);

emServices.factory('Item', ['$http', 'Items', 'UserSessionStorage',
function($http, Items, UserSessionStorage) {
  return {
    getItems : function(success, error) {
      $http({
        method : 'GET',
        url : '/api/' + UserSessionStorage.getUserUUID() + '/items',
        cache : true
      }).success(function(userItems) {
        success(userItems);
      }).error(function(userItems) {
        error(userItems);
      });
    },
    putItem : function(item, success, error) {
      $http({
        method : 'PUT',
        url : '/api/' + UserSessionStorage.getUserUUID() + '/item',
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

emServices.factory('Items', [
function() {
  var userItems;
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
      userItems = items;
    },
    getUserItems : function() {
      return userItems;
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
