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
/*global jQuery */

'use strict';

describe('DiffService', function() {

  var DiffService;
  beforeEach(function() {
    module('em.appTest');
    inject(function (_DiffService_) {
      DiffService = _DiffService_;
    });
  });

  var now = Date.now();
  var testItem = {uuid: '01cd149a-a287-50a0-86d9-0a14462f22d6',
                  created: now,
                  modified: now+1,
                  title: 'this is a test item',
                  description: 'with a test description',
                  content: 'and with test content'};
  it('should return undefined if there are no changes in title, content or description.', function() {
    var itemResponse = jQuery.extend(true, {url: 'http://extendedmind.org'}, testItem);
    var itemRequest = jQuery.extend(true, {}, testItem);
    var properties =
      DiffService.mergeTitleContentAndDescription(testItem, itemRequest, itemResponse,
                                                  itemRequest.modified > itemResponse.modified);
    expect(properties).toBeUndefined();
  });

  it('should return only title when there are conflicting changes in the title.', function() {
    var itemResponse = jQuery.extend(true, {}, testItem);
    itemResponse.title = 'that is a test item';
    var itemRequest = jQuery.extend(true, {}, testItem);
    itemResponse.modified += 50;
    itemRequest.title = 'this is a test task';
    itemRequest.modified += 100;
    var properties =
      DiffService.mergeTitleContentAndDescription(testItem, itemRequest, itemResponse,
                                                  itemRequest.modified > itemResponse.modified);
    expect(properties.title).toBe('that is a test task');
    expect(properties.description).toBeUndefined();
    expect(properties.content).toBeUndefined();
  });

  it('should return all field when there are conflicting changes everywhere.', function() {
    var itemResponse = jQuery.extend(true, {}, testItem);
    itemResponse.title = 'that is a test item';
    itemResponse.description = 'and a test description';
    itemResponse.content = ', with test content';
    var itemRequest = jQuery.extend(true, {}, testItem);
    itemResponse.modified += 50;
    itemRequest.title = 'this is a test task';
    itemRequest.description = 'with an awesome test description';
    itemRequest.content = 'and with testing content';
    itemRequest.modified += 100;
    var properties =
      DiffService.mergeTitleContentAndDescription(testItem, itemRequest, itemResponse,
                                                  itemRequest.modified > itemResponse.modified);
    expect(properties.title).toBe('that is a test task');
    expect(properties.description).toBe('and an awesome test description');
    expect(properties.content).toBe(', with testing content');
  });

  it('should favor later change to field.', function() {
    var itemResponse = jQuery.extend(true, {}, testItem);
    itemResponse.title = 'this is a test tag';
    var itemRequest = jQuery.extend(true, {}, testItem);
    itemResponse.modified += 50;
    itemRequest.title = 'this is a test task';
    itemRequest.modified += 100;
    var properties =
      DiffService.mergeTitleContentAndDescription(testItem, itemRequest, itemResponse,
                                                  itemRequest.modified > itemResponse.modified);
    expect(properties.title).toBe('this is a test task');
    expect(properties.description).toBeUndefined();
    expect(properties.content).toBeUndefined();

    // Now, change the last parameter the other way round
    properties =
      DiffService.mergeTitleContentAndDescription(testItem, itemRequest, itemResponse,
                                                  itemRequest.modified < itemResponse.modified);
    expect(properties.title).toBe('this is a test tag');
    expect(properties.description).toBeUndefined();
    expect(properties.content).toBeUndefined();
  });

});
