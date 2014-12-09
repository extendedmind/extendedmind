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

 function ItemLikeService($q, BackendClientService, PersistentStorageService, UserSessionService) {

  function getDefaultFieldInfos(){
    return ['uuid',
            'title',
            'description',
            'link',
            'created',
            'modified',
            'deleted'];
  }

  function isEdited(item, ownerUUID, fieldInfos){
    for (var i=0, len=fieldInfos.length; i<len; i++){
      if (angular.isObject(fieldInfos[i])){
        if (fieldInfos[i].isEdited(item, ownerUUID)){
          return true;
        }
      }else if (item.mod && item.mod.hasOwnProperty(fieldInfos[i]) &&
        item.mod[fieldInfos[i]] !== item.trans[fieldInfos[i]]){
        return true;
      }else if (item[fieldInfos[i]] !== item.trans[fieldInfos[i]]){
        return true;
      }
    }
  }

  function getEditedFieldInfos(item, ownerUUID, fieldInfos){
    var editedFieldInfos = [];
    for (var i=0, len=fieldInfos.length; i<len; i++){
      if (angular.isObject(fieldInfos[i])){
        // Custom field overrides all
        if (fieldInfos[i].isEdited(item, ownerUUID)){
          editedFieldInfos.push(fieldInfos[i].name);
        }
      }else if (item.mod && item.mod.hasOwnProperty(fieldInfos[i]) &&
        item.mod[fieldInfos[i]] !== item.trans[fieldInfos[i]]){
        // This field has been modified, and the modification does not match
        editedFieldInfos.push(fieldInfos[i]);
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
          validationErrors('title is mandatory');
        }else if (item.trans['title'].length > 128){
          validationErrors('title can not be more than 128 characters');
        }
      }else if (fieldInfos[i] === 'description' && item.trans['description'] !== undefined &&
                item.trans['description'].length > 1024){
        validationErrors.push('description can not be more than 1024 characters');
      }
    }
    return validationErrors;
  }

  function copyEditedFieldsToMod(item, ownerUUID, fieldInfos){
    var editedFieldInfos = getEditedFieldInfos(item, ownerUUID, fieldInfos);

    if (editedFieldInfos && editedFieldInfos.length){
      if (!item.mod) item.mod = {};
      for(var i=0, len=editedFieldInfos.length; i<len; i++){
        if (angular.isObject(editedFieldInfos[i])){
          editedFieldInfos[i].copyTransToMod(item, ownerUUID);
        }else{
          item.mod[editedFieldInfos[i]] = item.trans[editedFieldInfos[i]];
        }
      }
      return true;
    }
  }

  function copyModToPersistent(item, ownerUUID, fieldInfos){
    for (var i=0, len=fieldInfos.length; i<len; i++){
      if (item.mod && item.mod.hasOwnProperty(fieldInfos[i]) &&
        item.mod[fieldInfos[i]] !== item[fieldInfos[i]]){
        // This field has been modified, and the modification does not match
        item[fieldInfos[i]] = item.mod[fieldInfos[i]];
      }
    }
    // Finally delete mod as all modifications have been persisted
    delete item.mod;
  }

  function refreshTrans(item, itemType, ownerUUID, fieldInfos){
    if (!item.trans) item.trans = {};
    if (item.trans.itemType !== itemType) item.trans.itemType = itemType;

    for (var i=0, len=fieldInfos.length; i<len; i++){
      if (angular.isObject(fieldInfos[i])){
        // Custom refresh method overrides
        fieldInfos[i].refreshTrans(item, ownerUUID);
      }else if (item.mod && item.mod[fieldInfos[i]] !== undefined){
        // Priorize value from modified object
        item.trans[fieldInfos[i]] = item.mod[fieldInfos[i]];
      }else if (item[fieldInfos[i]] !== undefined){
        // If no modified value found, use persistent value
        item.trans[fieldInfos[i]] = item[fieldInfos[i]];
      }
    }
    return item;
  }

  function createTransportItem(item, ownerUUID, fieldInfos){
    var transportItem = {};
    for (var i=0, len=fieldInfos.length; i<len; i++){
      if (angular.isObject(fieldInfos[i])){
        // Custom refresh method overrides
        transportItem[fieldInfos[i].name] = fieldInfos[i].createTransportValue(item, ownerUUID);
      }else if (fieldInfos[i] !== 'created' && fieldInfos[i] !== 'deleted'){
        if (item.mod && item.mod.hasOwnProperty(fieldInfos[i]) &&
            item.mod[fieldInfos[i]] !== undefined){
          transportItem[fieldInfos[i]] = item.mod[fieldInfos[i]];
        }else if (item[fieldInfos[i]] !== undefined) {
          transportItem[fieldInfos[i]] = item[fieldInfos[i]];
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

  function updateObjectWithSetResult(object, setResult){
    object.modified = setResult.modified;
    if (setResult.uuid) object.uuid = setResult.uuid;
    if (setResult.created) object.created = setResult.created;
  }

  return {
    getDefaultFieldInfos: function(){
      return getDefaultFieldInfos();
    },
    getEditedFieldInfos: function(item, ownerUUID, fieldInfos){
      return getEditedFieldInfos(item, ownerUUID, fieldInfos);
    },
    isEdited: function(item, ownerUUID, fieldInfos){
      return isEdited(item, ownerUUID, fieldInfos);
    },
    validate: function(item, ownerUUID, fieldInfos){
      return validate(item, ownerUUID, fieldInfos);
    },
    getNew: function(trans, itemType, ownerUUID, fieldInfos) {
      var newItem = refreshTrans({}, itemType, ownerUUID, fieldInfos);
      if (trans){
        for (var property in trans){
          if (trans.hasOwnProperty(property)){
            newItem.trans[property] = trans[property];
          }
        }
      }
      return newItem;
    },
    refreshTrans: function(item, itemType, ownerUUID, fieldInfos){
      return refreshTrans(item, itemType, ownerUUID, fieldInfos);
    },
    prepareTransport: function(item, itemType, ownerUUID, fieldInfos){
      copyEditedFieldsToMod(item, ownerUUID, fieldInfos);
      if (UserSessionService.isOfflineEnabled()){
        PersistentStorageService.persist(createPersistableItem(item), itemType, ownerUUID);
      }
      return createTransportItem(item, ownerUUID, fieldInfos);
    },
    // Returns promise which returns 'new', 'existing', 'unmodified', or failure on failed save because
    // data is invalid
    save: function(item, itemType, ownerUUID, fieldInfos){
      var deferred = $q.defer();

      var validationErrors = validate(item, ownerUUID, fieldInfos);

      if (validationErrors.length){
        deferred.reject({type: 'validation', value: validationErrors});
      }else if (!isEdited(item, ownerUUID, fieldInfos)){
        // When item is not edited, just resolve without giving an item as parameter to indicate
        // nothing was actually saved
        deferred.resolve('unmodified');
      } else {
        var transportItem = this.prepareTransport(item, itemType, ownerUUID, fieldInfos);
        if (item.uuid) {
          /////////////////////////
          // Existing item
          /////////////////////////

          if (UserSessionService.isOfflineEnabled() && itemType !== 'list' && itemType !== 'tag') {
            // Push to offline buffer
            params = {type: 'item', owner: ownerUUID, uuid: item.uuid};
            BackendClientService.put('/api/' + params.owner + '/'+ itemType + '/' + item.uuid,
                                     this.getPutExistingRegex(itemType), params, transportItem);
            updateObjectWithSetResult(item.mod, {modified: BackendClientService.generateFakeTimestamp()});
            refreshTrans(item, itemType, ownerUUID, fieldInfos);
            deferred.resolve('existing');
          } else {
            // Online
            BackendClientService.putOnline('/api/' + ownerUUID + '/'+ itemType + '/' + item.uuid,
                                           this.getPutExistingRegex(itemType), transportItem)
            .then(function(result) {
              if (result.data) {
                if (UserSessionService.isOfflineEnabled()){
                  PersistentStorageService.persistSetResult(createPersistableItem(item),
                                                            itemType, ownerUUID, result.data);
                }
                updateObjectWithSetResult(item, result.data);
                refreshTrans(item, itemType, ownerUUID, fieldInfos);
                deferred.resolve('existing');
              }
            });
          }
        } else {
          /////////////////////////
          // New item
          /////////////////////////

          if (UserSessionService.isOfflineEnabled() && itemType !== 'list' && itemType !== 'tag') {
            // Push to offline queue with fake UUID
            var fakeUUID = UUIDService.generateFakeUUID();
            params = {type: 'item', owner: ownerUUID, fakeUUID: fakeUUID};
            BackendClientService.put('/api/' + params.owner + '/'+ itemType,
                                     this.getPutNewRegex(itemType), params, transportItem);
            var fakeTimestamp = BackendClientService.generateFakeTimestamp();
            updateObjectWithSetResult(item.mod, {uuid: fakeUUID,
                                                 modified: fakeTimestamp,
                                                 created: fakeTimestamp});
            refreshTrans(item, itemType, ownerUUID, fieldInfos);
            deferred.resolve('new');
          } else {
            // Online
            BackendClientService.putOnline('/api/' + ownerUUID + '/'+ itemType,
                                           this.getPutNewRegex(itemType), transportItem)
            .then(function(result) {
              if (UserSessionService.isOfflineEnabled()){
                PersistentStorageService.persistSetResult(createPersistableItem(item),
                                                        itemType, ownerUUID, result.data);
              }
              updateObjectWithSetResult(item, result.data);
              refreshTrans(item, itemType, ownerUUID, fieldInfos);
              deferred.resolve('new');
            });
          }
        }
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
ItemLikeService['$inject'] = ['$q', 'BackendClientService', 'PersistentStorageService', 'UserSessionService'];
angular.module('em.main').factory('ItemLikeService', ItemLikeService);
