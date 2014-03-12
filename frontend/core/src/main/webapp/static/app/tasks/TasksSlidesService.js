'use strict';

function TasksSlidesService() {

  return {
    // Enumeration values

    INBOX: 'tasks/inbox',
    HOME: 'tasks/home',
    DATES: 'tasks/dates',
    MENU: 'tasks/menu',
    LISTS: 'tasks/lists',

    // Functions
    getListSlidePath: function(uuid){
      return this.LISTS + '/' + uuid;
    },

    getDateSlidePath: function(activeDay){
      return this.DATES + '/' + activeDay.weekday;
    }
  };
}
angular.module('em.services').factory('TasksSlidesService', TasksSlidesService);
