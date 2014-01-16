/*global angular */
'use strict';

function itemsRequest(BackendClientService, itemsArray, itemsResponse, TagsService, tasksArray, UserSessionService) {
  return {
    getItems: function() {
      BackendClientService.get('/api/' + UserSessionService.getActiveUUID() + '/items').then(function(itemsResponses) {

        itemsArray.setItems(itemsResponses.data.items);
        TagsService.setTags(itemsResponses.data.tags);
        tasksArray.setTasks(itemsResponses.data.tasks);
        
      });
    },
    putItem: function(item) {
      BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/item', item).then(function(putItemsResponse) {
        itemsArray.putNewItem(item);
        itemsResponse.putItemContent(item, putItemsResponse.data);
      });
    },
    putExistingItem: function(item) {
      return BackendClientService.put('/api/' + UserSessionService.getActiveUUID() + '/item/' + item.uuid, item).then(function(putExistingItemResponse) {
        itemsResponse.putItemContent(item, putExistingItemResponse.data);
      });
    },
    deleteItem: function(item) {
      itemsArray.removeItem(item);

      BackendClientService['delete']('/api/' + UserSessionService.getActiveUUID() + '/item/' + item.uuid).then(function(deleteItemResponse) {
        itemsResponse.putItemContent(item, deleteItemResponse.data);
      }, function() {
        itemsArray.setItem(item);
      });
    }
  };
}
itemsRequest.$inject = ['BackendClientService', 'itemsArray', 'itemsResponse', 'TagsService', 'tasksArray', 'UserSessionService'];
angular.module('em.services').factory('itemsRequest', itemsRequest);

angular.module('em.services').factory('itemsResponse', [
  function() {
    return {
      putItemContent: function(item, putItemResponse) {
        angular.forEach(putItemResponse, function(value, key) {
          item[key] = value;
        });
      },
      deleteItemProperty: function(item, property) {
        delete item[property];
      }
    };
  }]);

angular.module('em.services').factory('activeItem', [
  function() {
    var activeItem;

    return {
      setItem: function(item) {
        activeItem = item;
      },
      getItem: function() {
        return activeItem;
      }
    };
  }]);

angular.module('em.services').factory('itemsArray', [
  function() {
    var items = [];

    return {
      setItems: function(itemsResponse) {

        this.clearArray(items);

        if (itemsResponse != null) {
          var i = 0;

          while (itemsResponse[i]) {
            this.setItem(itemsResponse[i]);
            i++;
          }
        }
      },
      setItem: function(item) {
        if (!this.itemInArray(items, item.uuid)) {
          items.push(item);
        }
      },
      getItems: function() {
        return items;
      },
      putNewItem: function(item) {
        if (!this.itemInArray(items, item.uuid)) {
          items.push(item);
        }
      },
      clearArray: function(itemsArray) {
        // http://stackoverflow.com/a/1234337
        itemsArray.length = 0;
        return itemsArray;
      },
      removeItem: function(item) {
        this.removeItemFromArray(items, item);
      },
      removeItemFromArray: function(items, item) {
        items.splice(items.indexOf(item), 1);
      },
      deleteItemProperty: function(item, property) {
        delete item[property];
      },
      getItemByUUID: function(items, uuid) {
        var i = 0;

        while (items[i]) {
          if (items[i].uuid === uuid) {
            return items[i];
          }
          i++;
        }
      },
      getItemsByProjectUUID: function(items, uuid) {
        var i;
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
      getItemsByTagUUID: function(items, uuid) {
        var i, j;
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
      itemInArray: function(items, uuid) {
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
