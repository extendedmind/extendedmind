/*global angular*/

( function() {'use strict';

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
          if (!itemsArray.itemInArray(this.notes, note.title)) {
            this.notes.push(note);
          }
        }
      };
    }]);
  }());
