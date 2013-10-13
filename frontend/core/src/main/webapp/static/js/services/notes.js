/*global angular*/

( function() {'use strict';

    angular.module('em.services').factory('notesRequest', ['httpRequest', 'itemsResponse', 'userSessionStorage',
    function(httpRequest, itemsResponse, userSessionStorage) {
      return {
        putNote : function(note) {
          return httpRequest.put('/api/' + userSessionStorage.getUserUUID() + '/note', note).then(function(putNoteResponse) {
            return putNoteResponse;
          });
        },
        deleteNote : function(note) {
          return httpRequest['delete']('/api/' + userSessionStorage.getUserUUID() + '/note/' + note.uuid).then(function(deleteNoteResponse) {
            return deleteNoteResponse;
          });
        },
        putExistingNote : function(note) {
          return httpRequest.put('/api/' + userSessionStorage.getUserUUID() + '/note/' + note.uuid, note).then(function(putExistingNoteResponse) {
            return putExistingNoteResponse;
          });
        }
      };
    }]);

    angular.module('em.services').factory('notesResponse', ['itemsResponse',
    function(itemsResponse) {
      return {
        putNoteContent : function(note, putNoteResponse) {
          itemsResponse.putItemContent(note, putNoteResponse);
        }
      };
    }]);

    angular.module('em.services').factory('notesArray', ['itemsArray',
    function(itemsArray) {
      var notes = [];

      return {
        setNotes : function(notes) {
          this.notes = notes;
        },
        getNotes : function() {
          return this.notes;
        },
        removeNote : function(note) {
          itemsArray.removeItemFromArray(this.notes, note);
        },
        putNewNote : function(note) {
          if (!itemsArray.itemInArray(this.notes, note.uuid)) {
            this.notes.push(note);
          }
        }
      };
    }]);
  }());
