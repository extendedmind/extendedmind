/*global angular */
'use strict';

angular.module('em.filters').filter('tasksFilter', ['DateService',
  function(DateService) {

    var filter = function(tasks, filterValue) {
      var tasksFilter = {};

      tasksFilter.byListUUID = function(tasks, uuid) {
        var filteredValues, i;
        filteredValues = [];
        i = 0;

        while (tasks[i]) {
          if (tasks[i].relationships) {
            if (tasks[i].relationships.parent) {
              if (tasks[i].relationships.parent === uuid) {
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
          if (tasks[i].due) {
            if (tasks[i].due === listDate) {
              filteredValues.push(tasks[i]);
            } else if (listDate === DateService.today().yyyymmdd && DateService.today().yyyymmdd > tasks[i].due) { // if task date < today
              filteredValues.push(tasks[i]);
            }
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
            if (tasks[i].relationships.parent) {
              sortedTask = true;
            }
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
