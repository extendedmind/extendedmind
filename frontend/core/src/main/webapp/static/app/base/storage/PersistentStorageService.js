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

 /*global angular, Lawnchair */
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

  var persistQueue = [];
  function executePersistQueue(newInfoToPersist){
    // Push new value to queue
    if (newInfoToPersist) persistQueue.push(newInfoToPersist);

    if (persistQueue.length > 0 && !persistQueue[0].executing){
      persistQueue[0].executing = true;
      if (persistQueue[0].oldUUID){
        persistWithNewUUIDDeferred(persistQueue[0].oldUUID,
                                   persistQueue[0].data,
                                   persistQueue[0].itemType,
                                   persistQueue[0].ownerUUID,
                                   persistQueue[0].deferred).then(
          function(result){
            persistQueue.shift();
            executePersistQueue();
            return result;
          },
          function(error){
            persistQueue.shift();
            executePersistQueue();
            $q.reject(error);
          }
        );
      }else{
        persistDeferred(persistQueue[0].data,
                        persistQueue[0].itemType,
                        persistQueue[0].ownerUUID,
                        persistQueue[0].deferred).then(
          function(result){
            persistQueue.shift();
            executePersistQueue();
            return result;
          },
          function(error){
            persistQueue.shift();
            executePersistQueue();
            $q.reject(error);
          }
        );
      }
    }
  }

  function persist(data, itemType, ownerUUID, internalCall) {
    var deferred = $q.defer();
    if (!database) database = Lawnchair({name:'items'});
    if (!internalCall){
      executePersistQueue({deferred: deferred, data:data, itemType: itemType, ownerUUID: ownerUUID});
    }else {
      persistDeferred(data, itemType, ownerUUID, deferred);
    }
    return deferred.promise;
  }

  function persistDeferred(data, itemType, ownerUUID, deferred){
    var uuid;
    if (angular.isArray(data)){
      // Save arrays in a big batch
      var i, dataToBatchSave = [];
      for (i=0; i<data.length; i++) {
        uuid = itemToPersistedItem(data[i], itemType, ownerUUID);
        dataToBatchSave.push({key:uuid, value:data[i]});
      }
      database.batch(dataToBatchSave,
        function(result){
          // Success
          deferred.resolve(result);
        },
        function(){
          // Failure
          deferred.reject();
        }
      );
    }else{
      uuid = itemToPersistedItem(data, itemType, ownerUUID);
      database.save({key:uuid, value:data},
        function(result){
          // Success
          deferred.resolve(result);
        },
        function(){
          // Failure
          deferred.reject();
        }
      );
    }
    return deferred.promise;
  }

  function persistWithNewUUID(oldUUID, item, itemType, ownerUUID) {
    var deferred = $q.defer();
    if (!database) database = Lawnchair({name:'items'});

    if (persistQueue.length === 0){
      persistWithNewUUIDDeferred(oldUUID, item, itemType, ownerUUID, deferred);
    }else {
      executePersistQueue({deferred: deferred,
                           oldUUID: oldUUID,
                           data: item,
                           itemType: itemType,
                           ownerUUID: ownerUUID});
    }
    return deferred.promise;
  }

  function persistWithNewUUIDDeferred(oldUUID, item, itemType, ownerUUID, deferred) {
    database.get(trimUUID(oldUUID), function(persisted){
      if (persisted){
        destroy(untrimUUID(persisted.key), ownerUUID).then(
          // Success
          function(){
            persist(item, itemType, ownerUUID, true).then(
              // Success
              function(result){
                deferred.resolve(result);
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
  }

  function destroy(uuid){
    var deferred = $q.defer();
    if (database){
      database.remove(trimUUID(uuid), function(){
        deferred.resolve();
      });
    }else {
      deferred.reject();
    }
    return deferred.promise;
  }

  return {
    persistWithNewUUID: persistWithNewUUID,
    persist: persist,
    getAll: function(){
      var deferred = $q.defer();
      if (!database) database = Lawnchair({name:'items'});
      if (database){
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
    destroy: destroy,
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
