/*global angular*/

( function() {'use strict';

    angular.module('em.services').factory('itemsRequest', ['httpRequestHandler', 'itemsArray', 'userSessionStorage',
    function(httpRequestHandler, itemsArray, userSessionStorage) {
      return {
        getItems : function(success, error) {
          httpRequestHandler.get('/api/' + userSessionStorage.getUserUUID() + '/items', function(itemsResponse) {
            success(itemsResponse);
          }, function(itemsResponse) {
            error(itemsResponse);
          });
        },
        putItem : function(item, success, error) {
          httpRequestHandler.put('/api/' + userSessionStorage.getUserUUID() + '/item', item, function(putItemResponse) {
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

    angular.module('em.services').factory('itemsResponse', [
    function() {
      return {
        putItemContent : function(item, putItemResponse) {
          angular.forEach(putItemResponse, function(value, key) {
            item[key] = value;
          });
        }
      };
    }]);

    angular.module('em.services').factory('itemsArray', [
    function() {
      var items, notes;

      return {
        setItems : function(items) {
          this.items = items;
        },
        getItems : function() {
          return this.items;
        },
        putNewItem : function(item) {
          if (!this.itemInArray(this.items, item.title)) {
            this.items.push(item);
          }
        },
        itemInArray : function(items, title) {
          var found = false;

          angular.forEach(items, function(item) {
            if (item.title === title) {
              found = true;
              return;
            }
          });

          return found;
        }
      };
    }]);
  }());
