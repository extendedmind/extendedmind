'use strict';

function NotesSlidesService() {

  return {
    // Enumeration values

    RECENT: 'notes/home',
    OVERVIEW: 'notes/overview',
    DETAILS: 'notes/details'
  };
}
angular.module('em.services').factory('NotesSlidesService', NotesSlidesService);
