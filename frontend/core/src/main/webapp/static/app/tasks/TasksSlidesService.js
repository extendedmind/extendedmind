/*global angular */
'use strict';

function TasksSlidesService(LocationService, OwnerService) {

  return {
    // Enumeration values

    INBOX: 'tasks/inbox',
    HOME: 'tasks/home',
    DATES: 'tasks/dates',
    MENU: 'tasks/menu',
    LISTS: 'tasks/lists',
    CONTEXTS: 'tasks/contexts',
    SINGLE_TASKS: 'tasks/single',

    // Functions
    getListSlidePath: function(uuid){
      return this.LISTS + '/' + uuid;
    },

    getDateSlidePath: function(dateString){
      return this.DATES + '/' + dateString;
    }
  };
}
TasksSlidesService.$inject = ['LocationService', 'OwnerService'];
angular.module('em.services').factory('TasksSlidesService', TasksSlidesService);
