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

  return {
    createMetaItem: function(){
      return {
        'uuid': {
          type: 'id',
          maxlength: '36'
        },
        'title': {
          type: 'string',
          maxlength: '128',
        },
        'description': {
          type: 'string',
          maxlength: '1024'
        },
        'link': {
          type: 'string',
          maxlength: '512'
        },
        'created': {
          type: 'timestamp',
        },
        'modified': {
          type: 'timestamp',
        },
        'deleted': {
          type: 'timestamp',
        }
      }
    },
    isEdited: function(itemLike, ownerUUID, itemFunctions){

    },
    generateTransportableItemLike: function(item, ownerUUID, itemFunctions){

    },
    generatePersistableItemLike: function(item, ownerUUID, itemFunctions){

    },
    saveItemLike: function(item, itemType, ownerUUID, itemFunctions){
      var deferred = $q.defer();

      if (this.isEdited(item, ownerUUID, itemFunctions)){
        // When item is not edited, just resolve without giving an item as parameter to indicate
        // nothing was actually saved
        deferred.resolve();
      } else if (item.uuid) {
        // Existing item

        var transportItem = this.generateTransportItemLike(item, ownerUUID, itemFunctions);

        if (UserSessionService.isOfflineEnabled()) {
          // Push to offline buffer
          params = {type: 'item', owner: ownerUUID, uuid: item.uuid};
          BackendClientService.put('/api/' + params.owner + '/item/' + item.uuid,
                                   this.putNewItemRegex, params, item);
          item.modified = BackendClientService.generateFakeTimestamp();
          item.trans = transientProperties;
          itemFunctions.update(item, ownerUUID);
          deferred.resolve(item);
        } else {
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/item/' + item.uuid,
                                         this.putExistingItemRegex, item)
          .then(function(result) {
            if (result.data) {
              item.modified = result.data.modified;
              item.trans = transientProperties;
              itemFunctions.update(item, ownerUUID);
              deferred.resolve(item);
            }
          });
        }
      } else {
        // New item
        if (UserSessionService.isOfflineEnabled()) {
          // Push to offline queue with fake UUID
          var fakeUUID = UUIDService.generateFakeUUID();
          params = {type: 'item', owner: ownerUUID, fakeUUID: fakeUUID};
          BackendClientService.put('/api/' + params.owner + '/item',
                                   this.putNewItemRegex, params, item);
          // Use the fake uuid and a fake modified that is far enough in the to make
          // it to the end of the list
          item.uuid = fakeUUID;
          item.created = item.modified = BackendClientService.generateFakeTimestamp();
          item.trans = {itemType: 'item'};
          itemFunctions.set(item, ownerUUID);
          deferred.resolve(item);
        } else {
          // Online
          BackendClientService.putOnline('/api/' + ownerUUID + '/item',
                                         this.putNewItemRegex, item)
          .then(function(result) {
            if (result.data) {
              item.uuid = result.data.uuid;
              item.created = result.data.created;
              item.modified = result.data.modified;
              item.trans = {itemType: 'item'};
              itemFunctions.set(item, ownerUUID);
              deferred.resolve(item);
            }
          });
        }
      }
      return deferred.promise;
    },
  };
}
ItemLikeService['$inject'] = ['$q', 'BackendClientService', 'PersistentStorageService', 'UserSessionService'];
angular.module('em.main').factory('ItemLikeService', ItemLikeService);
