/* Copyright 2013-2017 Extended Mind Technologies Oy
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

function DiffService($window) {

  // Create a diff match patch object
  var dmp = new $window['diff_match_patch']();

  function getCompareObject(value){
    return {
      title: value.title ? value.title : '',
      description: value.description ? value.description : '',
      content: value.content ? value.content : ''
    };
  }

  function getMergedValue(v0value, v1value, v2value){
    // Don't do a merge, if all values are identical
    if (v0value !== v1value || v1value !== v2value){
      // If the later values are identical, just return either value to prevent odd errors with DMP
      if (v1value === v2value) return v1value;
      var titlePatches = dmp.patch_make(v0value, v2value);
      var result = dmp.patch_apply(titlePatches, v1value);
      return result[0];
    }
  }

  function needsMerging(v0, v1, v2){
    // Only merge if v1 and v2 have both had changes from the
    // v0 value and are different from each other
    if (v1.title !== v0.title ||
        v1.description !== v0.description ||
        v2.content !== v0.content){
      // There is a change in v1 compared to v2, is there a change
      // in v2?
      if (v2.title !== v0.title ||
          v2.description !== v0.description ||
          v2.content !== v0.content){
        // v2 has also changed, have v1 and v2 changed in different ways?
        if (v2.title !== v1.title ||
            v2.description !== v1.description ||
            v2.content !== v1.content){
          // Yes, there is a need to do a merge
          return true;
        }
      }
    }
  }

  return {
    // Returns a merged item for title, content and/or title fields. Uses
    // persistent values as V0, V1 is the newer value and
    mergeTitleContentAndDescription: function(item, itemRequest, itemResponse, requestNewerThanResponse) {
      var v0 = getCompareObject(item);
      var v1, v2;
      if (requestNewerThanResponse){
        v1 = getCompareObject(itemResponse);
        v2 = getCompareObject(itemRequest);
      }else{
        v1 = getCompareObject(itemRequest);
        v2 = getCompareObject(itemResponse);
      }
      if (needsMerging(v0, v1, v2)){
        var mergedTitle = getMergedValue(v0.title, v1.title, v2.title);
        var mergedDescription = getMergedValue(v0.description, v1.description, v2.description);
        var mergedContent = getMergedValue(v0.content, v1.content, v2.content);
        if (mergedTitle || mergedDescription || mergedContent){
          var mergedProperties = {};
          if (mergedTitle) mergedProperties.title = mergedTitle;
          if (mergedDescription) mergedProperties.description = mergedDescription;
          if (mergedContent) mergedProperties.content = mergedContent;
          return mergedProperties;
        }
      }
    }
  };
}
DiffService['$inject'] = ['$window'];
angular.module('em.base').factory('DiffService', DiffService);
