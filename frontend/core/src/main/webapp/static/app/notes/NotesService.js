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

 function NotesService($q, ArrayService, BackendClientService, ExtendedItemService, ItemLikeService,
                       ListsService, TagsService, UISessionService, UserSessionService) {

  var noteFieldInfos = ItemLikeService.getFieldInfos(
    [ 'content',
      {
        name: 'favorited',
        skipTransport: true,
        isEdited: function(){
          // Changing favorite should not save note. Favoriting is done with separate functions.
          return false;
        },
        resetTrans: function(note){
          if (note.mod && note.mod.favorited !== undefined) note.trans.favorited = note.mod.favorited;
          else if (note.favorited !== undefined) note.trans.favorited = note.favorited;
          else if (note.trans.favorited !== undefined) delete note.trans.favorited;
        },
      },
      // TODO:
      // visibility,
      ExtendedItemService.getRelationshipsFieldInfo()
    ]
  );

  // An object containing notes for every owner
  var notes = {};
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

  function updateNote(note, ownerUUID, oldUUID) {
    ItemLikeService.persistAndReset(note, 'note', ownerUUID, noteFieldInfos, oldUUID);
    return ArrayService.updateItem(note,
                                   notes[ownerUUID].activeNotes,
                                   notes[ownerUUID].deletedNotes,
                                   getOtherArrays(ownerUUID));
  }

  function setNote(note, ownerUUID) {
    ItemLikeService.persistAndReset(note, 'note', ownerUUID, noteFieldInfos);
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
  var tagDeletedCallback = function(deletedTag, ownerUUID, undelete) {
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

  return {
    getNewNote: function(initialValues, ownerUUID) {
      return ItemLikeService.getNew(initialValues, 'note', ownerUUID, noteFieldInfos);
    },
    setNotes: function(notesResponse, ownerUUID, skipPersist) {
      if (skipPersist){
        ItemLikeService.resetTrans(notesResponse, 'note', ownerUUID, noteFieldInfos);
      }else{
        ItemLikeService.persistAndReset(notesResponse, 'note', ownerUUID, noteFieldInfos);
      }
      return ArrayService.setArrays(notesResponse,
                                    notes[ownerUUID].activeNotes,
                                    notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
    },
    updateNotes: function(notesResponse, ownerUUID) {
      if (notesResponse && notesResponse.length){
        // Go through notesResponse, and add .mod values if the fields in the current .mod do not match
        // the values in the persistent response
        var updatedNotes = [];
        for (var i=0, len=notesResponse.length; i<len; i++){
          var noteInfo = this.getNoteInfo(notesResponse[i].uuid, ownerUUID);
          if (noteInfo){
            updatedNotes.push(ItemLikeService.evaluateMod(
                                notesResponse[i], noteInfo.note, 'note', ownerUUID, noteFieldInfos));
          }else{
            updatedNotes.push(notesResponse[i]);
          }
        }
        ItemLikeService.persistAndReset(updatedNotes, 'note', ownerUUID, noteFieldInfos);
        return ArrayService.updateArrays(updatedNotes,
                                         notes[ownerUUID].activeNotes,
                                         notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
      }
    },
    updateNoteModProperties: function(uuid, properties, ownerUUID) {
      var noteInfo = this.getNoteInfo(uuid, ownerUUID);
      if (noteInfo){
        if (properties === null){
          if (noteInfo.note.mod){
            delete noteInfo.note.mod;
            updateNote(noteInfo.note, ownerUUID);
          }
        }else if (properties !== undefined){
          if (!noteInfo.note.mod) noteInfo.note.mod = {};
          ItemLikeService.updateObjectProperties(noteInfo.note.mod, properties);
          updateNote(noteInfo.note, ownerUUID, properties.uuid ? uuid : undefined);
        }
        return noteInfo.note;
      }
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
    getModifiedNotes: function(ownerUUID) {
      return ArrayService.getModifiedItems(notes[ownerUUID].activeNotes,
                                            notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID))
    },
    getNoteInfo: function(uuid, ownerUUID) {
      var note = notes[ownerUUID].activeNotes.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (note){
        return {
          type: 'active',
          note: ItemLikeService.resetTrans(note, 'note', ownerUUID, noteFieldInfos)
        };
      }
      note = notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (note){
        return {
          type: 'deleted',
          note: ItemLikeService.resetTrans(note, 'note', ownerUUID, noteFieldInfos)
        };
      }
      note = notes[ownerUUID].archivedNotes.findFirstObjectByKeyValue('uuid', uuid, 'trans');
      if (note){
        return {
          type: 'archived',
          note: ItemLikeService.resetTrans(note, 'note', ownerUUID, noteFieldInfos)
        };
      }
    },
    saveNote: function(note, ownerUUID) {
      var deferred = $q.defer();
      if (notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', note.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        ItemLikeService.save(note, 'note', ownerUUID, noteFieldInfos).then(
          function(result){
            if (result === 'new') setNote(note, ownerUUID);
            else if (result === 'existing') updateNote(note, ownerUUID);
            deferred.resolve(result);
          }, function(failure){
            deferred.reject(failure);
          }
        );
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
      setNote(note, ownerUUID);
    },
    removeNote: function(uuid, ownerUUID) {
      var noteInfo = this.getNoteInfo(uuid, ownerUUID);
      if (noteInfo) {
        var noteIndex;
        if (noteInfo.type === 'active') {
          noteIndex = notes[ownerUUID].activeNotes.indexOf(noteInfo.note);
          ItemLikeService.remove(noteInfo.note.trans.uuid);
          notes[ownerUUID].activeNotes.splice(noteIndex, 1);
        } else if (noteInfo.type === 'deleted') {
          noteIndex = notes[ownerUUID].deletedNotes.indexOf(noteInfo.note);
          ItemLikeService.remove(noteInfo.note.trans.uuid);
          notes[ownerUUID].deletedNotes.splice(noteIndex, 1);
        } else if (noteInfo.type === 'archived') {
          noteIndex = notes[ownerUUID].archivedNotes.indexOf(noteInfo.note);
          ItemLikeService.remove(noteInfo.note.trans.uuid);
          notes[ownerUUID].archivedNotes.splice(noteIndex, 1);
        }
      }
    },
    isNoteEdited: function(note, ownerUUID) {
      return ItemLikeService.isEdited(note, 'note', ownerUUID, noteFieldInfos);
    },
    resetNote: function(note, ownerUUID) {
      return ItemLikeService.resetTrans(note, 'note', ownerUUID, noteFieldInfos);
    },
    deleteNote: function(note, ownerUUID) {
      var deferred = $q.defer();
      if (notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', note.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.processDelete(note, 'note', ownerUUID, noteFieldInfos).then(
          function(){
            updateNote(note, ownerUUID);
            deferred.resolve(note);
          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    undeleteNote: function(note, ownerUUID) {
      var deferred = $q.defer();
      if (!notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', note.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.undelete(note, 'note', ownerUUID, noteFieldInfos).then(
          function(){
            updateNote(note, ownerUUID);
            deferred.resolve(note);
          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    favoriteNote: function(note, ownerUUID) {
      var deferred = $q.defer();
      if (notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', note.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else if (note.trans.favorited === true){
        deferred.resolve(note);
      } else {
        if (UserSessionService.isOfflineEnabled()) {
          // Offline
          var params = {
            type: 'note', owner: ownerUUID, uuid: note.trans.uuid,
            reverse: {
              method: 'post',
              url: '/api/' + ownerUUID + '/note/' + note.trans.uuid + '/unfavorite'
            }, lastReplaceable: true
          };
          var fakeTimestamp = BackendClientService.generateFakeTimestamp();
          BackendClientService.post('/api/' + ownerUUID + '/note/' + note.trans.uuid + '/favorite',
                                    this.favoriteNoteRegex, params, undefined, fakeTimestamp);
          if (!note.mod) note.mod = {};
          ItemLikeService.updateObjectProperties(note.mod,
                                                 {modified: fakeTimestamp,
                                                  favorited: BackendClientService.generateFakeTimestamp()});
          updateNote(note, ownerUUID);
          deferred.resolve(note);
        } else {
          // Online
          BackendClientService.postOnline('/api/' + ownerUUID + '/note/' + note.trans.uuid + '/favorite',
                                        this.favoriteNoteRegex)
          .then(function(result) {
            note.favorited = result.data.favorited;
            ItemLikeService.updateObjectProperties(note, result.data.result);
            updateNote(note, ownerUUID);
            deferred.resolve(note);
          });
        }
      }
      return deferred.promise;
    },
    unfavoriteNote: function(note, ownerUUID) {
      var deferred = $q.defer();
      if (notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', note.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else if (!note.trans.favorited){
        deferred.resolve(note);
      } else {
        if (UserSessionService.isOfflineEnabled()) {
          // Offline
          var params = {type: 'note', owner: ownerUUID, uuid: note.trans.uuid, lastReplaceable: true};
          var fakeTimestamp = BackendClientService.generateFakeTimestamp();
          BackendClientService.post('/api/' + ownerUUID + '/note/' + note.trans.uuid + '/unfavorite',
                                    this.unfavoriteNoteRegex, params, undefined, fakeTimestamp);
          if (!note.mod) note.mod = {};
          ItemLikeService.updateObjectProperties(note.mod,
                                                 {modified: fakeTimestamp,
                                                  favorited: undefined});
          updateNote(note, ownerUUID);
          deferred.resolve(note);
        } else {
          // Online
          BackendClientService.postOnline('/api/' + ownerUUID + '/note/' + note.trans.uuid + '/unfavorite',
                                          this.unfavoriteNoteRegex)
          .then(function(result) {
            delete note.favorited;
            ItemLikeService.updateObjectProperties(note, result.data.result);
            updateNote(note, ownerUUID);
            deferred.resolve(note);
          });
        }
      }
      return deferred.promise;
    },
    clearNotes: function() {
      notes = {};
    },

    // Regular expressions for note requests
    putNewNoteRegex: ItemLikeService.getPutNewRegex('note'),
    putExistingNoteRegex: ItemLikeService.getPutExistingRegex('note'),
    deleteNoteRegex: ItemLikeService.getDeleteRegex('note'),
    undeleteNoteRegex: ItemLikeService.getUndeleteRegex('note'),
    favoriteNoteRegex: new RegExp('^' +
                                  BackendClientService.apiPrefixRegex.source +
                                  BackendClientService.uuidRegex.source +
                                  noteSlashRegex.source +
                                  BackendClientService.uuidRegex.source +
                                  favoriteRegex.source +
                                  '$'),
    unfavoriteNoteRegex: new RegExp('^' +
                                    BackendClientService.apiPrefixRegex.source +
                                    BackendClientService.uuidRegex.source +
                                    noteSlashRegex.source +
                                    BackendClientService.uuidRegex.source +
                                    unfavoriteRegex.source +
                                    '$'),
  };
}

NotesService['$inject'] = ['$q', 'ArrayService', 'BackendClientService', 'ExtendedItemService',
'ItemLikeService', 'ListsService', 'TagsService', 'UISessionService', 'UserSessionService'];
angular.module('em.notes').factory('NotesService', NotesService);
