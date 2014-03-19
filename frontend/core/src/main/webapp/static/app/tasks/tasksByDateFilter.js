'use strict';

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
