/*global angular */
'use strict';

function NotesService(UUIDService, UserSessionService, BackendClientService, ArrayService, ListsService, TagsService){

  // An object containing notes for every owner
  var notes = {};
  var noteRegex = /\/note/;
  var noteSlashRegex = /\/note\//;

  function initializeArrays(ownerUUID){
    if (!notes[ownerUUID]){
      notes[ownerUUID] = {
        activeNotes: [],
        deletedNotes: [],
        archivedNotes: []
      };
    }
  }

  function getOtherArrays(ownerUUID){
    return [{array: notes[ownerUUID].archivedNotes, id: 'archived'}];
  }

  function updateNote(note, ownerUUID) {
    return ArrayService.updateItem(note,
              notes[ownerUUID].activeNotes,
              notes[ownerUUID].deletedNotes,
              getOtherArrays(ownerUUID));
  }

  function setNote(note, ownerUUID){
    initializeArrays(ownerUUID);
    ArrayService.setItem(note,
      notes[ownerUUID].activeNotes,
      notes[ownerUUID].deletedNotes,
      getOtherArrays(ownerUUID));
  }

  // Setup callback to ListsService
  var itemArchiveCallback = function(children, archived, ownerUUID){
    if (notes[ownerUUID] && children){
      for (var i=0, len=children.length; i<len; i++) {
        var activeNote = notes[ownerUUID].activeNotes.findFirstObjectByKeyValue('uuid', children[i].uuid);
        if (activeNote){
          activeNote.archived = archived;
          activeNote.modified = children[i].modified;
          updateNote(activeNote, ownerUUID);
        }else{
          var deletedNote = notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', children[i].uuid);
          if (deletedNote){
            deletedNote.archived = archived;
            deletedNote.modified = children[i].modified;
            updateNote(deletedNote, ownerUUID);
          }else{
            var archivedNote = notes[ownerUUID].archivedNotes.findFirstObjectByKeyValue('uuid', children[i].uuid);
            if (archivedNote){
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
  var tagDeletedCallback = function(deletedTag, ownerUUID){
    if (notes[ownerUUID] && deletedTag){
      // Remove deleted tags from notes
      TagsService.removeDeletedTagFromItems(notes[ownerUUID].activeNotes, deletedTag);
      TagsService.removeDeletedTagFromItems(notes[ownerUUID].deletedNotes, deletedTag);
      TagsService.removeDeletedTagFromItems(notes[ownerUUID].archivedNotes, deletedTag);
    }
  };
  TagsService.registerTagDeletedCallback(tagDeletedCallback, 'NotesService');

  // Setup callback for list deletion
  var listDeletedCallback = function(deletedList, ownerUUID){
    if (notes[ownerUUID] && deletedList){
      // Remove deleted list from notes
      ListsService.removeDeletedListFromItems(notes[ownerUUID].activeNotes, deletedList);
      ListsService.removeDeletedListFromItems(notes[ownerUUID].deletedNotes, deletedList);
      ListsService.removeDeletedListFromItems(notes[ownerUUID].archivedNotes, deletedList);
    }
  };
  ListsService.registerListDeletedCallback(listDeletedCallback, 'NotesService');

  function addListToNotes(notesResponse){
    if (notesResponse){
      for (var i=0, len=notesResponse.length; i<len; i++) {
        if (notesResponse[i].relationships && notesResponse[i].relationships.parent){
          notesResponse[i].relationships.list = notesResponse[i].relationships.parent;
        }
      }
    }
  }

  function moveListToParent(note){
    if (note.relationships){
      var list = note.relationships.list;
      if (list){
        note.relationships.parent = list;
      }else if (note.relationships.hasOwnProperty('parent')){
        delete note.relationships.parent;
      }
      if (note.relationships.hasOwnProperty('list')){
        delete note.relationships.list;
      }
      return list;
    }
  }

  return {
    setNotes : function(notesResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      addListToNotes(notesResponse);
      return ArrayService.setArrays(
        notesResponse,
        notes[ownerUUID].activeNotes,
        notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
    },
    updateNotes: function(notesResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      addListToNotes(notesResponse);
      return ArrayService.updateArrays(
        notesResponse,
        notes[ownerUUID].activeNotes,
        notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
    },
    updateNoteProperties: function(uuid, properties, ownerUUID) {
      return ArrayService.updateItemProperties(
                uuid,
                properties,
                notes[ownerUUID].activeNotes,
                notes[ownerUUID].deletedNotes,
                getOtherArrays(ownerUUID));
    },
    getNotes : function(ownerUUID) {
      initializeArrays(ownerUUID);
      return notes[ownerUUID].activeNotes;
    },
    getArchivedNotes : function(ownerUUID) {
      initializeArrays(ownerUUID);
      return notes[ownerUUID].activeNotes;
    },
    getNoteByUUID : function(uuid, ownerUUID) {
      initializeArrays(ownerUUID);
      return notes[ownerUUID].activeNotes.findFirstObjectByKeyValue('uuid', uuid);
    },
    saveNote : function(note, ownerUUID) {
      var params;
      var list = moveListToParent(note);
      if (note.uuid){
        // Existing note
        if (UserSessionService.isOfflineEnabled()){
          // Push to offline buffer
          params = {type: 'note', owner: ownerUUID, uuid: note.uuid};
          BackendClientService.put('/api/' + ownerUUID + '/note/' + note.uuid,
                   this.putExistingNoteRegex, params, note);
          note.modified = (new Date()).getTime() + 1000000;
          if (list){
            note.relationships.list = list;
          }
          updateNote(note, ownerUUID);

        }else {
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/note/' + note.uuid,
                   this.putExistingNoteRegex, note).then(function(result) {
            if (result.data){
              note.modified = result.data.modified;
              if (list){
                note.relationships.list = list;
              }
              updateNote(note, ownerUUID);
            }
          });
        }
      }else{
        // New note
        if (UserSessionService.isOfflineEnabled()){
          // Push to offline queue with fake UUID
          var fakeUUID = UUIDService.generateFakeUUID();
          params = {type: 'note', owner: ownerUUID, fakeUUID: fakeUUID};
          BackendClientService.put('/api/' + ownerUUID + '/note',
                   this.putNewNoteRegex, params, note);
          note.uuid = fakeUUID;
          note.modified = (new Date()).getTime() + 1000000;
          if (list){
            note.relationships.list = list;
          }
          setNote(note, ownerUUID);
        }else {
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/note',
                   this.putNewNoteRegex, note).then(function(result) {
            if (result.data){
              note.uuid = result.data.uuid;
              note.modified = result.data.modified;
              if (list){
                note.relationships.list = list;
              }
              setNote(note, ownerUUID);
            }
          });
        }
      }
    },
    deleteNote : function(note, ownerUUID) {
      // Check if note has already been deleted
      if (notes[ownerUUID].deletedNotes.indexOf(note) > -1){
        return;
      }
      if (UserSessionService.isOfflineEnabled()){
        // Offline
        var params = {type: 'note', owner: ownerUUID, uuid: note.uuid,
                      reverse: {
                        method: 'post',
                        url: '/api/' + ownerUUID + '/note/' + note.uuid + '/undelete'
                      }};
        BackendClientService.deleteOffline('/api/' + ownerUUID + '/note/' + note.uuid,
                 this.deleteNoteRegex, params);
        var fakeTimestamp = (new Date()).getTime() + 1000000;
        note.deleted = fakeTimestamp;
        note.modified = fakeTimestamp;
        updateNote(note, ownerUUID);
      }else {
        BackendClientService.deleteOnline('/api/' + ownerUUID + '/note/' + note.uuid,
                 this.deleteNoteRegex).then(function(result) {
          if (result.data){
            note.deleted = result.data.deleted;
            note.modified = result.data.result.modified;
            updateNote(note, ownerUUID);
          }
        });
      }
    },
    undeleteNote : function(note, ownerUUID) {
      if (UserSessionService.isOfflineEnabled()){
        // Offline
        var params = {type: 'note', owner: ownerUUID, uuid: note.uuid};
        BackendClientService.post('/api/' + ownerUUID + '/note/' + note.uuid + '/undelete',
                 this.deleteNoteRegex, params);
        delete note.deleted;
        updateNote(note, ownerUUID);
      }else {
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/note/' + note.uuid + '/undelete',
                 this.deleteNoteRegex).then(function(result) {
          if (result.data){
            delete note.deleted;
            note.modified = result.data.modified;
            updateNote(note, ownerUUID);
          }
        });
      }
    },
    // Regular expressions for note requests
    putNewNoteRegex :
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   noteRegex.source),
    putExistingNoteRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   noteSlashRegex.source +
                   BackendClientService.uuidRegex.source),
    deleteNoteRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   noteSlashRegex.source +
                   BackendClientService.uuidRegex.source),
    undeleteNoteRegex:
        new RegExp(BackendClientService.apiPrefixRegex.source +
                   BackendClientService.uuidRegex.source +
                   noteSlashRegex.source +
                   BackendClientService.uuidRegex.source  +
                   BackendClientService.undeleteRegex.source)
  };
}

NotesService.$inject = ['UUIDService', 'UserSessionService', 'BackendClientService', 'ArrayService', 'ListsService', 'TagsService'];
angular.module('em.services').factory('NotesService', NotesService);