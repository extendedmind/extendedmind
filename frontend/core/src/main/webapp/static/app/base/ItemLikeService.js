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

 function ItemLikeService($q, BackendClientService, PersistentStorageService, UserSessionService,
                          UUIDService) {

  function getDefaultFieldInfos(){
    return [
    'uuid',
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
      if (angular.isObject(fieldInfos[i])){
        if (fieldInfos[i].isEdited(item, ownerUUID, compareValues)){
          return true;
        }
      }else if (!compareValues){
        if (item.mod && item.mod.hasOwnProperty(fieldInfos[i])){
          if (item.mod[fieldInfos[i]] !== item.trans[fieldInfos[i]]){
            return true;
          }
        }else if (item[fieldInfos[i]] !== item.trans[fieldInfos[i]]){
          return true;
        }
      }else{
        // Use compare values to do the isEdited comparison
        if (item.mod && item.mod.hasOwnProperty(fieldInfos[i]) &&
            item.mod[fieldInfos[i]] !== compareValues[fieldInfos[i]])
        {
          return true;
        }
      }
    }
  }

  function getEditedFieldInfos(item, itemType, ownerUUID, fieldInfos){
    var editedFieldInfos = [];
    for (var i=0, len=fieldInfos.length; i<len; i++){
      if (angular.isObject(fieldInfos[i])){
        // Custom field overrides all
        if (fieldInfos[i].isEdited(item, ownerUUID)){
          editedFieldInfos.push(fieldInfos[i]);
        }
      }else if (item.mod && item.mod.hasOwnProperty(fieldInfos[i])) {
        if (item.mod[fieldInfos[i]] !== item.trans[fieldInfos[i]]){
          // This field has been modified, and the modification does not match
          editedFieldInfos.push(fieldInfos[i]);
        }
      }else if (item[fieldInfos[i]] !== item.trans[fieldInfos[i]]){
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
        if (item.trans['title'] === undefined || item.trans['title'].length === 0){
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

  function copyModToPersistent(item, ownerUUID, fieldInfos) {
    for (var i=0, len=fieldInfos.length; i<len; i++){
      var fieldName = angular.isObject(fieldInfos[i]) ? fieldInfos[i].name : fieldInfos[i];
      if (item.mod && item.mod.hasOwnProperty(fieldName)) {
        // OBJECT
        if (angular.isObject(item.mod[fieldName])) {
          // NOTE: Should this fail, there is something wrong with the data model
          // From http://stackoverflow.com/a/1144249
          if (JSON.stringify(item[fieldName]) !== JSON.stringify(item.mod[fieldName])) {
            // This field has been modified, and the modification does not match
            item[fieldName] = item.mod[fieldName];
          }
        }
        // SINGLE VALUE
        else if (item.mod[fieldName] !== item[fieldName]) {
          // This field has been modified, and the modification does not match
          item[fieldInfos[i]] = item.mod[fieldInfos[i]];
        }
      }
    }
    // Finally delete mod as all modifications have been persisted
    delete item.mod;
  }

  function resetTrans(item, itemType, ownerUUID, fieldInfos){
    if (!item.trans) item.trans = {};
    if (item.trans.itemType !== itemType) item.trans.itemType = itemType;

    for (var i=0, len=fieldInfos.length; i<len; i++){
      if (angular.isObject(fieldInfos[i])){
        // Custom reset method overrides
        fieldInfos[i].resetTrans(item, ownerUUID);
      }else if (item.mod && item.mod[fieldInfos[i]] !== undefined){
        // Priorize value from modified object
        item.trans[fieldInfos[i]] = item.mod[fieldInfos[i]];
      }else if (item[fieldInfos[i]] !== undefined){
        // If no modified value found, use persistent value
        item.trans[fieldInfos[i]] = item[fieldInfos[i]];
      }else if (item.trans[fieldInfos[i]] !== undefined){
        // There are no modified nor persistent value for this field, but it is in trans,
        // delete it from trans
        delete item.trans[fieldInfos[i]];
      }
    }
    return item;
  }

  function createTransportItem(item, ownerUUID, fieldInfos){
    var transportItem = {};
    for (var i=0, len=fieldInfos.length; i<len; i++){
      if (fieldInfos[i] !== 'uuid' && fieldInfos[i] !== 'created' && fieldInfos[i] !== 'deleted' &&
          !(angular.isObject(fieldInfos[i]) && fieldInfos[i].skipTransport))
      {
        var fieldName = angular.isObject(fieldInfos[i]) ? fieldInfos[i].name : fieldInfos[i];
        if (item.mod && item.mod.hasOwnProperty(fieldName) &&
            item.mod[fieldName] !== undefined)
        {
          transportItem[fieldName] = item.mod[fieldName];
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
          if (properties[property] === undefined && object[property])
            delete object[property];
          else
            object[property] = properties[property];
        }
      }
    }
  }

  function prepareTransport(item, itemType, ownerUUID, fieldInfos){
    copyEditedFieldsToMod(item, itemType, ownerUUID, fieldInfos);
    return createTransportItem(item, ownerUUID, fieldInfos);
  }

  function destroyModAndReset(item, itemType, ownerUUID, fieldInfos){
    delete item.mod;
    return resetTrans(item, itemType, ownerUUID, fieldInfos);
  }

  return {
    isEdited: function(item, itemType, ownerUUID, fieldInfos, compareValues) {
      return isEdited(item, itemType, ownerUUID, fieldInfos, compareValues);
    },
    getFieldInfos: function(additionalFieldInfos){
      var fieldInfos = getDefaultFieldInfos();
      if (additionalFieldInfos){
        return fieldInfos.concat(additionalFieldInfos);
      }
      return fieldInfos;
    },
    updateObjectProperties: function(object, properties){
      updateObjectProperties(object, properties);
    },
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
    resetTrans: function(item, itemType, ownerUUID, fieldInfos){
      return resetTrans(item, itemType, ownerUUID, fieldInfos);
    },
    evaluateMod: function(databaseItem, item, itemType, ownerUUID, fieldInfos){
      if (isEdited(item, itemType, ownerUUID, fieldInfos, databaseItem)){
        // Modified value, add mod to database item as it is about to get persisted
        databaseItem.mod = item.mod;
      }
    },
    persistAndReset: function(data, itemType, ownerUUID, fieldInfos, oldUUID){
      function doResetAndPersist(item, itemType, ownerUUID, fieldInfos){
        if (UserSessionService.isOfflineEnabled()){
          if (oldUUID){
            PersistentStorageService.persistWithNewUUID(oldUUID, createPersistableItem(item), itemType,
                                                        ownerUUID);
          }else{
            PersistentStorageService.persist(createPersistableItem(item), itemType, ownerUUID);
          }
        }
        resetTrans(item, itemType, ownerUUID, fieldInfos);
      }
      if (angular.isArray(data)){
        for (var i=0, len=data.length; i<len; i++){
          doResetAndPersist(data[i], itemType, ownerUUID, fieldInfos);
        }
      }else if (data){
        doResetAndPersist(data, itemType, ownerUUID, fieldInfos);
      }
      return data;
    },
    remove: function(uuid){
      if (UserSessionService.isOfflineEnabled()){
        return PersistentStorageService.destroy(uuid);
      }
    },
    copyModToPersistent: function(item, ownerUUID, fieldInfos){
      return copyModToPersistent(item, ownerUUID, fieldInfos);
    },
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
        var transportItem = prepareTransport(item, itemType, ownerUUID, fieldInfos);
        var params, fakeTimestamp;

        if (item.trans.uuid) {

          /////////////////////////
          // Existing item
          /////////////////////////

          // TODO: implement offline for lists and tags and remove the two latter conditions!
          if (UserSessionService.isOfflineEnabled() && itemType !== 'list' && itemType !== 'tag') {
            // Push to offline buffer
            params = {type: itemType, owner: ownerUUID, uuid: item.trans.uuid, lastReplaceable: true};
            fakeTimestamp = BackendClientService.generateFakeTimestamp();
            BackendClientService.put('/api/' + params.owner + '/'+ itemType + '/' + item.trans.uuid,
                                     this.getPutExistingRegex(itemType), params, transportItem,
                                     fakeTimestamp);
            updateObjectProperties(item.mod, {modified: fakeTimestamp});
            deferred.resolve('existing');
          } else {
            // Online
            BackendClientService.putOnline('/api/' + ownerUUID + '/'+ itemType + '/' + item.trans.uuid,
                                           this.getPutExistingRegex(itemType), transportItem)
            .then(function(result) {
              updateObjectProperties(item, result.data);
              copyModToPersistent(item, ownerUUID, fieldInfos);
              deferred.resolve('existing');
            },function(error){
              destroyModAndReset(item, itemType, ownerUUID, fieldInfos);
              deferred.reject(error);
            });
          }
        } else {
          /////////////////////////
          // New item
          /////////////////////////

          // TODO: implement offline for lists and tags and remove the two latter conditions!
          if (UserSessionService.isOfflineEnabled() && itemType !== 'list' && itemType !== 'tag') {
            // Push to offline queue with fake UUID
            var fakeUUID = UUIDService.generateFakeUUID();
            fakeTimestamp = BackendClientService.generateFakeTimestamp();
            params = {type: itemType, owner: ownerUUID, fakeUUID: fakeUUID};
            BackendClientService.put('/api/' + params.owner + '/'+ itemType,
                                     this.getPutNewRegex(itemType), params, transportItem, fakeTimestamp);
            updateObjectProperties(item.mod, {uuid: fakeUUID, modified: fakeTimestamp,
              created: fakeTimestamp});
            deferred.resolve('new');
          } else {
            // Online
            BackendClientService.putOnline('/api/' + ownerUUID + '/'+ itemType,
                                           this.getPutNewRegex(itemType), transportItem)
            .then(function(result) {
              updateObjectProperties(item, result.data);
              copyModToPersistent(item, ownerUUID, fieldInfos);

              deferred.resolve('new');
            },function(error){
              destroyModAndReset(item, itemType, ownerUUID, fieldInfos);
              deferred.reject(error);
            });
          }
        }
      }
      return deferred.promise;
    },
    processDelete: function(item, itemType, ownerUUID, fieldInfos){
      var deferred = $q.defer();

      // TODO: implement offline for lists and tags and remove the two latter conditions!
      if (UserSessionService.isOfflineEnabled() && itemType !== 'list' && itemType !== 'tag') {
        // Offline
        var params = {
          type: itemType, owner: ownerUUID, uuid: item.trans.uuid,
          reverse: {
            method: 'post',
            url: '/api/' + ownerUUID + '/' + itemType + '/' + item.trans.uuid + '/undelete'
          }, lastReplaceable: true
        };
        var fakeTimestamp = BackendClientService.generateFakeTimestamp();
        BackendClientService.deleteOffline('/api/' + ownerUUID + '/' + itemType +'/' + item.trans.uuid,
                                           this.getDeleteRegex(itemType), params, undefined, fakeTimestamp);
        if (!item.mod) item.mod = {};
        updateObjectProperties(item.mod, {modified: fakeTimestamp, deleted: fakeTimestamp});
        deferred.resolve();
      } else {
        // Online
        BackendClientService.deleteOnline('/api/' + ownerUUID + '/' + itemType +'/' + item.trans.uuid,
                                          this.getDeleteRegex(itemType))
        .then(function(result) {
          item.deleted = result.data.deleted;
          updateObjectProperties(item, result.data.result);
          if (UserSessionService.isOfflineEnabled()){
            PersistentStorageService.persist(createPersistableItem(item), itemType, ownerUUID);
          }
          resetTrans(item, itemType, ownerUUID, fieldInfos);
          deferred.resolve();
        },function(error){
          deferred.reject(error);
        });
      }
      return deferred.promise;
    },
    undelete: function(item, itemType, ownerUUID, fieldInfos){
      var deferred = $q.defer();
      // TODO: implement offline for lists and tags and remove the two latter conditions!
      if (UserSessionService.isOfflineEnabled() && itemType !== 'list' && itemType !== 'tag') {
        // Offline
        var params = {type: itemType, owner: ownerUUID, uuid: item.trans.uuid, lastReplaceable: true};
        var fakeTimestamp = BackendClientService.generateFakeTimestamp();
        BackendClientService.post('/api/' + ownerUUID + '/' + itemType +'/' + item.trans.uuid + '/undelete',
                                  this.getUndeleteRegex(itemType), params, undefined, fakeTimestamp);
        if (!item.mod) item.mod = {};
        if (item.mod.deleted) delete item.mod.deleted;
        updateObjectProperties(item.mod, {modified: fakeTimestamp});
        PersistentStorageService.persist(createPersistableItem(item), itemType, ownerUUID);
        resetTrans(item, itemType, ownerUUID, fieldInfos);
        deferred.resolve();
      } else {
        // Online
        BackendClientService.postOnline('/api/' + ownerUUID + '/' + itemType +'/' +
                                        item.trans.uuid + '/undelete',
                                        this.getUndeleteRegex(itemType))
        .then(function(result) {
          delete item.deleted;
          updateObjectProperties(item, result.data);
          if (UserSessionService.isOfflineEnabled()){
            PersistentStorageService.persist(createPersistableItem(item), itemType, ownerUUID);
          }
          resetTrans(item, itemType, ownerUUID, fieldInfos);
          deferred.resolve();
        },function(error){
          deferred.reject(error);
        });
      }
      return deferred.promise;
    },
    // Regexp helper functions
    getPutNewRegex: function(itemType){
      return new RegExp(BackendClientService.apiPrefixRegex.source +
                        BackendClientService.uuidRegex.source +
                        '/' + itemType);
    },
    getPutExistingRegex: function(itemType){
      return new RegExp(BackendClientService.apiPrefixRegex.source +
                        BackendClientService.uuidRegex.source +
                        '/' + itemType + '/' +
                        BackendClientService.uuidRegex.source);
    },
    getDeleteRegex: function(itemType){
      return new RegExp(BackendClientService.apiPrefixRegex.source +
                        BackendClientService.uuidRegex.source +
                        '/' + itemType + '/' +
                        BackendClientService.uuidRegex.source);
    },
    getUndeleteRegex: function(itemType){
      return new RegExp(BackendClientService.apiPrefixRegex.source +
                        BackendClientService.uuidRegex.source +
                        '/' + itemType + '/' +
                        BackendClientService.uuidRegex.source +
                        BackendClientService.undeleteRegex.source);
    },
  };
}
ItemLikeService['$inject'] = ['$q', 'BackendClientService', 'PersistentStorageService', 'UserSessionService',
  'UUIDService'];
angular.module('em.main').factory('ItemLikeService', ItemLikeService);
