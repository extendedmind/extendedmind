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

 /*global angular */
 'use strict';

 function NotesService($q, ArrayService, BackendClientService, ExtendedItemService, ListsService,
                       TagsService, UISessionService, UserSessionService, UUIDService) {

  // An object containing notes for every owner
  var notes = {};
  var noteRegex = /\/note/;
  var noteSlashRegex = /\/note\//;
  var favoriteRegex = /\/favorite/;
  var unfavoriteRegex = /\/unfavorite/;

  function initializeArrays(ownerUUID) {
    if (!notes[ownerUUID]) {
      notes[ownerUUID] = {
        activeNotes: [],
        deletedNotes: [],
        archivedNotes: []
      };
    }
  }
  UserSessionService.registerNofifyOwnerCallback(initializeArrays, 'NotesService');

  function getOtherArrays(ownerUUID) {
    return [{array: notes[ownerUUID].archivedNotes, id: 'archived'}];
  }

  function addTransientProperties(notes, ownerUUID, addExtraTransientPropertyFn) {
    var addExtraTransientPropertyFunctions;
    if (typeof addExtraTransientPropertyFn === 'function')
      addExtraTransientPropertyFunctions = [addExtraTransientPropertyFn, copyFavorited];
    else addExtraTransientPropertyFunctions = copyFavorited;
    ExtendedItemService.addTransientProperties(notes, ownerUUID, 'note', addExtraTransientPropertyFunctions);
  }

  function updateNote(note, ownerUUID) {
    addTransientProperties([note], ownerUUID);
    return ArrayService.updateItem(note,
                                   notes[ownerUUID].activeNotes,
                                   notes[ownerUUID].deletedNotes,
                                   getOtherArrays(ownerUUID));
  }

  function setNote(note, ownerUUID) {
    ArrayService.setItem(note,
                         notes[ownerUUID].activeNotes,
                         notes[ownerUUID].deletedNotes,
                         getOtherArrays(ownerUUID));
  }

  // Setup callback to ListsService
  var itemArchiveCallback = function(children, archived, ownerUUID) {
    if (notes[ownerUUID] && children) {
      for (var i=0, len=children.length; i<len; i++) {
        var activeNote = notes[ownerUUID].activeNotes.findFirstObjectByKeyValue('uuid', children[i].uuid);
        if (activeNote) {
          activeNote.archived = archived;
          activeNote.modified = children[i].modified;
          updateNote(activeNote, ownerUUID);
        } else {
          var deletedNote = notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', children[i].uuid);
          if (deletedNote) {
            deletedNote.archived = archived;
            deletedNote.modified = children[i].modified;
            updateNote(deletedNote, ownerUUID);
          } else {
            var archivedNote = notes[ownerUUID].archivedNotes.findFirstObjectByKeyValue('uuid',
                                                                                        children[i].uuid);
            if (archivedNote) {
              archivedNote.archived = archived;
              archivedNote.modified = children[i].modified;
              updateNote(archivedNote, ownerUUID);
            }
          }
        }
      }
    }
  };
  ListsService.registerItemArchiveCallback(itemArchiveCallback, 'NotesService');

  // Setup callback for tag deletion
  var tagDeletedCallback = function(deletedTag, ownerUUID) {
    if (notes[ownerUUID] && deletedTag) {
      if (!undelete){
        // Remove deleted tags from notes
        var modifiedItems = TagsService.removeDeletedTagFromItems(notes[ownerUUID].activeNotes,
                                                                  deletedTag);
        modifiedItems.concat(TagsService.removeDeletedTagFromItems(notes[ownerUUID].deletedNotes,
                                                                   deletedTag));
        modifiedItems.concat(TagsService.removeDeletedTagFromItems(notes[ownerUUID].archivedNotes,
                                                                   deletedTag));
        for (var i=0,len=modifiedItems.length;i<len;i++){
          updateNote(modifiedItems[i], ownerUUID);
        }
      }else{
        // Undelete
        // TODO: Deleted keywords should not be removed completely but instead put to a note.history
        // object so that here it would be possible to undo a keyword deletion easily!
      }
    }
  };
  TagsService.registerTagDeletedCallback(tagDeletedCallback, 'NotesService');

  // Setup callback for list deletion
  var listDeletedCallback = function(deletedList, ownerUUID, undelete) {
    if (notes[ownerUUID] && deletedList) {
      if (!undelete){
        // Remove deleted list from notes
        var modifiedItems = ListsService.removeDeletedListFromItems(notes[ownerUUID].activeNotes,
                                                                    deletedList);
        modifiedItems.concat(ListsService.removeDeletedListFromItems(notes[ownerUUID].deletedNotes,
                                                                     deletedList));
        modifiedItems.concat(ListsService.removeDeletedListFromItems(notes[ownerUUID].archivedNotes,
                                                                     deletedList));
        for (var i=0,len=modifiedItems.length;i<len;i++){
          updateNote(modifiedItems[i], ownerUUID);
        }
      }else{
        // TODO: Undelete
      }
    }
  };
  ListsService.registerListDeletedCallback(listDeletedCallback, 'NotesService');

  function copyFavorited(note) {
    if (note.favorited) {
      if (!note.trans) note.trans = {};
      note.trans.favorited = note.favorited !== undefined;
    }
  }

  return {
    setNotes: function(notesResponse, ownerUUID) {
      addTransientProperties(notesResponse, ownerUUID);
      return ArrayService.setArrays(notesResponse,
                                    notes[ownerUUID].activeNotes,
                                    notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
    },
    updateNotes: function(notesResponse, ownerUUID) {
      addTransientProperties(notesResponse, ownerUUID);

      return ArrayService.updateArrays(notesResponse,
                                       notes[ownerUUID].activeNotes,
                                       notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
    },
    updateNoteProperties: function(uuid, properties, ownerUUID) {
      var updatedNote = ArrayService.updateItemProperties(uuid,
                                                          properties,
                                                          notes[ownerUUID].activeNotes,
                                                          notes[ownerUUID].deletedNotes,
                                                          getOtherArrays(ownerUUID));
      if (updatedNote) addTransientProperties([updatedNote], ownerUUID);
      return updatedNote;
    },
    getNoteArrays: function(ownerUUID) {
      return notes[ownerUUID];
    },
    isNoteDeleted: function(note, ownerUUID) {
      return notes[ownerUUID].deletedNotes.indexOf(note) > 1;
    },
    getNotes: function(ownerUUID) {
      return notes[ownerUUID].activeNotes;
    },
    getArchivedNotes: function(ownerUUID) {
      return notes[ownerUUID].archivedNotes;
    },
    getDeletedNotes: function(ownerUUID) {
      return notes[ownerUUID].deletedNotes;
    },
    getNoteInfo: function(uuid, ownerUUID) {
      var note = notes[ownerUUID].activeNotes.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (note){
        return {
          type: 'active',
          note: note
        };
      }
      note = notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (note){
        return {
          type: 'deleted',
          note: note
        };
      }
      note = notes[ownerUUID].archivedNotes.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (note){
        return {
          type: 'archived',
          note: note
        };
      }
    },
    saveNote: function(note, ownerUUID) {
      var deferred = $q.defer();
      if (this.getNoteStatus(note, ownerUUID) === 'deleted') return;
      var params;
      var transientProperties = ExtendedItemService.detachTransientProperties(note, ownerUUID);
      if (note.uuid) {
        // Existing note
        if (UserSessionService.isOfflineEnabled()) {
          // Push to offline buffer
          params = {type: 'note', owner: ownerUUID, uuid: note.uuid};
          BackendClientService.put('/api/' + ownerUUID + '/note/' + note.uuid,
                                   this.putExistingNoteRegex, params, note);
          note.created = note.modified = BackendClientService.generateFakeTimestamp();
          ExtendedItemService.attachTransientProperties(note, transientProperties, 'note');
          updateNote(note, ownerUUID);
          deferred.resolve(note);
        } else {
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/note/' + note.uuid,
                                         this.putExistingNoteRegex, note)
          .then(function(result) {
            if (result.data) {
              note.modified = result.data.modified;
              ExtendedItemService.attachTransientProperties(note, transientProperties, 'note');
              updateNote(note, ownerUUID);
              deferred.resolve(note);
            }
          });
        }
      } else {
        // New note
        if (UserSessionService.isOfflineEnabled()) {
          // Push to offline queue with fake UUID
          var fakeUUID = UUIDService.generateFakeUUID();
          params = {type: 'note', owner: ownerUUID, fakeUUID: fakeUUID};
          BackendClientService.put('/api/' + ownerUUID + '/note',
                                   this.putNewNoteRegex, params, note);
          note.uuid = fakeUUID;
          note.created = note.modified = BackendClientService.generateFakeTimestamp();
          ExtendedItemService.attachTransientProperties(note, transientProperties, 'note');
          setNote(note, ownerUUID);
          deferred.resolve(note);
        } else {
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/note',
                                         this.putNewNoteRegex, note)
          .then(function(result) {
            if (result.data) {
              note.uuid = result.data.uuid;
              note.modified = result.data.modified;
              note.created = result.data.created;
              ExtendedItemService.attachTransientProperties(note, transientProperties, 'note');
              setNote(note, ownerUUID);
              deferred.resolve(note);
            }
          });
        }
      }
      return deferred.promise;
    },
    getNoteStatus: function(note, ownerUUID) {
      var arrayInfo = ArrayService.getActiveArrayInfo(note,
                                                      notes[ownerUUID].activeNotes,
                                                      notes[ownerUUID].deletedNotes,
                                                      getOtherArrays(ownerUUID));

      if (arrayInfo) return arrayInfo.type;
    },
    addNote: function(note, ownerUUID) {
      // Check that note is not deleted before trying to add
      if (this.getNoteStatus(note, ownerUUID) === 'deleted') return;
      setNote(note, ownerUUID);
    },
    removeNote: function(note, ownerUUID) {
      ArrayService.removeFromArrays(note,
                                    notes[ownerUUID].activeNotes,
                                    notes[ownerUUID].deletedNotes,
                                    getOtherArrays(ownerUUID));
    },
    deleteNote: function(note, ownerUUID) {
      // Check if note has already been deleted
      if (this.getNoteStatus(note, ownerUUID) === 'deleted') return;
      if (UserSessionService.isOfflineEnabled()) {
        // Offline
        var params = {type: 'note', owner: ownerUUID, uuid: note.uuid,
        reverse: {
          method: 'post',
          url: '/api/' + ownerUUID + '/note/' + note.uuid + '/undelete'
        }, replaceable: true};
        BackendClientService.deleteOffline('/api/' + ownerUUID + '/note/' + note.uuid,
                                           this.deleteNoteRegex, params);
        note.deleted = note.modified = BackendClientService.generateFakeTimestamp();
        updateNote(note, ownerUUID);
      } else {
        BackendClientService.deleteOnline('/api/' + ownerUUID + '/note/' + note.uuid,
                                          this.deleteNoteRegex)
        .then(function(result) {
          if (result.data) {
            note.deleted = result.data.deleted;
            note.modified = result.data.result.modified;
            updateNote(note, ownerUUID);
          }
        });
      }
    },
    undeleteNote: function(note, ownerUUID) {
      // Check that note is deleted before trying to undelete
      if (this.getNoteStatus(note, ownerUUID) !== 'deleted') return;
      if (UserSessionService.isOfflineEnabled()) {
        // Offline
        var params = {type: 'note', owner: ownerUUID, uuid: note.uuid,
        reverse: {
          method: 'post',
          url: '/api/' + ownerUUID + '/note/' + note.uuid + '/delete'
        }, replaceable: true};
        BackendClientService.post('/api/' + ownerUUID + '/note/' + note.uuid + '/undelete',
                                  this.deleteNoteRegex, params);
        delete note.deleted;
        updateNote(note, ownerUUID);
      } else {
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/note/' + note.uuid + '/undelete',
                                        this.deleteNoteRegex)
        .then(function(result) {
          if (result.data) {
            delete note.deleted;
            note.modified = result.data.modified;
            updateNote(note, ownerUUID);
          }
        });
      }
    },
    favoriteNote: function(note, ownerUUID) {
      var deferred = $q.defer();
      // Check that note is not deleted before trying to complete
      if (this.getNoteStatus(note, ownerUUID) === 'deleted') return;

      if (UserSessionService.isOfflineEnabled()) {
        // Offline
        var params = {type: 'note', owner: ownerUUID, uuid: note.uuid,
        reverse: {
          method: 'post',
          url: '/api/' + ownerUUID + '/note/' + note.uuid + '/unfavorite'
        },replaceable: true};
        BackendClientService.post('/api/' + ownerUUID + '/note/' + note.uuid + '/favorite',
                                  this.favoriteNoteRegex, params);
        note.favorited = note.modified = BackendClientService.generateFakeTimestamp();
        updateNote(note, ownerUUID);
        deferred.resolve(note);
      } else {
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/note/' + note.uuid + '/favorite',
                                        this.favoriteNoteRegex)
        .then(function(result) {
          if (result.data) {
            note.favorited = result.data.favorited;
            note.modified = result.data.modified;
          }
          updateNote(note, ownerUUID);
          deferred.resolve(note);
        });
      }
      return deferred.promise;
    },
    unfavoriteNote: function(note, ownerUUID) {
      var deferred = $q.defer();
      // Check that note is not deleted before trying to unfavorite
      if (this.getNoteStatus(note, ownerUUID) === 'deleted' || !note.favorited) return;

      if (UserSessionService.isOfflineEnabled()) {
        var params = {type: 'note', owner: ownerUUID, uuid: note.uuid,
        reverse: {
          method: 'post',
          url: '/api/' + ownerUUID + '/note/' + note.uuid + '/favorite'
        }, replaceable: true};
        // Offline
        BackendClientService.post('/api/' + ownerUUID + '/note/' + note.uuid + '/unfavorite',
                                  this.unfavoriteNoteRegex, params);
        delete note.favorited;
        note.trans.favorited = false;
        note.modified = BackendClientService.generateFakeTimestamp();
        updateNote(note, ownerUUID);
        deferred.resolve(note);
      } else {
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/note/' + note.uuid + '/unfavorite',
                                        this.unfavoriteNoteRegex)
        .then(function(result) {
          if (result.data) {
            delete note.favorited;
            note.trans.favorited = false;
            note.modified = result.data.modified;
            updateNote(note, ownerUUID);
          }
          deferred.resolve(note);
        });
      }
      return deferred.promise;
    },
    addTransientProperties: function(notes, ownerUUID, addExtraTransientPropertyFn) {
      return addTransientProperties(notes, ownerUUID, addExtraTransientPropertyFn);
    },
    detachTransientProperties: function(note, ownerUUID) {
      return ExtendedItemService.detachTransientProperties(note, ownerUUID);
    },

    // Regular expressions for note requests
    putNewNoteRegex: new RegExp(BackendClientService.apiPrefixRegex.source +
                                BackendClientService.uuidRegex.source +
                                noteRegex.source),

    putExistingNoteRegex: new RegExp(BackendClientService.apiPrefixRegex.source +
                                     BackendClientService.uuidRegex.source +
                                     noteSlashRegex.source +
                                     BackendClientService.uuidRegex.source),

    deleteNoteRegex: new RegExp(BackendClientService.apiPrefixRegex.source +
                                BackendClientService.uuidRegex.source +
                                noteSlashRegex.source +
                                BackendClientService.uuidRegex.source),

    undeleteNoteRegex: new RegExp(BackendClientService.apiPrefixRegex.source +
                                  BackendClientService.uuidRegex.source +
                                  noteSlashRegex.source +
                                  BackendClientService.uuidRegex.source  +
                                  BackendClientService.undeleteRegex.source),

    favoriteNoteRegex: new RegExp(BackendClientService.apiPrefixRegex.source +
                                  BackendClientService.uuidRegex.source +
                                  noteSlashRegex.source +
                                  BackendClientService.uuidRegex.source +
                                  favoriteRegex.source),

    unfavoriteNoteRegex: new RegExp(BackendClientService.apiPrefixRegex.source +
                                    BackendClientService.uuidRegex.source +
                                    noteSlashRegex.source +
                                    BackendClientService.uuidRegex.source +
                                    unfavoriteRegex.source),
  };
}

NotesService['$inject'] = ['$q', 'ArrayService', 'BackendClientService', 'ExtendedItemService',
  'ListsService', 'TagsService', 'UISessionService', 'UserSessionService', 'UUIDService'];
angular.module('em.notes').factory('NotesService', NotesService);
