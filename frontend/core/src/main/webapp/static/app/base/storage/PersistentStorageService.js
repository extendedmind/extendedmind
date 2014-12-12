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

function PersistentStorageService($q) {
  var database;

  function trimUUID(uuid){
    return uuid.replace(/-/g, '');
  }
  function untrimUUID(trimmedUuid){
    return trimmedUuid.substr(0,8) + '-' +
           trimmedUuid.substr(8,4) + '-' +
           trimmedUuid.substr(12,4) + '-' +
           trimmedUuid.substr(16,4) + '-' +
           trimmedUuid.substr(20,12);
  }

  function itemToPersistedItem(item, itemType, ownerUUID){
    item.itemType = itemType;
    item.owner = trimUUID(ownerUUID);
    var uuid;
    if (item.uuid){
      uuid = trimUUID(item.uuid);
      delete item.uuid;
    }else{
      uuid = trimUUID(item.mod.uuid);
    }
    return uuid;
  }

  function persistedItemToItemInfo(persistedItem){
    var item = persistedItem.value;
    var itemType = item.itemType;
    delete item.itemType;
    // If persisted modified value has been set, then set
    // the real uuid, else the modified value
    if (item.modified){
      item.uuid = untrimUUID(persistedItem.key);
    }else{
      item.mod.uuid = untrimUUID(persistedItem.key);
    }
    var ownerUUID = untrimUUID(item.owner);
    delete item.owner;
    return {
      item: item,
      itemType: itemType,
      ownerUUID: ownerUUID
    };
  }

  return {
    persistWithNewUUID: function(oldUUID, item, itemType, ownerUUID) {
      var deferred = $q.defer();
      if (!database) database = Lawnchair({name:'items'});

      var thisService = this;
      database.get(trimUUID(oldUUID), function(persisted){
        if (persisted){

          var persistedItem = persisted.value;
          thisService.destroy(untrimUUID(persisted.key), ownerUUID).then(
            // Success
            function(){
              thisService.persist(item, itemType, ownerUUID).then(
                // Success
                function(){
                  deferred.resolve();
                },
                // Failure
                function(){
                  deferred.reject();
                }
              );
            },
            // Failure
            function(){
              deferred.reject();
            }
          );
        }else{
          // Old UUID not found
          deferred.reject();
        }
      });
      return deferred.promise;
    },
    persist: function(item, itemType, ownerUUID) {
      var deferred = $q.defer();
      if (!database) database = Lawnchair({name:'items'});
      var uuid = itemToPersistedItem(item, itemType, ownerUUID);
      database.save({key:uuid, value:item}, function(){
        deferred.resolve();
      });

      return deferred.promise;
    },
    getAll: function(){
      var deferred = $q.defer();
      if (database){
        var deferred = $q.defer();
        database.all(function(persistedItems) {
          var itemInfos = [];
          if (persistedItems){
            for (var i=0, len=persistedItems.length; i<len; i++){
              itemInfos.push(persistedItemToItemInfo(persistedItems[i]));
            }
          }
          deferred.resolve(itemInfos);
        });
      }else {
        deferred.reject();
      }
      return deferred.promise;
    },
    destroy: function(uuid){
      var deferred = $q.defer();
      if (database){
        database.remove(trimUUID(uuid), function(){
          deferred.resolve();
        })
      }else {
        deferred.reject();
      }
      return deferred.promise;
    },
    destroyAll: function(){
      var deferred = $q.defer();
      if (database){
        database.nuke(function(){
          database = undefined;
          deferred.resolve();
        });
      }else{
        deferred.reject();
      }
      return deferred.promise;
    }
  };
}
PersistentStorageService['$inject'] = ['$q'];
angular.module('em.main').factory('PersistentStorageService', PersistentStorageService);
