/* Copyright 2013-2015 Extended Mind Technologies Oy
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

 function ItemLikeService($q, BackendClientService, PersistentStorageService, UserSessionService,
                          UUIDService) {

  function getDefaultFieldInfos(){
    return [
    'uuid',
    'id',
    'title',
    'description',
    'link',
    'created',
    'modified',
    'deleted'
    ];
  }

  function isEdited(item, itemType, ownerUUID, fieldInfos, compareValues){
    if (item.trans.itemType !== itemType){
      return true;
    }
    for (var i=0, len=fieldInfos.length; i<len; i++){
      var fieldName = angular.isObject(fieldInfos[i]) ? fieldInfos[i].name : fieldInfos[i];

      if (angular.isObject(fieldInfos[i])){
        if (fieldInfos[i].isEdited(item, ownerUUID, compareValues)){
          return true;
        }
      }else if (!compareValues){
        if (item.mod && item.mod.hasOwnProperty(fieldInfos[i])){
          if (item.mod[fieldName] !== item.trans[fieldName]){
            return true;
          }
        }else if (item[fieldName] !== item.trans[fieldName]){
          return true;
        }
      }else{
        // Use compare values to do the isEdited comparison
        if (item.mod && item.mod.hasOwnProperty(fieldName) &&
            item.mod[fieldName] !== compareValues[fieldName])
        {
          return true;
        }
      }
    }
  }

  function getEditedFieldInfos(item, itemType, ownerUUID, fieldInfos){
    var editedFieldInfos = [];
    for (var i=0, len=fieldInfos.length; i<len; i++){
      var fieldName = angular.isObject(fieldInfos[i]) ? fieldInfos[i].name : fieldInfos[i];

      if (angular.isObject(fieldInfos[i])){
        // Custom field overrides all
        if (fieldInfos[i].isEdited(item, ownerUUID)){
          editedFieldInfos.push(fieldInfos[i]);
        }
      }else if (item.mod && item.mod.hasOwnProperty(fieldName)) {
        if (item.mod[fieldName] !== item.trans[fieldName]){
          // This field has been modified, and the modification does not match
          editedFieldInfos.push(fieldInfos[i]);
        }
      }else if (item[fieldName] !== item.trans[fieldName]){
        // Persistent value does not match
        editedFieldInfos.push(fieldInfos[i]);
      }
    }
    return editedFieldInfos;
  }

  function validate(item, ownerUUID, fieldInfos){
    var validationErrors = [];
    for (var i=0, len=fieldInfos.length; i<len; i++){
      if (angular.isObject(fieldInfos[i])){
        // Custom field overrides all
        if (fieldInfos[i].validate){
          var validationError = fieldInfos[i].validate(item, ownerUUID);
          if (validationError) validationErrors.push(validationError);
        }
      }else if (fieldInfos[i] === 'title'){
        if (item.trans['title'] === undefined || item.trans['title'].length === 0){
          validationErrors.push('title is mandatory');
        }else if (item.trans['title'].length > 128){
          validationErrors.push('title can not be more than 128 characters');
        }
      }else if (fieldInfos[i] === 'description' && item.trans['description'] !== undefined &&
                item.trans['description'].length > 1024){
        validationErrors.push('description can not be more than 1024 characters');
      }
    }
    return validationErrors;
  }

  function copyEditedFieldsToMod(item, itemType, ownerUUID, fieldInfos){
    var editedFieldInfos = getEditedFieldInfos(item, itemType, ownerUUID, fieldInfos);

    if (editedFieldInfos && editedFieldInfos.length){
      if (!item.mod) item.mod = {};
      for(var i=0, len=editedFieldInfos.length; i<len; i++){
        if (angular.isObject(editedFieldInfos[i]) && editedFieldInfos[i].copyTransToMod){
          editedFieldInfos[i].copyTransToMod(item, ownerUUID);
        }else{
          item.mod[editedFieldInfos[i]] = item.trans[editedFieldInfos[i]];
        }
      }
      return true;
    }
  }

  function copyToPersistent(origin, item, ownerUUID, fieldInfos, includeNonExistent){
    if (origin){
      for (var i=0, len=fieldInfos.length; i<len; i++){
        var fieldName = angular.isObject(fieldInfos[i]) ? fieldInfos[i].name : fieldInfos[i];

        if (includeNonExistent || origin.hasOwnProperty(fieldName)) {
          // When non existent values are to be seen as deleted, delete the value if it is missing
          if (includeNonExistent && !origin.hasOwnProperty(fieldName) && item.hasOwnProperty(fieldName)){
            delete item[fieldName];
          }
          // OBJECT
          else if (angular.isObject(origin[fieldName])) {
            // NOTE: Should this fail, there is something wrong with the data model
            // From http://stackoverflow.com/a/1144249
            if (JSON.stringify(item[fieldName]) !== JSON.stringify(origin[fieldName])) {
              // This field has been modified, and the modification does not match
              item[fieldName] = origin[fieldName];
            }
          }
          // SINGLE VALUE
          else if (item[fieldName] !== origin[fieldName]) {
            if (includeNonExistent && !origin.hasOwnProperty(fieldName) && item.hasOwnProperty(fieldName)){
              delete item[fieldName];
            }else {
              // This field has been modified, and the modification does not match
              item[fieldName] = origin[fieldName];
            }
          }
        }
      }
    }
  }

  function copyModToPersistent(item, ownerUUID, fieldInfos) {
    if (item.hasOwnProperty('mod')){
      copyToPersistent(item.mod, item, ownerUUID, fieldInfos);
    }
  }

  /*
   * @description
   *
   * Resets transient values of the item.
   *
   * @param {Object} item Item whose trans will be resetted
   * @param {string} itemType The type of the `item`.
   * @param {ownerUUID} ownerUUID
   * @param {Array} fieldInfos Field infos of item to iterate over.
   * @param {Object|Array} propertiesToReset Properties to iterate over.
   * @returns {Object} Reference to `item`.
   */
  function resetTrans(item, itemType, ownerUUID, fieldInfos, propertiesToReset){
    if (!item.trans) item.trans = {};
    item.trans.itemType = itemType;
    item.trans.owner = ownerUUID;

    for (var i=0, len=fieldInfos.length; i<len; i++){
      var fieldName = angular.isObject(fieldInfos[i]) ? fieldInfos[i].name : fieldInfos[i];

      if (!propertiesToReset ||
          (angular.isObject(propertiesToReset) && propertiesToReset.hasOwnProperty(fieldName)) ||
          (angular.isArray(propertiesToReset) && propertiesToReset.indexOf(fieldName) !== -1)) {
        if (angular.isObject(fieldInfos[i])){
          // Custom reset method overrides
          fieldInfos[i].resetTrans(item, ownerUUID);
        }else if (item.mod && item.mod.hasOwnProperty(fieldName)) {
          // Priorize value from modified object
          item.trans[fieldName] = item.mod[fieldName];
        }else if (item[fieldName] !== undefined){
          // If no modified value found, use persistent value
          item.trans[fieldName] = item[fieldName];
        }else if (item.trans[fieldName] !== undefined){
          // There are no modified nor persistent value for this field, but it is in trans,
          // delete it from trans
          delete item.trans[fieldName];
        }
      }
    }
    return item;
  }

  function createTransportItem(item, fieldInfos){
    var transportItem = {};
    for (var i=0, len=fieldInfos.length; i<len; i++){
      if (fieldInfos[i] !== 'uuid' && fieldInfos[i] !== 'created' && fieldInfos[i] !== 'deleted' &&
          !(angular.isObject(fieldInfos[i]) && fieldInfos[i].skipTransport))
      {
        var fieldName = angular.isObject(fieldInfos[i]) ? fieldInfos[i].name : fieldInfos[i];
        if (item.mod && item.mod.hasOwnProperty(fieldName)) {
          if (item.mod[fieldName] !== undefined) {
            transportItem[fieldName] = item.mod[fieldName];
          }
        }else if (item[fieldName] !== undefined) {
          transportItem[fieldName] = item[fieldName];
        }
      }
    }
    return transportItem;
  }

  function createPersistableItem(item){
    var persistItem = {};
    // Copy every field except trans to persisted value
    for (var property in item){
      if (item.hasOwnProperty(property) && property !== 'trans'){
        persistItem[property] = item[property];
      }
    }
    return persistItem;
  }

  function updateObjectProperties(object, properties){
    if (properties && object){
      for (var property in properties){
        if (properties.hasOwnProperty(property)){
          object[property] = properties[property];
        }
      }
    }
  }

  function prepareTransport(item, itemType, ownerUUID, fieldInfos){
    copyEditedFieldsToMod(item, itemType, ownerUUID, fieldInfos);
    return createTransportItem(item, fieldInfos);
  }

  return {
    processOwners: function(userUUID, collectives, sharedLists, itemsMap, initializeArraysFn){
      initializeArraysFn(userUUID);
      if (collectives){
        for (var collectiveUUID in collectives){
          initializeArraysFn(collectiveUUID);
        }
      }
      if (sharedLists){
        for (var shareOwnerUUID in sharedLists){
          initializeArraysFn(shareOwnerUUID);
        }
      }
      // Return all owners that are in the itemsMap but are not included in the given owner list
      var extraOwners = [];
      if (itemsMap){
        for (var ownerUUID in itemsMap){
          if (itemsMap.hasOwnProperty(ownerUUID)){
            if (ownerUUID !== userUUID){
              // Not the user, check if not in collectives
              if (collectives && collectives[ownerUUID] &&
                  (collectives[ownerUUID][2] === false || UserSessionService.getUserType() === 0)){
                BackendClientService.notifyOwnerAccess(ownerUUID, collectives[ownerUUID][1]);
              }else{
                // Not in collectives, are they in shared lists?
                if (sharedLists && sharedLists[ownerUUID]){
                  // In shared lists, notify access using listUUID as a necessary fragment in the data
                  // field of the request
                  for (var listUUID in sharedLists[ownerUUID][1]){
                    BackendClientService.notifyOwnerAccess(ownerUUID, sharedLists[ownerUUID][1][listUUID][1],
                                                           listUUID);
                  }
                }else{
                  // Not in shared lists either, push this owner to return array and notify no access
                  extraOwners.push(ownerUUID);
                  BackendClientService.notifyOwnerAccess(ownerUUID, undefined);
                }
              }
            }
          }
        }
      }
      return extraOwners;
    },
    isEdited: isEdited,
    getFieldInfos: function(additionalFieldInfos){
      var fieldInfos = getDefaultFieldInfos();
      if (additionalFieldInfos){
        return fieldInfos.concat(additionalFieldInfos);
      }
      return fieldInfos;
    },
    updateObjectProperties: updateObjectProperties,
    copyEditedFieldsToMod: copyEditedFieldsToMod,
    getNew: function(trans, itemType, ownerUUID, fieldInfos) {
      var newItem = resetTrans({}, itemType, ownerUUID, fieldInfos);
      if (trans){
        for (var property in trans){
          if (trans.hasOwnProperty(property)){
            newItem.trans[property] = trans[property];
          }
        }
      }
      return newItem;
    },
    resetTrans: function(data, itemType, ownerUUID, fieldInfos){
      if (angular.isArray(data)){
        for (var i=0, len=data.length; i<len; i++){
          resetTrans(data[i], itemType, ownerUUID, fieldInfos);
        }
      }else if (data){
        resetTrans(data, itemType, ownerUUID, fieldInfos);
      }
      return data;
    },
    evaluateMod: function(databaseItem, item, itemType, ownerUUID, fieldInfos){
      if (item.mod && !isEdited(item, itemType, ownerUUID, fieldInfos, databaseItem)){
        // .mod matches the database, copy values over to persistent and delete mod
        copyModToPersistent(item, ownerUUID, fieldInfos);
        delete item.mod;
        return true;
      }else{
        // Either there is no modifications or item modifications haven't reached the backend,
        // make persistent values match the database
        copyToPersistent(databaseItem, item, ownerUUID, fieldInfos, true);

        if (item.mod && !BackendClientService.isUUIDInQueue(databaseItem.uuid)){
          // item UUID is not in queue, so we just remove mod as otherwise it would be unsycned forever
          delete item.mod;
        }
        return false;
      }
    },
    resetAndPruneOldDeleted: function(itemsArray, itemType, ownerUUID, fieldInfos){
      function destroyIfDeletedLimitReached(item){
        if (item.trans.deleted){
          if (item.trans.deleted < (Date.now() - UserSessionService.getDeletedBeforeDestroyedDuration())){
            if (UserSessionService.isPersistentStorageEnabled()){
              PersistentStorageService.destroy(item.trans.uuid);
            }
            return true;
          }
        }
      }
      if (itemsArray && itemsArray.length){
        this.resetTrans(itemsArray, itemType, ownerUUID, fieldInfos);
        for (var i=itemsArray.length-1; i>=0; i--){
          if (destroyIfDeletedLimitReached(itemsArray[i])){
            itemsArray.splice(i, 1);
          }
        }
      }
      return itemsArray;
    },
    persistAndReset: function(data, itemType, ownerUUID, fieldInfos, oldUUID, propertiesToReset){
      if (angular.isArray(data) && !oldUUID){
        var i;
        if (UserSessionService.isPersistentStorageEnabled()){
          // First create persistable items in an array and then batch persist
          var itemsToPersist = [];
          for (i=0; i<data.length; i++){
            itemsToPersist.push(createPersistableItem(data[i]));
          }
          PersistentStorageService.persist(itemsToPersist, itemType, ownerUUID);
        }
        for (i=0; i<data.length; i++){
          resetTrans(data[i], itemType, ownerUUID, fieldInfos, propertiesToReset);
        }
      }else if (data){
        if (UserSessionService.isPersistentStorageEnabled()){
          var itemToPersist = createPersistableItem(data);
          if (oldUUID){
            PersistentStorageService.persistWithNewUUID(oldUUID, itemToPersist, itemType,
                                                        ownerUUID);
          }else{
            PersistentStorageService.persist(itemToPersist, itemType, ownerUUID);
          }
        }
        resetTrans(data, itemType, ownerUUID, fieldInfos, propertiesToReset);
      }
      return data;
    },
    remove: function(uuid){
      if (UserSessionService.isPersistentStorageEnabled()){
        return PersistentStorageService.destroy(uuid);
      }
    },
    createTransportItem: createTransportItem,
    prepareTransport: prepareTransport,
    // Returns promise which returns 'new', 'existing', 'unmodified', or failure on failed save because
    // data is invalid
    save: function(item, itemType, ownerUUID, fieldInfos){
      var deferred = $q.defer();
      var validationErrors = validate(item, ownerUUID, fieldInfos);

      if (validationErrors.length){
        deferred.reject({type: 'validation', value: validationErrors});
      }else if (!isEdited(item, itemType, ownerUUID, fieldInfos)){
        // When item is not edited, just resolve without giving an item as parameter to indicate
        // nothing was actually saved
        deferred.resolve('unmodified');
      } else {
        var params, fakeTimestamp, transportItem;

        if (item.trans.uuid) {
          transportItem = prepareTransport(item, itemType, ownerUUID, fieldInfos);

          /////////////////////////
          // Existing item
          /////////////////////////

          // Push to offline buffer
          params = {type: itemType, owner: ownerUUID, uuid: item.trans.uuid, lastReplaceable: true};
          fakeTimestamp = BackendClientService.generateFakeTimestamp();
          BackendClientService.putOffline('/api/' + params.owner + '/'+ itemType + '/' + item.trans.uuid,
                                   this.getPutExistingRegex(itemType), params, transportItem,
                                   fakeTimestamp)
          .then(function() {
            updateObjectProperties(item.mod, {modified: fakeTimestamp});
            deferred.resolve('existing');
          });
        } else {
          /////////////////////////
          // New item
          /////////////////////////

          // Push to offline queue with fake UUID, set meaningful part of fakeUUID as item id
          var fakeUUID = UUIDService.generateFakeUUID();
          item.trans.id = UUIDService.getShortIdFromFakeUUID(fakeUUID);
          transportItem = prepareTransport(item, itemType, ownerUUID, fieldInfos);

          fakeTimestamp = BackendClientService.generateFakeTimestamp();
          params = {type: itemType, owner: ownerUUID, fakeUUID: fakeUUID};
          BackendClientService.putOffline('/api/' + params.owner + '/'+ itemType,
                                   this.getPutNewRegex(itemType), params, transportItem, fakeTimestamp)
          .then(function() {
            updateObjectProperties(item.mod, {uuid: fakeUUID, modified: fakeTimestamp,
              created: fakeTimestamp});
            deferred.resolve('new');
          });
        }
      }
      return deferred.promise;
    },
    processDelete: function(item, itemType, ownerUUID, fieldInfos, data){
      var deferred = $q.defer();
      var params = {
        type: itemType, owner: ownerUUID, uuid: item.trans.uuid,
        reverse: {
          method: 'post',
          url: '/api/' + ownerUUID + '/' + itemType + '/' + item.trans.uuid + '/undelete'
        }, lastReplaceable: true
      };
      var fakeTimestamp = BackendClientService.generateFakeTimestamp();
      BackendClientService.deleteOffline('/api/' + ownerUUID + '/' + itemType +'/' + item.trans.uuid,
                                         this.getDeleteRegex(itemType), params, data, fakeTimestamp)
      .then(function() {
        if (!item.mod) item.mod = {};
        updateObjectProperties(item.mod, {modified: fakeTimestamp, deleted: fakeTimestamp});
        deferred.resolve();
      });
      return deferred.promise;
    },
    undelete: function(item, itemType, ownerUUID, fieldInfos, data){
      var deferred = $q.defer();
      var params = {type: itemType, owner: ownerUUID, uuid: item.trans.uuid, lastReplaceable: true};
      var fakeTimestamp = BackendClientService.generateFakeTimestamp();
      BackendClientService.postOffline('/api/' + ownerUUID + '/' + itemType +'/' + item.trans.uuid +
                                       '/undelete',
                                       this.getUndeleteRegex(itemType), params, data, fakeTimestamp)
      .then(function() {
        if (!item.mod) item.mod = {};
        updateObjectProperties(item.mod, {modified: fakeTimestamp, deleted: undefined});
        if (UserSessionService.isPersistentStorageEnabled()){
          PersistentStorageService.persist(createPersistableItem(item), itemType, ownerUUID);
        }
        resetTrans(item, itemType, ownerUUID, fieldInfos);
        deferred.resolve();
      });
      return deferred.promise;
    },
    destroyPersistentItems: function(items){
      if (UserSessionService.isPersistentStorageEnabled()){
        var i;
        if (items && items.length){
          for (i=0; i<items.length; i++){
            PersistentStorageService.destroy(items[i].trans.uuid);
          }
        }
      }
    },
    // Regexp helper functions
    getPutNewRegex: function(itemType){
      return new RegExp('^' +
                        BackendClientService.apiPrefixRegex.source +
                        BackendClientService.uuidRegex.source +
                        '/' + itemType +
                        '$');
    },
    getPutExistingRegex: function(itemType){
      return new RegExp('^' +
                        BackendClientService.apiPrefixRegex.source +
                        BackendClientService.uuidRegex.source +
                        '/' + itemType + '/' +
                        BackendClientService.uuidRegex.source +
                        '$');
    },
    getDeleteRegex: function(itemType){
      return new RegExp('^' +
                        BackendClientService.apiPrefixRegex.source +
                        BackendClientService.uuidRegex.source +
                        '/' + itemType + '/' +
                        BackendClientService.uuidRegex.source +
                        '$');
    },
    getUndeleteRegex: function(itemType){
      return new RegExp('^' +
                        BackendClientService.apiPrefixRegex.source +
                        BackendClientService.uuidRegex.source +
                        '/' + itemType + '/' +
                        BackendClientService.uuidRegex.source +
                        BackendClientService.undeleteRegex.source +
                        '$');
    }
  };
}
ItemLikeService['$inject'] = ['$q', 'BackendClientService', 'PersistentStorageService', 'UserSessionService',
'UUIDService'];
angular.module('em.main').factory('ItemLikeService', ItemLikeService);
