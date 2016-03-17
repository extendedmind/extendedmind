/* Copyright 2013-2016 Extended Mind Technologies Oy
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
  var NOTE_TYPE = 'note';

  var noteFieldInfos = ItemLikeService.getFieldInfos(
    [ 'content',
      'format',
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
      ExtendedItemService.getVisibilityFieldInfo(),
      ExtendedItemService.getRevisionFieldInfo(),
      ExtendedItemService.getRelationshipsFieldInfo()
    ]
  );

  // An object containing notes for every owner
  var notes = {};
  var noteSlashRegex = /\/note\//;
  var favoriteRegex = /\/favorite/;
  var unfavoriteRegex = /\/unfavorite/;
  var previewRegex = /\/preview/;
  var publishRegex = /\/publish/;
  var unpublishRegex = /\/unpublish/;

  var previewNoteRegexp = new RegExp('^' +
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    noteSlashRegex.source +
    BackendClientService.uuidRegex.source +
    previewRegex.source +
    '$');

  var publishNoteRegexp = new RegExp('^' +
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    noteSlashRegex.source +
    BackendClientService.uuidRegex.source +
    publishRegex.source +
    '$');

  var unpublishNoteRegexp = new RegExp('^' +
    BackendClientService.apiPrefixRegex.source +
    BackendClientService.uuidRegex.source +
    noteSlashRegex.source +
    BackendClientService.uuidRegex.source +
    unpublishRegex.source +
    '$');

  function initializeArrays(ownerUUID) {
    if (!notes[ownerUUID]) {
      notes[ownerUUID] = {
        activeNotes: [],
        deletedNotes: [],
        archivedNotes: []
      };
    }
  }
  function notifyOwners(userUUID, collectives, sharedLists) {
    var extraOwners = ItemLikeService.processOwners(userUUID, collectives, sharedLists,
                                                    notes, initializeArrays);
    for (var i=0; i < extraOwners.length; i++){
      // Need to destroy data from this owner
      ItemLikeService.destroyPersistentItems(
        notes[extraOwners[i]].activeNotes.concat(
            notes[extraOwners[i]].deletedNotes).concat(notes[extraOwners[i]].archivedNotes));
      delete notes[extraOwners[i]];
    }
  }
  UserSessionService.registerNofifyOwnersCallback(notifyOwners, 'NotesService');

  function getOtherArrays(ownerUUID) {
    return [{array: notes[ownerUUID].archivedNotes, id: 'archived'}];
  }

  function updateNote(note, ownerUUID, oldUUID, propertiesToReset) {
    ItemLikeService.persistAndReset(note, NOTE_TYPE, ownerUUID, noteFieldInfos, oldUUID, propertiesToReset);
    return ArrayService.updateItem(ownerUUID, NOTE_TYPE, note,
                                   notes[ownerUUID].activeNotes,
                                   notes[ownerUUID].deletedNotes,
                                   getOtherArrays(ownerUUID));
  }

  function setNote(note, ownerUUID, propertiesToReset) {
    ItemLikeService.persistAndReset(note, NOTE_TYPE, ownerUUID, noteFieldInfos, undefined, propertiesToReset);
    ArrayService.setItem(ownerUUID, NOTE_TYPE, note,
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
    if (!note.mod) note.mod = {};
    var propertiesToReset = {
      modified: modified,
      archived: archived
    };

    // Also set history tag on the note
    if (!unarchive){
      if (note.mod.relationships) propertiesToReset.relationships = note.mod.relatiohships;
      else if (note.relationships) propertiesToReset.relationships = note.relationships;
      else propertiesToReset.relationships = {};
      if (!propertiesToReset.relationships.tags) propertiesToReset.relationships.tags = [];
      var historyTagIndex = propertiesToReset.relationships.tags.indexOf(historyTag.uuid);
      if (historyTagIndex === -1) propertiesToReset.relationships.tags.push(historyTag.uuid);
    }
    ItemLikeService.updateObjectProperties(note.mod, propertiesToReset);
    updateNote(note, ownerUUID, undefined, propertiesToReset);
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

  // Setup callback for collective tag sync
  var collectiveTagsSyncedCallback = function(updatedTags, noteInfos, collectiveUUID) {
    if (noteInfos && noteInfos.length){
      for (var i=0; i<noteInfos.length; i++){
        var noteInfo = getNoteInfo(noteInfos[i].uuid, noteInfos[i].owner);
        if (noteInfo){
          ItemLikeService.resetTrans(noteInfo.note, NOTE_TYPE, noteInfo.note.trans.owner, noteFieldInfos);
        }
      }
    }
  };
  TagsService.registerCollectiveTagsSyncedCallback(collectiveTagsSyncedCallback, NOTE_TYPE);

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

  function getNoteInfo(value, ownerUUID, searchField) {
    if (value !== undefined){
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
    }
  };

  return {
    getNewNote: function(initialValues, ownerUUID) {
      return ItemLikeService.getNew(initialValues, NOTE_TYPE, ownerUUID, noteFieldInfos);
    },
    setNotes: function(notesResponse, ownerUUID, skipPersist, addToExisting) {
      var notesToSave;
      if (skipPersist){
        notesToSave = ItemLikeService.resetAndPruneOldDeleted(notesResponse, NOTE_TYPE,
                                                              ownerUUID, noteFieldInfos);
      }else{
        notesToSave = ItemLikeService.persistAndReset(notesResponse, NOTE_TYPE, ownerUUID, noteFieldInfos);
      }
      if (addToExisting){
        return ArrayService.updateArrays(ownerUUID, NOTE_TYPE, notesToSave,
                                    notes[ownerUUID].activeNotes,
                                    notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
      }else{
        return ArrayService.setArrays(ownerUUID, NOTE_TYPE, notesToSave,
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
                                            NOTE_TYPE, ownerUUID, noteFieldInfos)){
              // Don't reset trans when mod matches database values to prevent problems with autosave
              ItemLikeService.persistAndReset(noteInfo.note, NOTE_TYPE, ownerUUID,
                                              noteFieldInfos, undefined, {});
            }else{
              // Mod does not exist or it does/did not match database, reset all trans values
              ItemLikeService.persistAndReset(noteInfo.note, NOTE_TYPE, ownerUUID, noteFieldInfos);
            }
          }else{
            updatedNotes.push(notesResponse[i]);
            ItemLikeService.persistAndReset(notesResponse[i], NOTE_TYPE, ownerUUID, noteFieldInfos);
          }
        }
        return ArrayService.updateArrays(ownerUUID, NOTE_TYPE, updatedNotes,
                                         notes[ownerUUID].activeNotes,
                                         notes[ownerUUID].deletedNotes, getOtherArrays(ownerUUID));
      }
    },
    updateNoteModProperties: function(uuid, properties, ownerUUID, localModToggleValueWins) {
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

          if (localModToggleValueWins && properties.favorited && !noteInfo.note.mod.favorited){
            // This means that there has been a quick unfavorite after this response from the server,
            // don't set favorited value to mod
            delete properties.favorited;
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
    getNoteInfo: getNoteInfo,
    saveNote: function(note, pollForSaveReady) {
      var ownerUUID = note.trans.owner;
      var deferred = $q.defer();
      if (notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', note.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        ItemLikeService.save(note, NOTE_TYPE, ownerUUID, noteFieldInfos).then(
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
        ItemLikeService.remove(noteInfo.note.trans.uuid);
        ArrayService.removeFromArrays(ownerUUID, noteInfo.note, NOTE_TYPE,
                                      notes[ownerUUID].activeNotes,
                                      notes[ownerUUID].deletedNotes,
                                      getOtherArrays(ownerUUID));
        return noteInfo.note.hist ? noteInfo.note.hist : {};
      }
    },
    isNoteEdited: function(note) {
      var ownerUUID = note.trans.owner;
      return ItemLikeService.isEdited(note, NOTE_TYPE, ownerUUID, noteFieldInfos);
    },
    resetNote: function(note) {
      var ownerUUID = note.trans.owner;
      return ItemLikeService.resetTrans(note, NOTE_TYPE, ownerUUID, noteFieldInfos);
    },
    deleteNote: function(note) {
      var ownerUUID = note.trans.owner;
      var deferred = $q.defer();
      if (notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', note.trans.uuid, 'trans')) {
        deferred.resolve('unmodified');
      }else{
        ItemLikeService.processDelete(note, NOTE_TYPE, ownerUUID, noteFieldInfos).then(
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
        ItemLikeService.undelete(note, NOTE_TYPE, ownerUUID, noteFieldInfos).then(
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
          type: NOTE_TYPE, owner: ownerUUID, uuid: note.trans.uuid,
          reverse: {
            method: 'post',
            url: '/api/' + ownerUUID + '/note/' + note.trans.uuid + '/unfavorite'
          }, lastReplaceable: true
        };
        var fakeTimestamp = BackendClientService.generateFakeTimestamp();
        BackendClientService.postOffline('/api/' + ownerUUID + '/note/' + note.trans.uuid + '/favorite',
                                  this.favoriteNoteRegex, params, undefined, fakeTimestamp);
        if (!note.mod) note.mod = {};
        var propertiesToReset = {saved: fakeTimestamp,
                                 favorited: fakeTimestamp};
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
        var params = {type: NOTE_TYPE, owner: ownerUUID, uuid: note.trans.uuid, lastReplaceable: true};
        var fakeTimestamp = BackendClientService.generateFakeTimestamp();
        BackendClientService.postOffline('/api/' + ownerUUID + '/note/' + note.trans.uuid + '/unfavorite',
                                  this.unfavoriteNoteRegex, params, undefined, fakeTimestamp);
        if (!note.mod) note.mod = {};
        var propertiesToReset = {saved: fakeTimestamp,
                                 favorited: undefined};
        ItemLikeService.updateObjectProperties(note.mod, propertiesToReset);
        updateNote(note, ownerUUID, undefined, propertiesToReset);
        deferred.resolve(note);
      }
      return deferred.promise;
    },
    previewNote: function(note) {
      function getPreviewUrl(params){
        return params.prefix + params.note.trans.uuid + '/preview';
      }
      var ownerUUID = note.trans.owner;
      // Check that note is not deleted before trying to preview
      var deferred = $q.defer();
      if (notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', note.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        var payload = {format: 'md'};
        BackendClientService.postOnline({ value: '/api/' + ownerUUID + '/note/' +
                                                 note.trans.uuid + '/preview',
                                          refresh: getPreviewUrl,
                                          params: {
                                            prefix: '/api/' + ownerUUID + '/note/',
                                            note: note }},
                                        previewNoteRegexp, payload)
        .then(function(response) {
          var propertiesToReset = {
            modified: response.result.modified
          };
          propertiesToReset.visibility = note.visibility ? note.visibility : {};
          propertiesToReset.visibility.preview = response.preview;
          propertiesToReset.visibility.previewExpires = response.previewExpires;

          // Add properties to persistent values and update note
          ItemLikeService.updateObjectProperties(note, propertiesToReset);
          updateNote(note, ownerUUID, undefined, propertiesToReset);
          deferred.resolve(response);
        },function(error){
          deferred.reject(error);
        });
      }
      return deferred.promise;
    },
    publishNote: function(note, path, licence, publicUi) {
      function getPublishUrl(params){
        return params.prefix + params.note.trans.uuid + '/publish';
      }

      var ownerUUID = note.trans.owner;
      // Check that note is not deleted before trying to publish
      var deferred = $q.defer();
      if (notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', note.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        var payload = {format: 'md', 'path': path};
        if (licence) payload.licence = licence;
        if (publicUi) payload.publicUi = JSON.stringify(publicUi);
        BackendClientService.postOnline({ value: '/api/' + ownerUUID + '/note/' +
                                                 note.trans.uuid + '/publish',
                                          refresh: getPublishUrl,
                                          params: {
                                            prefix: '/api/' + ownerUUID + '/note/',
                                            note: note }},
                                        publishNoteRegexp, payload)
        .then(function(response) {
          var propertiesToReset = {
            modified: response.result.modified,
            revision: note.revision !== undefined ? note.revision + 1 : 1
          };
          propertiesToReset.visibility = note.visibility ? note.visibility : {};
          propertiesToReset.visibility.publishedRevision = propertiesToReset.revision;
          propertiesToReset.visibility.published = response.published;
          propertiesToReset.visibility.path = path;
          propertiesToReset.visibility.licence = licence;
          propertiesToReset.visibility.publicUi = payload.publicUi;
          propertiesToReset.visibility.shortId = response.shortId;

          // Add properties to persistent values and update note
          ItemLikeService.updateObjectProperties(note, propertiesToReset);
          updateNote(note, ownerUUID, undefined, propertiesToReset);
          deferred.resolve(response);
        },function(error){
          deferred.reject(error);
        });
      }
      return deferred.promise;
    },
    unpublishNote: function(note) {
      function getUnpublishUrl(params){
        return params.prefix + params.note.trans.uuid + '/unpublish';
      }

      var ownerUUID = note.trans.owner;
      // Check that note is not deleted before trying to unpublish
      var deferred = $q.defer();
      if (notes[ownerUUID].deletedNotes.findFirstObjectByKeyValue('uuid', note.trans.uuid, 'trans')) {
        deferred.reject({type: 'deleted'});
      } else {
        BackendClientService.postOnline({ value: '/api/' + ownerUUID + '/note/' +
                                                 note.trans.uuid + '/unpublish',
                                          refresh: getUnpublishUrl,
                                          params: {
                                            prefix: '/api/' + ownerUUID + '/note/',
                                            note: note }},
                                        unpublishNoteRegexp)
        .then(function(response) {
          var propertiesToReset = {
            modified: response.modified
          };
          propertiesToReset.visibility = note.visibility ? note.visibility : {};
          propertiesToReset.visibility.published = undefined;
          propertiesToReset.visibility.publishedRevision = undefined;
          // Add properties to persistent values and update note
          ItemLikeService.updateObjectProperties(note, propertiesToReset);
          updateNote(note, ownerUUID, undefined, propertiesToReset);
          deferred.resolve(response);
        },function(error){
          deferred.reject(error);
        });
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
        ItemLikeService.persistAndReset(notes[newUUID].activeNotes, NOTE_TYPE, newUUID, noteFieldInfos);
        ItemLikeService.persistAndReset(notes[newUUID].archivedNotes, NOTE_TYPE, newUUID, noteFieldInfos);
        ItemLikeService.persistAndReset(notes[newUUID].deletedNotes, NOTE_TYPE, newUUID, noteFieldInfos);
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
            notes[ownerUUID].activeNotes[i].trans.list.trans.uuid === list.trans.uuid)
        {
          return true;
        }
      }
      for (i = 0; i < notes[ownerUUID].archivedNotes.length; i++){
        if (notes[ownerUUID].archivedNotes[i].trans.list &&
            notes[ownerUUID].archivedNotes[i].trans.list.trans.uuid === list.trans.uuid)
        {
          return true;
        }
      }
    },
    resetOwnerData: function(ownerUUID){
      if (notes[ownerUUID]){
        ItemLikeService.destroyPersistentItems(
          notes[ownerUUID].activeNotes.concat(
            notes[ownerUUID].deletedNotes).concat(notes[ownerUUID].archivedNotes));
        initializeArrays(ownerUUID);
      }
    },
    noteFieldInfos: noteFieldInfos,
    // Regular expressions for note requests
    putNewNoteRegex: ItemLikeService.getPutNewRegex(NOTE_TYPE),
    putExistingNoteRegex: ItemLikeService.getPutExistingRegex(NOTE_TYPE),
    deleteNoteRegex: ItemLikeService.getDeleteRegex(NOTE_TYPE),
    undeleteNoteRegex: ItemLikeService.getUndeleteRegex(NOTE_TYPE),
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
    previewNoteRegex : previewNoteRegexp,
    publishNoteRegex : publishNoteRegexp,
    unpublishNoteRegex: unpublishNoteRegexp
  };
}

NotesService['$inject'] = ['$q', 'ArrayService', 'BackendClientService', 'ExtendedItemService',
'ItemLikeService', 'ListsService', 'TagsService', 'UISessionService', 'UserSessionService'];
angular.module('em.notes').factory('NotesService', NotesService);
