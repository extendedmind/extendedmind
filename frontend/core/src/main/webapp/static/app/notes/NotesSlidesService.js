'use strict';

function NotesSlidesService() {

  return {
    // Enumeration values

    INBOX: 'notes/inbox',
    HOME: 'notes/home',
    RECENT: 'notes/recent',
    MENU: 'notes/menu',
    LISTS: 'notes/lists',

    // Functions
    getListSlidePath: function(uuid){
      return this.LISTS + '/' + uuid;
    }
  };
}
angular.module('em.services').factory('NotesSlidesService', NotesSlidesService);
