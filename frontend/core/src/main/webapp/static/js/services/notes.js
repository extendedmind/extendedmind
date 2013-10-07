/*global angular*/

( function() {'use strict';

    angular.module('em.services').factory('notesRequest', ['httpRequest', 'itemsResponse', 'userSessionStorage',
    function(httpRequest, itemsResponse, userSessionStorage) {
      return {
        putNote : function(note, success, error) {
          httpRequest.put('/api/' + userSessionStorage.getUserUUID() + '/note', note, function(putNoteResponse) {
            success(putNoteResponse);
          }, function(putNoteResponse) {
            error(putNoteResponse);
          });
        },
        putExistingNote : function(note, success, error) {
          httpRequest.put('/api/' + userSessionStorage.getUserUUID() + '/note/' + note.uuid, note, function(putExistingNoteResponse) {
            success(putExistingNoteResponse);
          }, function(putExistingNoteResponse) {
            error(putExistingNoteResponse);
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
      var notes;

      return {
        setNotes : function(notes) {
          this.notes = notes;
        },
        getNotes : function() {
          return this.notes;
        },
        putNewNote : function(note) {
          if (!itemsArray.itemInArray(this.notes, note.uuid)) {
            this.notes.push(note);
          }
        }
      };
    }]);
  }());
