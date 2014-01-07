/*global angular */
'use strict';

function TasksSlidesService(LocationService, OwnerService) {

  return {
    // Enumeration values

    INBOX: 'tasks/inbox',
    HOME: 'tasks/home',
    DATES: 'tasks/dates',
    LISTS: 'tasks/lists',
    PROJECTS: 'tasks/projects',
    SINGLE_TASKS: 'tasks/single',

    // Functions
    getProjectSlidePath: function(uuid){
      return this.PROJECTS + '/' + uuid;
    },

    getDateSlidePath: function(dateString){
      return this.DATES + '/' + dateString;
    }
  };
}
TasksSlidesService.$inject = ['LocationService', 'OwnerService'];
angular.module('em.services').factory('TasksSlidesService', TasksSlidesService);
