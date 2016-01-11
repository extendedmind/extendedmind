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

 function keywordsFilter() {
  var keywordsFilters = {};

  function isSelectedKeywordInKeywordsOrParents(selectedKeyword, itemKeywords){
    if (itemKeywords.indexOf(selectedKeyword) !== -1){
      // It is in the selected keywords
      return true;
    }else if (!selectedKeyword.trans.parent){
      // Check for keyword parents
      for (var i=0; i<itemKeywords.length; i++){
        if (itemKeywords[i].trans.parent === selectedKeyword) return true;
      }
    }
  }

  keywordsFilters.byOtherThanNoteKeywords = function(keywords, note) {
    if (note.trans.keywords) {
      var filteredKeywords = [];
      for (var i = 0, len = keywords.length; i < len; i++) {
        // Filter out not only keywords that are present, but also parent keywords => no point in having
        // both the parent and the child keyword in one note, as the parent is implicitly already
        // part of the child.
        if (!isSelectedKeywordInKeywordsOrParents(keywords[i], note.trans.keywords))
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
