/*global angular*/
/*jslint eqeq: true plusplus: true*/

( function() {'use strict';

    function itemsRequest(httpRequest, itemsArray, notesArray, tagsArray, tasksArray, userSessionStorage) {
      return {
        getItems : function() {
          return httpRequest.get('/api/' + userSessionStorage.getActiveUUID() + '/items').then(function(itemsResponse) {

            itemsArray.setItems(itemsResponse.data.items);
            notesArray.setNotes(itemsResponse.data.notes);
            tagsArray.setTags(itemsResponse.data.tags);
            tasksArray.setTasks(itemsResponse.data.tasks);

          });
        },
        putItem : function(item) {
          return httpRequest.put('/api/' + userSessionStorage.getActiveUUID() + '/item', item).then(function(putItemsResponse) {
            return putItemsResponse.data;
          });
        },
        editItem : function(item) {
          httpRequest.put('/api/' + userSessionStorage.getActiveUUID() + '/item/' + item.uuid, item).then(function(editItemResponse) {
            return editItemResponse.data;
          });
        },
        deleteItem : function(item) {
          return httpRequest['delete']('/api/' + userSessionStorage.getActiveUUID() + '/item/' + item.uuid).then(function(deleteItemResponse) {
            return deleteItemResponse.data;
          });
        }
      };
    }


    itemsRequest.$inject = ['httpRequest', 'itemsArray', 'notesArray', 'tagsArray', 'tasksArray', 'userSessionStorage'];
    angular.module('em.services').factory('itemsRequest', itemsRequest);

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
        getItemByUUID : function(items, uuid) {
          var i = 0;

          while (items[i]) {
            if (items[i].uuid === uuid) {
              return items[i];
            }
            i++;
          }
        },
        getItemsByProjectUUID : function(items, uuid) {
          var i, subtasks;
          i = 0;
          this.subtasks = [];

          while (items[i]) {
            if (items[i].relationships) {
              if (items[i].relationships.parentTask === uuid) {
                this.subtasks.push(items[i]);
              }
            }
            i++;
          }
          return this.subtasks;
        },
        getItemsByTagUUID : function(items, uuid) {
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
