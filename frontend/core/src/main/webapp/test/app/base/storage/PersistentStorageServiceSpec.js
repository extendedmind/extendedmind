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
 'use strict';

describe('PersistentStorageService', function() {

  var testOwnerUUID = '6be16f46-7b35-4b2d-b875-e13d19681e77';
  var flag;

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

    var itemUUID = '00000000-0000-4e5d-afb6-eae0e5150c1f';
    var item = {
      uuid: itemUUID,
      title: 'test item'
    };

    var taskUUID = '00000000-0000-4e5d-afb6-eae0e5150c1e';
    var task = {
      uuid: taskUUID,
      title: 'test task'
    };

    var noteUUID = '00000000-0000-4e5d-afb6-eae0e5150c1d';
    var note = {
      uuid: noteUUID,
      title: 'test note'
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

    // 3. Get all items

    runs(function() {
      flag = false;
      PersistentStorageService.getAll().then(
        function(itemInfos){
          expect(itemInfos.length).toBe(2);
          expect(itemInfos[0].item.uuid).toBe(itemUUID);
          expect(itemInfos[0].itemType).toBe('item');
          expect(itemInfos[0].ownerUUID).toBe(testOwnerUUID);

          expect(itemInfos[1].item.uuid).toBe(taskUUID);
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

    // NOTE: Due to a limitation in the test lawnchair-memory adapter, second getAll is not possible

  });

  it('should persist set result of existing item to persistent storage', function () {

    var itemUUID = '00000000-0000-4e5d-afb6-eae0e5150c1f';
    var item = {
      uuid: itemUUID,
      title: 'test item'
    };

    var taskUUID = '00000000-0000-4e5d-afb6-eae0e5150c1e';
    var task = {
      uuid: taskUUID,
      title: 'test task'
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

    // 2. Persist set result for the latter one

    var databaseUUID = 'f7724771-4469-488c-aabd-9db188672a9b';
    var databaseCreated = 1391278509630;
    var databaseModified = 1391278509634;
    var setResult = {
      'uuid': databaseUUID,
      'created': databaseCreated,
      'modified': databaseModified
    };

    runs(function() {
      flag = false;
      // NOTE: This is needed because of the in-memory data store holds references and not copies
      task.uuid = taskUUID;

      PersistentStorageService.persistSetResult(task, 'task', testOwnerUUID, setResult).then(
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
          expect(itemInfos[0].item.uuid).toBe(itemUUID);
          expect(itemInfos[0].itemType).toBe('item');
          expect(itemInfos[0].ownerUUID).toBe(testOwnerUUID);

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

  it('should persist set result of alongside new task to persistent storage', function () {

    var taskUUID = 'f7724771-4469-488c-aabd-9db188672a9b';
    var task = {
      uuid: taskUUID,
      title: 'test task'
    };

    // 1. Persist task with set result

    var databaseCreated = 1391278509630;
    var databaseModified = 1391278509634;
    var setResult = {
      'uuid': taskUUID,
      'created': databaseCreated,
      'modified': databaseModified
    };

    runs(function() {
      flag = false;

      PersistentStorageService.persistSetResult(task, 'task', testOwnerUUID, setResult).then(
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
          expect(itemInfos[0].item.created).toBe(databaseCreated);
          expect(itemInfos[0].item.modified).toBe(databaseModified);
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

  it('should destroy item from persistent storage', function () {

    var itemUUID = '00000000-0000-4e5d-afb6-eae0e5150c1f';
    var item = {
      uuid: itemUUID,
      title: 'test item'
    };

    var taskUUID = '00000000-0000-4e5d-afb6-eae0e5150c1e';
    var task = {
      uuid: taskUUID,
      title: 'test task'
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
      title: 'test item'
    };

    var taskUUID = '00000000-0000-4e5d-afb6-eae0e5150c1e';
    var task = {
      uuid: taskUUID,
      title: 'test task'
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
      PersistentStorageService.getAll().then(function(){},
        function(){
          flag = true;
        }
      );
      $rootScope.$digest();
    });
    waitsFor(function(){
      return flag;
    }, 100);

  });

});
