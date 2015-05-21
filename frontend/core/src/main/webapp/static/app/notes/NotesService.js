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
          if (note.mod && note.mod.hasOwnProperty('favorited')){
            if (!note.mod.favorited && note.trans.favorited !== undefined) delete note.trans.favorited;
            else note.trans.favorited = note.mod.favorited;
          }
          else if (note.favorited !== undefined) note.trans.favorited = note.favorited;
          else if (note.trans.favorited !== undefined) delete note.trans.favorited;
        }
      },
      {
        name: 'archived',
        skipTransport: true,
        isEdited: function(){
          // Changing archived should not save note. Archiving is done with separate functions.
          return false;
        },
        resetTrans: function(note){
          if (note.mod && note.mod.hasOwnProperty('archived')){
            if (!note.mod.archived && note.trans.archived !== undefined) delete note.trans.archived;
            else note.trans.archived = note.mod.archived;
          }
          else if (note.archived !== undefined) note.trans.archived = note.archived;
          else if (note.trans.archived !== undefined) delete note.trans.archived;
        }
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

  function updateNote(note, ownerUUID, oldUUID, propertiesToReset) {
    ItemLikeService.persistAndReset(note, 'note', ownerUUID, noteFieldInfos, oldUUID, propertiesToReset);
    return ArrayService.updateItem('notes', note,
                                   notes[ownerUUID].activeNotes,
                                   notes[ownerUUID].deletedNotes,
                                   getOtherArrays(ownerUUID));
  }

  function setNote(note, ownerUUID, propertiesToReset) {
    ItemLikeService.persistAndReset(note, 'note', ownerUUID, noteFieldInfos, undefined, propertiesToReset);
    ArrayService.setItem('notes', note,
                         notes[ownerUUID].activeNotes,
                         notes[ownerUUID].deletedNotes,
                         getOtherArrays(ownerUUID));
  }

  // Setup callback to ListsService
  var itemArchiveCallback = function(children, archived, historyTag, ownerUUID, unarchive) {
    if (notes[ownerUUID] && children) {
      for (var i=0, len=children.length; i<len; i++) {
        var activeNote = notes[ownerUUID].activeNotes.findFirstObjectByKeyValue('uuid', children[i].uuid);
        if (activeNote) {
          setArchiveFields(activeNote, children[i].modified, archived, historyTag, ownerUUID, unarchive);
        } else {
          var deletedNote = notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', children[i].uuid);
          if (deletedNote) {
            setArchiveFields(deletedNote, children[i].modified, archived, historyTag, ownerUUID, unarchive);
          } else {
            var archivedNote = notes[ownerUUID].archivedNotes.findFirstObjectByKeyValue('uuid',
                                                                                        children[i].uuid);
            if (archivedNote) {
              setArchiveFields(archivedNote, children[i].modified, archived, historyTag, ownerUUID,
                               unarchive);
            }
          }
        }
      }
    }
  };
  function setArchiveFields(note, modified, archived, historyTag, ownerUUID, unarchive){
    if (!unarchive){
      note.archived = archived;
    }else if (note.archived){
      delete note.archived;
    }
    note.modified = modified;

    // Also set history tag on the note
    if (!unarchive){
      if (!note.relationships) note.relationships = {};
      if (!note.relationships.tags) note.relationships.tags = [];
      var historyTagIndex = note.relationships.tags.indexOf(historyTag.uuid);
      if (historyTagIndex === -1) note.relationships.tags.push(historyTag.uuid);
    }
    updateNote(note, ownerUUID);
  }
  ListsService.registerItemArchiveCallback(itemArchiveCallback, 'NotesService');

  // Setup callback for tag deletion
  var tagDeletedCallback = function(deletedTag, ownerUUID, undelete) {
    if (notes[ownerUUID] && deletedTag) {
      var modifiedItems, i;
      if (!undelete){
        // Remove deleted tags from notes
        modifiedItems = TagsService.removeDeletedTagFromItems(notes[ownerUUID].activeNotes,
                                                                  deletedTag);
        modifiedItems.concat(TagsService.removeDeletedTagFromItems(notes[ownerUUID].deletedNotes,
                                                                   deletedTag));
        modifiedItems.concat(TagsService.removeDeletedTagFromItems(notes[ownerUUID].archivedNotes,
                                                                   deletedTag));
        for (i=0;i<modifiedItems.length;i++){
          updateNote(modifiedItems[i], ownerUUID);
        }
      }else{
        // Add undeleted tag back to notes
        modifiedItems = TagsService.addUndeletedTagToItems(notes[ownerUUID].activeNotes,
                                                                  deletedTag);
        modifiedItems.concat(TagsService.addUndeletedTagToItems(notes[ownerUUID].deletedNotes,
                                                                   deletedTag));
        modifiedItems.concat(TagsService.addUndeletedTagToItems(notes[ownerUUID].archivedNotes,
                                                                   deletedTag));
        for (i=0;i<modifiedItems.length;i++){
          updateNote(modifiedItems[i], ownerUUID);
        }
      }
    }
  };
  TagsService.registerTagDeletedCallback(tagDeletedCallback, 'NotesService');

  // Setup callback for list deletion
  var listDeletedCallback = function(deletedList, ownerUUID, undelete) {
    if (notes[ownerUUID] && deletedList) {
      var modifiedItems, i, len;
      if (!undelete){
        // Remove deleted list from notes
        modifiedItems = ListsService.removeDeletedListFromItems(notes[ownerUUID].activeNotes,
                                                                    deletedList);
        modifiedItems.concat(ListsService.removeDeletedListFromItems(notes[ownerUUID].deletedNotes,
                                                                     deletedList));
        modifiedItems.concat(ListsService.removeDeletedListFromItems(notes[ownerUUID].archivedNotes,
                                                                     deletedList));
        for (i=0,len=modifiedItems.length;i<len;i++){
          updateNote(modifiedItems[i], ownerUUID);
        }
      }else{
        // Add undeleted list back to notes
        modifiedItems = ListsService.addUndeletedListToItems(notes[ownerUUID].activeNotes,
                                                                    deletedList);
        modifiedItems.concat(ListsService.addUndeletedListToItems(notes[ownerUUID].deletedNotes,
                                                                     deletedList));
        modifiedItems.concat(ListsService.addUndeletedListToItems(notes[ownerUUID].archivedNotes,
                                                                     deletedList));
        for (i=0,len=modifiedItems.length;i<len;i++){
          updateNote(modifiedItems[i], ownerUUID);
        }
        return modifiedItems;
      }
    }
  };
  ListsService.registerListDeletedCallback(listDeletedCallback, 'NotesService');

  return {
    getNewNote: function(initialValues, ownerUUID) {
      return ItemLikeService.getNew(initialValues, 'note', ownerUUID, noteFieldInfos);
    },
    setNotes: function(notesResponse, ownerUUID, skipPersist, addToExisting) {
      if (skipPersist){
        ItemLikeService.resetTrans(notesResponse, 'note', ownerUUID, noteFieldInfos);
      }else{
        ItemLikeService.persistAndReset(notesResponse, 'note', ownerUUID, noteFieldInfos);
      }
      if (addToExisting){
        return ArrayService.updateArrays('notes', notesResponse,
                                    notes[ownerUUID].activeNotes,
                                    notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
      }else{
        return ArrayService.setArrays('notes', notesResponse,
                                    notes[ownerUUID].activeNotes,
                                    notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
      }
    },
    updateNotes: function(notesResponse, ownerUUID) {
      if (notesResponse && notesResponse.length){
        // Go through notesResponse, and add .mod values if the fields in the current .mod do not match
        // the values in the persistent response
        var updatedNotes = [];
        for (var i=0, len=notesResponse.length; i<len; i++){
          var noteInfo = this.getNoteInfo(notesResponse[i].uuid, ownerUUID);
          if (noteInfo){
            updatedNotes.push(noteInfo.note);
            if (ItemLikeService.evaluateMod(notesResponse[i],
                                            noteInfo.note,
                                            'note', ownerUUID, noteFieldInfos)){
              // Don't reset trans when mod matches database values to prevent problems with autosave
              ItemLikeService.persistAndReset(noteInfo.note, 'note', ownerUUID,
                                              noteFieldInfos, undefined, {});
            }else{
              // Mod does not exist or it does/did not match database, reset all trans values
              ItemLikeService.persistAndReset(noteInfo.note, 'note', ownerUUID, noteFieldInfos);
            }
          }else{
            updatedNotes.push(notesResponse[i]);
            ItemLikeService.persistAndReset(notesResponse[i], 'note', ownerUUID, noteFieldInfos);
          }
        }
        return ArrayService.updateArrays('notes', updatedNotes,
                                         notes[ownerUUID].activeNotes,
                                         notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
      }
    },
    updateNoteModProperties: function(uuid, properties, ownerUUID) {
      var noteInfo = this.getNoteInfo(uuid, ownerUUID);
      if (noteInfo){
        if (!properties){
          if (noteInfo.note.mod){
            delete noteInfo.note.mod;
            updateNote(noteInfo.note, ownerUUID);
          }
        }else{
          if (!noteInfo.note.mod) noteInfo.note.mod = {};
          if (properties.associated) {
            // Delete associated array before update.
            delete properties.associated;
          }
          ItemLikeService.updateObjectProperties(noteInfo.note.mod, properties);
          if (properties.uuid){
            // UUID has changed
            updateNote(noteInfo.note, ownerUUID, uuid, properties);
          }else{
            updateNote(noteInfo.note, ownerUUID, undefined, properties);
          }
        }
        return noteInfo.note;
      }
    },
    updateNoteHistProperties: function(uuid, properties, ownerUUID) {
      var noteInfo = this.getNoteInfo(uuid, ownerUUID);
      if (noteInfo){
        if (!properties){
          if (noteInfo.note.hist){
            delete noteInfo.note.hist;
            updateNote(noteInfo.note, ownerUUID);
          }
        }else{
          if (!noteInfo.note.hist) noteInfo.note.hist = {};
          ItemLikeService.updateObjectProperties(noteInfo.note.hist, properties);
          // Last parameter is to prevent unnecessary resetting of trans
          updateNote(noteInfo.note, ownerUUID, undefined, {});
          return noteInfo.note;
        }
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
                                            notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
    },
    getNoteInfo: function(value, ownerUUID, searchField) {
      var field = searchField ? searchField : 'uuid';
      var note = notes[ownerUUID].activeNotes.findFirstObjectByKeyValue(field, value, 'trans');
      if (note){
        return {
          type: 'active',
          note: note
        };
      }
      note = notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue(field, value, 'trans');
      if (note){
        return {
          type: 'deleted',
          note: note
        };
      }
      note = notes[ownerUUID].archivedNotes.findFirstObjectByKeyValue(field, value, 'trans');
      if (note){
        return {
          type: 'archived',
          note: note
        };
      }
    },
    saveNote: function(note, pollForSaveReady) {
      var ownerUUID = note.trans.owner;
      var deferred = $q.defer();
      if (notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', note.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        ItemLikeService.save(note, 'note', ownerUUID, noteFieldInfos).then(
          function(result){

            if (result === 'new') setNote(note, ownerUUID, ['uuid', 'created', 'modified']);
            else if (result === 'existing') updateNote(note, ownerUUID, undefined, {});

            if (pollForSaveReady) {
              UISessionService.resolveWhenTrue(BackendClientService.isProcessing, pollForSaveReady, deferred,
                                               result);
            } else {
              deferred.resolve(result);
            }

          }, function(failure){
            deferred.reject(failure);
          }
        );
      }
      return deferred.promise;
    },
    getNoteStatus: function(note) {
      var ownerUUID = note.trans.owner;
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
    isNoteEdited: function(note) {
      var ownerUUID = note.trans.owner;
      return ItemLikeService.isEdited(note, 'note', ownerUUID, noteFieldInfos);
    },
    resetNote: function(note) {
      var ownerUUID = note.trans.owner;
      return ItemLikeService.resetTrans(note, 'note', ownerUUID, noteFieldInfos);
    },
    deleteNote: function(note) {
      var ownerUUID = note.trans.owner;
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
    undeleteNote: function(note) {
      var ownerUUID = note.trans.owner;
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
    favoriteNote: function(note) {
      var ownerUUID = note.trans.owner;
      var deferred = $q.defer();
      if (notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', note.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else if (note.trans.favorited === true){
        deferred.resolve(note);
      } else {
        var params = {
          type: 'note', owner: ownerUUID, uuid: note.trans.uuid,
          reverse: {
            method: 'post',
            url: '/api/' + ownerUUID + '/note/' + note.trans.uuid + '/unfavorite'
          }, lastReplaceable: true
        };
        var fakeTimestamp = BackendClientService.generateFakeTimestamp();
        BackendClientService.postOffline('/api/' + ownerUUID + '/note/' + note.trans.uuid + '/favorite',
                                  this.favoriteNoteRegex, params, undefined, fakeTimestamp);
        if (!note.mod) note.mod = {};
        var propertiesToReset = {modified: fakeTimestamp,
                                 favorited: BackendClientService.generateFakeTimestamp()};
        ItemLikeService.updateObjectProperties(note.mod,
                                               propertiesToReset);
        updateNote(note, ownerUUID, undefined, propertiesToReset);
        deferred.resolve(note);
      }
      return deferred.promise;
    },
    unfavoriteNote: function(note) {
      var ownerUUID = note.trans.owner;
      var deferred = $q.defer();
      if (notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', note.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else if (!note.trans.favorited){
        deferred.resolve(note);
      } else {
        var params = {type: 'note', owner: ownerUUID, uuid: note.trans.uuid, lastReplaceable: true};
        var fakeTimestamp = BackendClientService.generateFakeTimestamp();
        BackendClientService.postOffline('/api/' + ownerUUID + '/note/' + note.trans.uuid + '/unfavorite',
                                  this.unfavoriteNoteRegex, params, undefined, fakeTimestamp);
        if (!note.mod) note.mod = {};
        var propertiesToReset = {modified: fakeTimestamp,
                                 favorited: undefined};
        ItemLikeService.updateObjectProperties(note.mod, propertiesToReset);
        updateNote(note, ownerUUID, undefined, propertiesToReset);
        deferred.resolve(note);
      }
      return deferred.promise;
    },
    clearNotes: function() {
      notes = {};
    },
    changeOwnerUUID: function(oldUUID, newUUID){
      if (notes[oldUUID]){
        notes[newUUID] = notes[oldUUID];
        delete notes[oldUUID];
        ItemLikeService.persistAndReset(notes[newUUID].activeNotes, 'note', newUUID, noteFieldInfos);
        ItemLikeService.persistAndReset(notes[newUUID].archivedNotes, 'note', newUUID, noteFieldInfos);
        ItemLikeService.persistAndReset(notes[newUUID].deletedNotes, 'note', newUUID, noteFieldInfos);
      }
    },
    /*
    * Check active and archived arrays for tasks with the list.
    */
    isNotesWithList: function(list) {
      var ownerUUID = list.trans.owner;
      var i;
      for (i = 0; i < notes[ownerUUID].activeNotes.length; i++) {
        if (notes[ownerUUID].activeNotes[i].trans.list &&
            notes[ownerUUID].activeNotes[i].trans.list.uuid === list.uuid)
        {
          return true;
        }
      }
      for (i = 0; i < notes[ownerUUID].archivedNotes.length; i++){
        if (notes[ownerUUID].archivedNotes[i].trans.list &&
            notes[ownerUUID].archivedNotes[i].trans.list.uuid === list.uuid)
        {
          return true;
        }
      }
    },
    noteFieldInfos: noteFieldInfos,
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
                                    '$')
  };
}

NotesService['$inject'] = ['$q', 'ArrayService', 'BackendClientService', 'ExtendedItemService',
'ItemLikeService', 'ListsService', 'TagsService', 'UISessionService', 'UserSessionService'];
angular.module('em.notes').factory('NotesService', NotesService);
