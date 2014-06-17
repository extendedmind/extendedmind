'use strict';

describe('NotesController', function() {
  var $scope, NotesController, MockNotesService;

  beforeEach(function() {
    module('em.appTest');

    MockNotesService = {
      notes: [],
      saveNote: function(note) {
        this.notes.push(note);
      },
      getNotes: function() {
        return this.notes;
      },
      deleteNote: function(note) {
        this.notes.splice(note, 1);
      }
    };

    module('em.services', function($provide){
      $provide.value('NotesService', MockNotesService);
    });

    inject(function($controller, $rootScope) {
      $scope = $rootScope.$new();
      $scope.registerAllNotesUpdatedCallback = function registerAllNotesUpdatedCallback() {
        return;
      };

      NotesController = $controller('NotesController', {
        $scope: $scope
      });
    });
  });

  it('should delete note', function() {
    var note = {
      title: 'note'
    };
    expect(MockNotesService.getNotes().length).toEqual(0);
    MockNotesService.saveNote(note);
    expect(MockNotesService.getNotes().length).toEqual(1);

    $scope.deleteNote(note);
    expect(MockNotesService.getNotes().length).toEqual(0);
  });

  it('should save note', function() {
    var note = {
      title: 'note'
    };
    expect(MockNotesService.getNotes().length).toEqual(0);
    MockNotesService.saveNote(note);
    expect(MockNotesService.getNotes().length).toEqual(1);
    note.title = 'saved note';
    // TODO: prevent window history back
    // $scope.saveNote(note);
  });
});
