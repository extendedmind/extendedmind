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

 function keywordsFilter() {
  var keywordsFilters = {};

  keywordsFilters.byNoteUUID = function(keywords, note) {
    if (note.transientProperties && note.transientProperties.keywords) {
      var filteredKeywords = [];
      for (var i = 0, len = keywords.length; i < len; i++) {
        if (note.transientProperties.keywords.indexOf(keywords[i].uuid) !== -1)
          filteredKeywords.push(keywords[i]);
      }
      return filteredKeywords;
    }
  };

  keywordsFilters.byOtherThanNoteUUID = function(keywords, note) {
    if (note.transientProperties && note.transientProperties.keywords) {
      var filteredKeywords = [];
      for (var i = 0, len = keywords.length; i < len; i++) {
        if (note.transientProperties.keywords.indexOf(keywords[i].uuid) === -1)
          filteredKeywords.push(keywords[i]);
      }
      return filteredKeywords;
    }
    // Just return keywords if note has no keywords.
    return keywords;
  };

  return function(keywords, filterValue) {
    if (filterValue) return keywordsFilters[filterValue.name](keywords, filterValue.item);
  };
}
angular.module('em.main').filter('keywordsFilter', keywordsFilter);
