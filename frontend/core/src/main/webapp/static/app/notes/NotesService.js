/*global angular */
'use strict';

function NotesService(BackendClientService, ArrayService, ListsService){

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

  // Setup callback to ListsService
  var itemArchiveCallback = function(children, archived, ownerUUID){
    if (notes[ownerUUID] && children){
      for (var i=0, len=children.length; i<len; i++) {
        var activeNote = notes[ownerUUID].activeNotes.findFirstObjectByKeyValue('uuid', children[i].uuid);
        if (activeNote){
          activeNote.archived = archived;
          activeNote.modified = children[i].modified;
          ArrayService.updateItem(activeNote,
            notes[ownerUUID].activeNotes,
            notes[ownerUUID].deletedNotes,
            getOtherArrays(ownerUUID));
        }else{
          var deletedNote = notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', children[i].uuid);
          if (deletedNote){
            deletedNote.archived = archived;
            deletedNote.modified = children[i].modified;
            ArrayService.updateItem(deletedNote,
              notes[ownerUUID].activeNotes,
              notes[ownerUUID].deletedNotes,
              getOtherArrays(ownerUUID));
          }else{
            var archivedNote = notes[ownerUUID].archivedNotes.findFirstObjectByKeyValue('uuid', children[i].uuid);
            if (archivedNote){
              archivedNote.archived = archived;
              archivedNote.modified = children[i].modified;
              ArrayService.updateItem(archivedNote,
                notes[ownerUUID].activeNotes,
                notes[ownerUUID].deletedNotes,
                getOtherArrays(ownerUUID));
            }
          }
        }
      }
    }
  };
  ListsService.registerItemArchiveCallback(itemArchiveCallback, 'NotesService');

  return {
    setNotes : function(notesResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      return ArrayService.setArrays(
        notesResponse,
        notes[ownerUUID].activeNotes,
        notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
    },
    updateNotes: function(notesResponse, ownerUUID) {
      initializeArrays(ownerUUID);
      return ArrayService.updateArrays(
        notesResponse,
        notes[ownerUUID].activeNotes,
        notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
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
      if (note.uuid){
        // Existing note
        BackendClientService.put('/api/' + ownerUUID + '/note/' + note.uuid,
                 this.putExistingNoteRegex, note).then(function(result) {
          if (result.data){
            note.modified = result.data.modified;
            ArrayService.updateItem(
              note,
              notes[ownerUUID].activeNotes,
              notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
          }
        });
      }else{
        // New note
        BackendClientService.put('/api/' + ownerUUID + '/note',
                 this.putNewNoteRegex, note).then(function(result) {
          if (result.data){
            note.uuid = result.data.uuid;
            note.modified = result.data.modified;
            initializeArrays(ownerUUID);
            ArrayService.setItem(
              note,
              notes[ownerUUID].activeNotes,
              notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
          }
        });
      }
    },
    deleteNote : function(note, ownerUUID) {
      BackendClientService.delete('/api/' + ownerUUID + '/note/' + note.uuid,
               this.deleteNoteRegex).then(function(result) {
        if (result.data){
          note.deleted = result.data.deleted;
          note.modified = result.data.result.modified;
          ArrayService.updateItem(
              note,
              notes[ownerUUID].activeNotes,
              notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
        }
      });
    },
    undeleteNote : function(note, ownerUUID) {
      BackendClientService.post('/api/' + ownerUUID + '/note/' + note.uuid + '/undelete',
               this.deleteNoteRegex).then(function(result) {
        if (result.data){
          delete note.deleted;
          note.modified = result.data.modified;
          ArrayService.updateItem(
              note,
              notes[ownerUUID].activeNotes,
              notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
        }
      });
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
  
NotesService.$inject = ['BackendClientService', 'ArrayService', 'ListsService'];
angular.module('em.services').factory('NotesService', NotesService);