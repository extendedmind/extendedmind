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

 function NotesService(ArrayService, BackendClientService, ExtendedItemService, ListsService,
                       TagsService, UISessionService, UserSessionService, UUIDService) {

  // An object containing notes for every owner
  var notes = {};
  var noteRegex = /\/note/;
  var noteSlashRegex = /\/note\//;

  function initializeArrays(ownerUUID) {
    if (!notes[ownerUUID]) {
      notes[ownerUUID] = {
        activeNotes: [],
        deletedNotes: [],
        archivedNotes: []
      };
    }
  }

  function getOtherArrays(ownerUUID) {
    return [{array: notes[ownerUUID].archivedNotes, id: 'archived'}];
  }

  function updateNote(note, ownerUUID) {
    ExtendedItemService.addTransientProperties([note], ownerUUID, 'note', copyFavoritedToStarred);
    return ArrayService.updateItem(note,
      notes[ownerUUID].activeNotes,
      notes[ownerUUID].deletedNotes,
      getOtherArrays(ownerUUID));
  }

  function setNote(note, ownerUUID) {
    initializeArrays(ownerUUID);
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
            var archivedNote = notes[ownerUUID].archivedNotes.findFirstObjectByKeyValue('uuid', children[i].uuid);
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
      // Remove deleted tags from notes
      TagsService.removeDeletedTagFromItems(notes[ownerUUID].activeNotes, deletedTag);
      TagsService.removeDeletedTagFromItems(notes[ownerUUID].deletedNotes, deletedTag);
      TagsService.removeDeletedTagFromItems(notes[ownerUUID].archivedNotes, deletedTag);
    }
  };
  TagsService.registerTagDeletedCallback(tagDeletedCallback, 'NotesService');

  // Setup callback for list deletion
  var listDeletedCallback = function(deletedList, ownerUUID) {
    if (notes[ownerUUID] && deletedList) {
      // Remove deleted list from notes
      ListsService.removeDeletedListFromItems(notes[ownerUUID].activeNotes, deletedList);
      ListsService.removeDeletedListFromItems(notes[ownerUUID].deletedNotes, deletedList);
      ListsService.removeDeletedListFromItems(notes[ownerUUID].archivedNotes, deletedList);
    }
  };
  ListsService.registerListDeletedCallback(listDeletedCallback, 'NotesService');

  // favorited is persistend, starred is transient
  function copyFavoritedToStarred(note) {
    if (note.favorited) {
      if (!note.transientProperties) note.transientProperties = {};
      note.transientProperties.starred = note.favorited;
    }
  }
  // starred is transient, favorited is persistent
  function copyStarredToFavorited(note) {
    if (note.transientProperties && note.transientProperties.starred) note.favorited = note.transientProperties.starred;

    // favorited has been removed from note, delete persistent value
    else if (note.favorited) delete note.favorited;
    //
    // TODO: After note.transientProperties.starred is implemented in UI,
    // check transient property when no value is set with AngularJS ng-model data-binding
    //
  }

  return {
    setNotes: function(notesResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      ExtendedItemService.addTransientProperties(notesResponse, ownerUUID, 'note', copyFavoritedToStarred);
      return ArrayService.setArrays(
        notesResponse,
        notes[ownerUUID].activeNotes,
        notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
    },
    updateNotes: function(notesResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      ExtendedItemService.addTransientProperties(notesResponse, ownerUUID, 'note', copyFavoritedToStarred);

      // issue a very short lived lock to prevent leave animation
      // when arrays are reformulated
      UISessionService.lock('leaveAnimation', 100);

      return ArrayService.updateArrays(
        notesResponse,
        notes[ownerUUID].activeNotes,
        notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
    },
    updateNoteProperties: function(uuid, properties, ownerUUID) {
      var updatedNote = ArrayService.updateItemProperties(
        uuid,
        properties,
        notes[ownerUUID].activeNotes,
        notes[ownerUUID].deletedNotes,
        getOtherArrays(ownerUUID));
      if (updatedNote) ExtendedItemService.addTransientProperties([updatedNote], ownerUUID, 'note', copyFavoritedToStarred);
      return updatedNote;
    },
    getNoteArrays: function(ownerUUID) {
      initializeArrays(ownerUUID);
      return notes[ownerUUID];
    },
    isNoteDeleted: function(note, ownerUUID) {
      initializeArrays(ownerUUID);
      return notes[ownerUUID].deletedNotes.indexOf(note) > 1;
    },
    getNotes: function(ownerUUID) {
      initializeArrays(ownerUUID);
      return notes[ownerUUID].activeNotes;
    },
    getArchivedNotes: function(ownerUUID) {
      initializeArrays(ownerUUID);
      return notes[ownerUUID].archivedNotes;
    },
    getNoteByUUID: function(uuid, ownerUUID) {
      initializeArrays(ownerUUID);
      return notes[ownerUUID].activeNotes.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveNote: function(note, ownerUUID) {
      initializeArrays(ownerUUID);
      if (this.getNoteStatus(note, ownerUUID) === 'deleted') return;
      var params;
      var transientProperties = ExtendedItemService.detachTransientProperties(note, ownerUUID, copyStarredToFavorited);
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
        } else {
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/note/' + note.uuid,
           this.putExistingNoteRegex, note)
          .then(function(result) {
            if (result.data) {
              note.modified = result.data.modified;
              ExtendedItemService.attachTransientProperties(note, transientProperties, 'note');
              updateNote(note, ownerUUID);
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
            }
          });
        }
      }
    },
    getNoteStatus: function(note, ownerUUID) {
      initializeArrays(ownerUUID);
      var arrayInfo = ArrayService.getActiveArrayInfo(note,
        notes[ownerUUID].activeNotes,
        notes[ownerUUID].deletedNotes,
        getOtherArrays(ownerUUID));

      if (arrayInfo) return arrayInfo.type;
    },
    addNote: function(note, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that note is not deleted before trying to add
      if (this.getNoteStatus(note, ownerUUID) === 'deleted') return;
      setNote(note, ownerUUID);
    },
    removeNote: function(note, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check that note is not deleted before trying to remove
      if (this.getNoteStatus(note, ownerUUID) === 'deleted') return;

      ArrayService.removeFromArrays(note,
        notes[ownerUUID].activeNotes,
        notes[ownerUUID].deletedNotes,
        getOtherArrays(ownerUUID));
    },
    deleteNote: function(note, ownerUUID) {
      initializeArrays(ownerUUID);
      // Check if note has already been deleted
      if (this.getNoteStatus(note, ownerUUID) === 'deleted') return;
      if (UserSessionService.isOfflineEnabled()) {
        // Offline
        var params = {type: 'note', owner: ownerUUID, uuid: note.uuid,
        reverse: {
          method: 'post',
          url: '/api/' + ownerUUID + '/note/' + note.uuid + '/undelete'
        }};
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
      initializeArrays(ownerUUID);
      // Check that note is deleted before trying to undelete
      if (this.getNoteStatus(note, ownerUUID) !== 'deleted') return;
      if (UserSessionService.isOfflineEnabled()) {
        // Offline
        var params = {type: 'note', owner: ownerUUID, uuid: note.uuid};
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
    resetNote: function(note, ownerUUID) {
      var notesArray = [note];
      if (note.transientProperties) {
        if (note.transientProperties.list) delete note.transientProperties.list;
        if (note.transientProperties.keywords) delete note.transientProperties.keywords;
        if (note.transientProperties.starred) delete note.transientProperties.starred;
      }
      ExtendedItemService.addTransientProperties(notesArray, ownerUUID, 'note', copyFavoritedToStarred);
    },
    addTransientProperties: function(note, ownerUUID, addExtraTransientPropertyFn) {
      //
      // TODO: Replace ExtendedItemService.addTransientProperties with this
      //
      var addExtraTransientPropertyFunctions;
      if (typeof addExtraTransientPropertyFn === 'function')
        addExtraTransientPropertyFunctions = [addExtraTransientPropertyFn, copyFavoritedToStarred];
      else addExtraTransientPropertyFunctions = copyFavoritedToStarred;
      ExtendedItemService.addTransientProperties([note], ownerUUID, 'note', addExtraTransientPropertyFunctions);
    },
    detachTransientProperties: function(note, ownerUUID) {
      return ExtendedItemService.detachTransientProperties(note, ownerUUID, copyStarredToFavorited);
    },

    // Regular expressions for note requests
    putNewNoteRegex: new RegExp(
      BackendClientService.apiPrefixRegex.source +
      BackendClientService.uuidRegex.source +
      noteRegex.source),

    putExistingNoteRegex: new RegExp(
      BackendClientService.apiPrefixRegex.source +
      BackendClientService.uuidRegex.source +
      noteSlashRegex.source +
      BackendClientService.uuidRegex.source),

    deleteNoteRegex: new RegExp(
      BackendClientService.apiPrefixRegex.source +
      BackendClientService.uuidRegex.source +
      noteSlashRegex.source +
      BackendClientService.uuidRegex.source),

    undeleteNoteRegex: new RegExp(
      BackendClientService.apiPrefixRegex.source +
      BackendClientService.uuidRegex.source +
      noteSlashRegex.source +
      BackendClientService.uuidRegex.source  +
      BackendClientService.undeleteRegex.source)
  };
}

NotesService['$inject'] = ['ArrayService', 'BackendClientService', 'ExtendedItemService',
'ListsService', 'TagsService', 'UISessionService', 'UserSessionService', 'UUIDService'];
angular.module('em.notes').factory('NotesService', NotesService);
