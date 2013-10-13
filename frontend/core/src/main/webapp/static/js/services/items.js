/*global angular*/
/*jslint plusplus: true*/

( function() {'use strict';

    angular.module('em.services').factory('itemsRequest', ['httpRequest', 'itemsArray', 'userSessionStorage',
    function(httpRequest, itemsArray, userSessionStorage) {
      return {
        getItems : function() {
          return httpRequest.get('/api/' + userSessionStorage.getUserUUID() + '/items').then(function(itemsResponse) {
            return itemsResponse.data;
          });
        },
        putItem : function(item) {
          return httpRequest.put('/api/' + userSessionStorage.getUserUUID() + '/item', item).then(function(putItemsResponse) {
            return putItemsResponse.data;
          });
        },
        editItem : function(item, success, error) {
          httpRequest.put('/api/' + userSessionStorage.getUserUUID() + '/item/' + item.uuid, item, function(editItemResponse) {
            success(editItemResponse);
          }, function(editItemResponse) {
            error(editItemResponse);
          });
        },
        deleteItem : function(item, success, error) {
          httpRequest['delete']('/api/' + userSessionStorage.getUserUUID() + '/item/' + item.uuid, function(deleteItemResponse) {
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

    angular.module('em.services').factory('activeItem', ['$rootScope',
    function($rootScope) {
      var item;

      return {
        setItem : function(item) {
          this.item = item;
        },
        getItem : function() {
          return this.item;
        }
      };
    }]);

    angular.module('em.services').factory('itemsArray', [
    function() {
      var items = [];

      return {
        setItems : function(items) {
          this.items = items;
        },
        getItems : function() {
          return this.items;
        },
        putNewItem : function(item) {
          if (!this.itemInArray(this.items, item.uuid)) {
            this.items.push(item);
          }
        },
        removeItem : function(item) {
          this.removeItemFromArray(this.items, item);
        },
        removeItemFromArray : function(items, item) {
          items.splice(items.indexOf(item), 1);
        },
        deleteItemProperty : function(item, property) {
          delete item[property];
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
        getItemsByUuid : function(items, uuid) {
          var i, subtasks;
          i = 0;
          this.subtasks = [];

          while (items[i]) {
            if (items[i].relationships.parentTask === uuid) {
              this.subtasks.push(items[i]);
            }
            i++;
          }
          return this.subtasks;
        },
        getTagItems : function(items, uuid) {
          var i, j, subtasks;
          i = 0;
          this.subtasks = [];

          while (items[i]) {
            if (items[i].relationships) {
              if (items[i].relationships.tags) {
                j = 0;
                while (items[i].relationships.tags[j]) {
                  if (items[i].relationships.tags[j] === uuid) {
                    this.subtasks.push(items[i]);
                  }
                  j++;
                }
              }
            }
            i++;
          }
          return this.subtasks;
        },
        itemInArray : function(items, uuid) {
          var i = 0;

          while (items[i]) {
            if (items[i].uuid === uuid) {
              return true;
            }
            i++;
          }
          return false;
        }
      };
    }]);
  }());
