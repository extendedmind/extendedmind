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
 'use strict';

describe('PersistentStorageService', function() {

  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';
  var flag;
  var now = Date.now();

  // INJECTS

  var $rootScope, $q, PersistentStorageService;

  // SETUP / TEARDOWN

  beforeEach(function() {
    module('em.appTest');

    inject(function (_$q_, _$rootScope_, _PersistentStorageService_) {
      $q = _$q_;
      $rootScope = _$rootScope_;
      PersistentStorageService = _PersistentStorageService_;
    });
  });

  afterEach(function(){
    PersistentStorageService.destroyAll();
    $rootScope.$digest();
  })

  // TESTS

  it('should persist and get all item from persistent storage', function () {

    var itemUUID = '1be16f46-7b35-4b2d-b875-e13d19681e77';
    var item = {
      uuid: itemUUID,
      title: 'test item',
      created: now,
      modified: now
    };

    var taskUUID = '2be16f46-7b35-4b2d-b875-e13d19681e77';
    var task = {
      uuid: taskUUID,
      title: 'test task',
      created: now,
      modified: now
    };

    var offlineNoteUUID = '00000000-0000-4e5d-afb6-eae0e5150c1e';
    var offlineNote = {
      mod: {
        uuid: offlineNoteUUID,
        title: 'test note',
        created: now,
        modified: now
      }
    };

    // 1. Persist new item

    runs(function() {
      flag = false;
      PersistentStorageService.persist(item, 'item', testOwnerUUID).then(
        function(item){
          flag = true;
        }
      );
      $rootScope.$digest();
    });
    waitsFor(function(){
      return flag;
    }, 100);

    // 2. Persist new task

    runs(function() {
      flag = false;
      PersistentStorageService.persist(task, 'task', testOwnerUUID).then(
        function(item){
          flag = true;
        }
      );
      $rootScope.$digest();
    });
    waitsFor(function(){
      return flag;
    }, 100);


    // 3. Persist offline note

    runs(function() {
      flag = false;
      PersistentStorageService.persist(offlineNote, 'note', testOwnerUUID).then(
        function(item){
          flag = true;
        }
      );
      $rootScope.$digest();
    });
    waitsFor(function(){
      return flag;
    }, 100);

    // 4. Get all items

    runs(function() {
      flag = false;
      PersistentStorageService.getAll().then(
        function(itemInfos){
          expect(itemInfos.length).toBe(3);
          expect(itemInfos[0].item.uuid).toBe(itemUUID);
          expect(itemInfos[0].itemType).toBe('item');
          expect(itemInfos[0].ownerUUID).toBe(testOwnerUUID);

          expect(itemInfos[1].item.uuid).toBe(taskUUID);
          expect(itemInfos[1].itemType).toBe('task');
          expect(itemInfos[1].ownerUUID).toBe(testOwnerUUID);

          expect(itemInfos[2].item.mod.uuid).toBe(offlineNoteUUID);
          expect(itemInfos[2].itemType).toBe('note');
          expect(itemInfos[2].ownerUUID).toBe(testOwnerUUID);

          flag = true;
        }
      );
      $rootScope.$digest();
    });
    waitsFor(function(){
      return flag;
    }, 100);

    // NOTE: Due to a limitation in the test lawnchair-memory adapter, second getAll is not possible

  });

  it('should persist database result of stored offline item to persistent storage', function () {

    var itemUUID = '00000000-0000-4e5d-afb6-eae0e5150c1f';
    var item = {
      mod: {
        uuid: itemUUID,
        title: 'test item',
        created: now,
        modified: now
      }
    };

    var taskUUID = '00000000-0000-4e5d-afb6-eae0e5150c1e';
    var task = {
      mod: {
        uuid: taskUUID,
        title: 'test task',
        created: now,
        modified: now
      }
    };

    // 1. Persist two offline items

    runs(function() {
      flag = 0;
      PersistentStorageService.persist(item, 'item', testOwnerUUID).then(
        function(item){
          flag++;
        }
      );
      PersistentStorageService.persist(task, 'task', testOwnerUUID).then(
        function(item){
          flag++;
        }
      );
      $rootScope.$digest();
    });
    waitsFor(function(){
      return flag === 2;
    }, 100);

    // 2. Persist database values for the latter one

    var databaseUUID = 'f7724771-4469-488c-aabd-9db188672a9b';
    var databaseCreated = 1391278509630;
    var databaseModified = 1391278509634;
    var databaseTask = {
      title: task.mod.title,
      'uuid': databaseUUID,
      'created': databaseCreated,
      'modified': databaseModified
    };

    runs(function() {
      flag = false;
      PersistentStorageService.persistWithNewUUID(taskUUID, databaseTask, 'task', testOwnerUUID).then(
        function(){
          flag = true;
        }
      );
      $rootScope.$digest();
    });
    waitsFor(function(){
      return flag;
    }, 100);

    // 3. Get all items

    runs(function() {
      flag = false;
      PersistentStorageService.getAll().then(
        function(itemInfos){
          expect(itemInfos.length).toBe(2);
          expect(itemInfos[0].item.mod.uuid).toBe(itemUUID);
          expect(itemInfos[0].itemType).toBe('item');
          expect(itemInfos[0].ownerUUID).toBe(testOwnerUUID);

          expect(itemInfos[1].item.title).toBe(task.mod.title);
          expect(itemInfos[1].item.uuid).toBe(databaseUUID);
          expect(itemInfos[1].item.created).toBe(databaseCreated);
          expect(itemInfos[1].item.modified).toBe(databaseModified);
          expect(itemInfos[1].itemType).toBe('task');
          expect(itemInfos[1].ownerUUID).toBe(testOwnerUUID);

          flag = true;
        }
      );
      $rootScope.$digest();
    });
    waitsFor(function(){
      return flag;
    }, 100);
  });

  it('should destroy item from persistent storage', function () {

    var itemUUID = '00000000-0000-4e5d-afb6-eae0e5150c1f';
    var item = {
      mod: {
        uuid: itemUUID,
        title: 'test item',
        created: now,
        modified: now
      }
    };

    var taskUUID = 'f7724771-4469-488c-aabd-9db188672a9b';
    var task = {
      uuid: taskUUID,
      title: 'test task',
      created: now,
      modified: now
    };

    // 1. Persist two items

    runs(function() {
      flag = 0;
      PersistentStorageService.persist(item, 'item', testOwnerUUID).then(
        function(item){
          flag++;
        }
      );
      PersistentStorageService.persist(task, 'task', testOwnerUUID).then(
        function(item){
          flag++;
        }
      );
      $rootScope.$digest();
    });
    waitsFor(function(){
      return flag === 2;
    }, 100);

    // 2. Destroy first item

    runs(function() {
      flag = false;
      PersistentStorageService.destroy(itemUUID).then(
        function(){
          flag = true;
        }
      );
      $rootScope.$digest();
    });
    waitsFor(function(){
      return flag;
    }, 100);

    // 3. Get all items

    runs(function() {
      flag = false;
      PersistentStorageService.getAll().then(
        function(itemInfos){
          expect(itemInfos.length).toBe(1);
          expect(itemInfos[0].item.uuid).toBe(taskUUID);
          expect(itemInfos[0].itemType).toBe('task');
          expect(itemInfos[0].ownerUUID).toBe(testOwnerUUID);
          flag = true;
        }
      );
      $rootScope.$digest();
    });
    waitsFor(function(){
      return flag;
    }, 100);

  });

  it('should destroy all items from persistent storage', function () {

    var itemUUID = '00000000-0000-4e5d-afb6-eae0e5150c1f';
    var item = {
      uuid: itemUUID,
      title: 'test item',
      created: now,
      modified: now
    };

    var taskUUID = '00000000-0000-4e5d-afb6-eae0e5150c1e';
    var task = {
      uuid: taskUUID,
      title: 'test task',
      created: now,
      modified: now
    };

    // 1. Persist two items

    runs(function() {
      flag = 0;
      PersistentStorageService.persist(item, 'item', testOwnerUUID).then(
        function(item){
          flag++;
        }
      );
      PersistentStorageService.persist(task, 'task', testOwnerUUID).then(
        function(item){
          flag++;
        }
      );
      $rootScope.$digest();
    });
    waitsFor(function(){
      return flag === 2;
    }, 100);

    // 2. Destroy all items

    runs(function() {
      flag = false;
      PersistentStorageService.destroyAll().then(
        function(){
          flag = true;
        }
      );
      $rootScope.$digest();
    });
    waitsFor(function(){
      return flag;
    }, 100);

    // 3. Get all items

    runs(function() {
      flag = false;
      PersistentStorageService.getAll().then(function(itemInfos){
        if (itemInfos.length === 0) flag = true
      });
      $rootScope.$digest();
    });
    waitsFor(function(){
      return flag;
    }, 100);

  });

});
