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
    var filteredKeywords = [];

    function getNoteKeyword(noteKeywordUUID) {
      keywords.some(function(keyword) {
        if (keyword.uuid === noteKeywordUUID) {
          filteredKeywords.unshift(keyword);
          return true;
        }
        return false;
      });
    }
    note.transientProperties.keywords.forEach(getNoteKeyword);
    return filteredKeywords;
  };

  keywordsFilters.byOtherThanNoteUUID = function(keywords, note) {
    function isOtherThanNoteKeyword(keyword) {
      return note.transientProperties.keywords.indexOf(keyword.uuid) === -1;
    }
    if (note.transientProperties && note.transientProperties.keywords) return keywords.filter(isOtherThanNoteKeyword);
    return keywords;
  };

  return function(keywords, filterValue) {
    if (filterValue) return keywordsFilters[filterValue.name](keywords, filterValue.item);
  };
}
angular.module('em.main').filter('keywordsFilter', keywordsFilter);
