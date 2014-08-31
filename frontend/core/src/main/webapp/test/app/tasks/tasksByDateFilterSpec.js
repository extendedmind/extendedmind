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

 describe('TasksByDateFilter', function() {

  var $filter, DateService;
  var tasks, todayYYYYMMDD, tomorrowYYYYMMDD;

  beforeEach(function() {
    module('em.appTest');

    inject(function(_$filter_, _DateService_) {
      $filter = _$filter_;
      DateService = _DateService_;
      todayYYYYMMDD = DateService.getTodayYYYYMMDD();
      tomorrowYYYYMMDD = DateService.getTomorrowYYYYMMDD();

      tasks = [{
        uuid: '7a612ca2-7de0-45ad-a758-d949df37f51e',
        created: 1391278509745,
        modified: 1391278509745,
        title: 'write essay body',
        due: todayYYYYMMDD,
        relationships: {
          parent: '0a9a7ba1-3f1c-4541-842d-cff4d226628e'
        }
      }, {
        uuid: '7b53d509-853a-47de-992c-c572a6952629',
        created: 1391278509698,
        modified: 1391278509698,
        title: 'clean closet'
      }, {
        uuid: '9a1ce3aa-f476-43c4-845e-af59a9a33760',
        created: 1391278509717,
        modified: 1391278509717,
        title: 'print tickets',
        link: 'http://www.finnair.fi',
        due: tomorrowYYYYMMDD,
        reminder: '10:00',
        relationships: {
          parent: 'dbff4507-927d-4f99-940a-ee0cfcf6e84c',
          tags: ['8bd8376c-6257-4623-9c8f-7ca8641d2cf5']
        }
      }, {
        uuid: '7bc7159c-3b6f-4242-b33b-0ce591e2590e',
        created: 1408980780814,
        modified: 1408980780814,
        title: 'sketch outline for essay',
        due: '2014-03-08',
        relationships: {
          parent: 'c9b70bd9-b9c7-4c8a-8a48-30a22185108d'
        }
      }];
    });

});

it('should filter tasks by past date', function() {
  // EXECUTE
  var filteredTasks = $filter('tasksByDate')(tasks, '2014-03-08');

  // TESTS
  expect(filteredTasks.length)
  .toBe(1);

  var sketchOutlineForEssay = tasks[3]; // past date

  expect(filteredTasks.indexOf(sketchOutlineForEssay))
  .not.toBe(-1);
});

it('should filter overdue and today\'s tasks', function() {
  // EXECUTE
  var filteredTasks = $filter('tasksByDate')(tasks, todayYYYYMMDD);

  // TESTS
  expect(filteredTasks.length)
  .toBe(2);

  var cleanCloset = tasks[1];           // no date
  var sketchOutlineForEssay = tasks[3]; // past date
  var writeEssayBody = tasks[0];        // today
  var printTickets = tasks[2];          // future

  expect(filteredTasks.indexOf(cleanCloset))
  .toBe(-1);

  expect(filteredTasks.indexOf(sketchOutlineForEssay))
  .not.toBe(-1);

  expect(filteredTasks.indexOf(writeEssayBody))
  .not.toBe(-1);

  expect(filteredTasks.indexOf(printTickets))
  .toBe(-1);
});

it('should filter future tasks', function() {
  // EXECUTE
  var filteredTasks = $filter('tasksByDate')(tasks, tomorrowYYYYMMDD);

  // TESTS
  expect(filteredTasks.length)
  .toBe(1);

  var writeEssayBody = tasks[0];        // today
  var printTickets = tasks[2];          // future

  expect(filteredTasks.indexOf(writeEssayBody))
  .toBe(-1);

  expect(filteredTasks.indexOf(printTickets))
  .not.toBe(-1);
});
});
