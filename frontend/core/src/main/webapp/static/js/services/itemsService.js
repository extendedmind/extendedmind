/*global angular*/

( function() {'use strict';

    angular.module('em.services').factory('userItemsFactory', ['itemFactory', 'itemsFactory','tasksArray',
    function(itemFactory, itemsFactory,tasksArray) {
      return {
        getItems : function(success, error) {
          itemFactory.getItems(function(items) {
            itemsFactory.setUserItems(items.items);
            itemsFactory.setUserNotes(items.notes);
            itemsFactory.setUserTasks(items.tasks);
            tasksArray.setTasks(items.tasks);
            success();
          }, function(items) {
            error(items);
          });
        }
      };
    }]);

    angular.module('em.services').factory('itemFactory', ['httpRequestHandler', 'itemsFactory', 'userSessionStorage',
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
          httpRequestHandler.put('/api/' + userSessionStorage.getUserUUID() + '/item' + itemUUID, function(deleteItemResponse) {
            success(deleteItemResponse);
          }, function(deleteItemResponse) {
            error(deleteItemResponse);
          });
        }
      };
    }]);

    angular.module('em.services').factory('itemsFactory', [
    function() {
      var itemInArray, userItems, userNewItems, userNotes, userTasks;
      userNewItems = [];

      itemInArray = function(title) {
        angular.forEach(userNewItems, function(userNewItem) {
          if (userNewItem.title === title) {
            return true;
          }
        });
      };
      return {
        setUserItems : function(items) {
          userItems = items;
        },
        setUserNotes : function(notes) {
          userNotes = notes;
        },
        setUserTasks : function(tasks) {
          userTasks = tasks;
        },
        getUserItems : function() {
          return userItems;
        },
        getUserNotes : function() {
          return userNotes;
        },
        getUserTasks : function() {
          return userTasks;
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
  }());
