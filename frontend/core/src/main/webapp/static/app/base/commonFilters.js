/*global angular */
'use strict';

angular.module('em.filters').filter('tagTitle', ['itemsArray', 'tagsArray',
  function(itemsArray, tagsArray) {
    var userItemsFilter = function(itemTags) {
      var filteredValues, i, tag, tags;
      filteredValues = [];

      if (itemTags) {
        i = 0;
        tags = tagsArray.getTags();

        while (itemTags[i]) {
          tag = itemsArray.getItemByUUID(tags, itemTags[i]);
          filteredValues.push(tag);
          i++;
        }
      }

      return filteredValues;
    };
    return userItemsFilter;
  }]);

angular.module('em.filters').filter('visibleTaskContent', [
  function() {
    var userItemsFilter = function(task) {
      var filteredValues;
      filteredValues = [];

      if (task.due) {
        filteredValues.push(task.due);
      }
      if (task.link) {
        filteredValues.push(task.link);
      }

      return filteredValues;
    };
    return userItemsFilter;
  }]);

angular.module('em.filters').filter('tasksFilter', ['date',
  function(date) {

    var filter = function(tasks, filterValue) {
      var tasksFilter = {};

      tasksFilter.byProjectUUID = function(tasks, uuid) {
        var filteredValues, i;
        filteredValues = [];
        i = 0;

        while (tasks[i]) {
          if (tasks[i].relationships) {
            if (tasks[i].relationships.parentTask) {
              if (tasks[i].relationships.parentTask === uuid) {
                filteredValues.push(tasks[i]);
              }
            }
          }
          i++;
        }
        return filteredValues;
      };

      tasksFilter.tasksByDate = function(tasks, listDate) {
        var filteredValues, i;
        filteredValues = [];
        i = 0;
        while (tasks[i]) {
          if (!tasks[i].project) {
            if (tasks[i].due) {
              if (tasks[i].due === listDate) {
                filteredValues.push(tasks[i]);
              } else if (listDate === date.today().yyyymmdd && date.today().yyyymmdd > tasks[i].due) { // if task date < today
                filteredValues.push(tasks[i]);
              }
            }
          }
          i++;
        }
        return filteredValues;
      };

      tasksFilter.projects = function(tasks) {

        var filteredValues, i;
        filteredValues = [];
        i = 0;

        while (tasks[i]) {
          if (tasks[i].project) {
            filteredValues.push(tasks[i]);
          }
          i++;
        }
        return filteredValues;
      };

      tasksFilter.unsorted = function(tasks) {

        var filteredValues, i, sortedTask;
        filteredValues = [];
        i = 0;

        while (tasks[i]) {
          sortedTask = false;

          if (tasks[i].relationships) {
            if (tasks[i].relationships.parentTask) {
              sortedTask = true;
            }
          }
          if (tasks[i].project) {
            sortedTask = true;
          }
          if (!sortedTask) {
            filteredValues.push(tasks[i]);
          }
          i++;
        }
        return filteredValues;
      };

      if (filterValue) {
        return tasksFilter[filterValue.name](tasks, filterValue.filterBy);
      }
      return tasks;
    };

    return filter;
  }]);
