'use strict';

function TasksSlidesService() {

  return {
    // Enumeration values

    DATES: 'tasks/home',
    OVERVIEW: 'tasks/overview',
    DETAILS: 'tasks/details',

    // Functions
    getDateSlidePath: function(activeDay){
      return this.DATES + '/' + activeDay.weekday;
    }
  };
}
angular.module('em.services').factory('TasksSlidesService', TasksSlidesService);
