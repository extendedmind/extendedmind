'use strict';

angular.module('em.filters').filter('tasksFilter', [
  function() {

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
      tasksFilter.byContextUUID = function(tasks, uuid) {
        var filteredValues, i;
        filteredValues = [];
        i = 0;

        while (tasks[i]) {
          if (tasks[i].relationships && tasks[i].relationships.tags) {
            for (var j=0, len=tasks[i].relationships.tags.length; j<len; j++) {
              if (tasks[i].relationships.tags[j] === uuid){
                filteredValues.push(tasks[i]);
              }
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

angular.module('em.filters').filter('tasksByDate', ['DateService',
  function(DateService) {
    return function(tasks, date) {
      function isDueDate(task) {
        return task.due === date;
      }
      function isToday() {
        return DateService.getTodayYYYYMMDD() === date;
      }
      function isOverdue(task) {
        return DateService.getTodayYYYYMMDD() > task.due;
      }
      return tasks.filter(function(task) {
        if (task.due) {
          return isDueDate(task) || (isToday() && isOverdue(task));
        }
      });
    };
  }]);
