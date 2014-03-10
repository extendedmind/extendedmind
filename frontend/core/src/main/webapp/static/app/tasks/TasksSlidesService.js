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

    getDateSlidePath: function(dateString){
      return this.DATES + '/' + dateString;
    }
  };
}
angular.module('em.services').factory('TasksSlidesService', TasksSlidesService);
