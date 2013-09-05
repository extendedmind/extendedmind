/*global angular*/
/*jslint plusplus: true*/

( function() {'use strict';

    angular.module('em.services').factory('itemsRequest', ['httpRequest', 'itemsArray', 'userSessionStorage',
    function(httpRequest, itemsArray, userSessionStorage) {
      return {
        getItems : function(success, error) {
          httpRequest.get('/api/' + userSessionStorage.getUserUUID() + '/items', function(itemsResponse) {
            success(itemsResponse);
          }, function(itemsResponse) {
            error(itemsResponse);
          });
        },
        putItem : function(item, success, error) {
          httpRequest.put('/api/' + userSessionStorage.getUserUUID() + '/item', item, function(putItemResponse) {
            success(putItemResponse);
          }, function(putItemResponse) {
            error(putItemResponse);
          });
        },
        editItem : function(item, success, error) {
          httpRequest.put('/api/' + userSessionStorage.getUserUUID() + '/item' + item.uuid, item, function(editItemResponse) {
            success(editItemResponse);
          }, function(editItemResponse) {
            error(editItemResponse);
          });
        },
        deleteItem : function(itemUUID, success, error) {
          httpRequest.put('/api/' + userSessionStorage.getUserUUID() + '/item' + itemUUID, function(deleteItemResponse) {
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
      var items;

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
        getItemByUuid : function(items, uuid) {
          var i = 0;
          while (items[i]) {
            if (items[i].uuid === uuid) {
              return items[i];
            }
            i++;
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
