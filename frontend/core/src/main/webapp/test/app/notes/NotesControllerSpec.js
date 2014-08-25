/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

    module('em.notes', function($provide){
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
