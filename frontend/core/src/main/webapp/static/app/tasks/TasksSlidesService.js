/*global angular */
'use strict';

function TasksSlidesService() {
  var slide = {
    INBOX: 0,
    HOME: 1,
    DATES: 2,
    LISTS: 3,
    PROJECTS: 4,
    SINGLE_TASKS: 5
  };

  return slide;
}
angular.module('em.services').factory('TasksSlidesService', TasksSlidesService);
