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

emServices.factory('itemFactory', ['httpRequestHandler', 'itemsFactory', 'userSessionStorage',
function(httpRequestHandler, itemsFactory, userSessionStorage) {
  return {
    getItems : function(success, error) {
      httpRequestHandler.get('/api/' + userSessionStorage.getUserUUID() + '/items', function(userItems) {
        success(userItems);
      }, function(userItems) {
        error(userItems);
      });
    },
    putItem : function(item, success, error) {
      httpRequestHandler.put('/api/' + userSessionStorage.getUserUUID() + '/item', item, function(putItemResponse) {
        itemsFactory.putUserItem(item, putItemResponse);
        success(putItemResponse);
      }, function(putItemResponse) {
        error(putItemResponse);
      });
    },
    editItem : function(item, success, error) {
      httpRequestHandler.put('/api/' + userSessionStorage.getUserUUID() + '/item' + item.uuid, item, function(editItemResponse) {
        success(editItemResponse);
      }, function(editItemResponse) {
        error(editItemResponse);
      });
    },
    deleteItem : function(itemUUID, success, error) {
      httpRequestHandler.put('/api/' + userSessionStorage.getUserUUID() + '/item' + item.uuid, function(deleteItemResponse) {
        success(deleteItemResponse);
      }, function(deleteItemResponse) {
        error(deleteItemResponse);
      });
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
