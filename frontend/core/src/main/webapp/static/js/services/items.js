/*global angular*/
/*jslint eqeq: true plusplus: true*/

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
        editItem : function(item) {
          httpRequest.put('/api/' + userSessionStorage.getUserUUID() + '/item/' + item.uuid, item).then(function(editItemResponse) {
            return editItemResponse.data;
          });
        },
        deleteItem : function(item) {
          return httpRequest['delete']('/api/' + userSessionStorage.getUserUUID() + '/item/' + item.uuid).then(function(deleteItemResponse) {
            return deleteItemResponse.data;
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
      var activeItem;

      return {
        setItem : function(item) {
          activeItem = item;
        },
        getItem : function() {
          return activeItem;
        }
      };
    }]);

    angular.module('em.services').factory('itemsArray', [
    function() {
      var items = [];

      return {
        setItems : function(itemsResponse) {
          if (itemsResponse != null) {
            items = itemsResponse;
          } else {
            items = [];
          }
        },
        getItems : function() {
          return items;
        },
        putNewItem : function(item) {
          if (items == null) {
            items = [];
          }
          if (!this.itemInArray(items, item.uuid)) {
            items.push(item);
          }
        },
        removeItem : function(item) {
          this.removeItemFromArray(items, item);
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
