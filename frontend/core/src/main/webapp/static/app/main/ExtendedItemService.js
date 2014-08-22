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

 function ExtendedItemService(TagsService) {
  return {
    addContextToTasks: function(tasksResponse, ownerUUID) {
      if (tasksResponse) {
        for (var i=0, len=tasksResponse.length; i<len; i++) {
          if (tasksResponse[i].relationships && tasksResponse[i].relationships.tags) {
            for (var j=0, jlen=tasksResponse[i].relationships.tags.length; j<jlen; j++) {
              var tag = TagsService.getTagByUUID(tasksResponse[i].relationships.tags[j], ownerUUID);
              if (tag && tag.tagType === 'context') {
                tasksResponse[i].relationships.context = tag.uuid;
                break;
              }
            }
          }
        }
      }
    },
    addListToTasks: function(tasksResponse) {
      if (tasksResponse) {
        for (var i=0, len=tasksResponse.length; i<len; i++) {
          if (tasksResponse[i].relationships && tasksResponse[i].relationships.parent) {
            tasksResponse[i].relationships.list = tasksResponse[i].relationships.parent;
          }
        }
      }
    },
    addDateToTasks: function(tasksResponse) {
      if (tasksResponse) {
        for (var i=0, len=tasksResponse.length; i<len; i++) {
          if (tasksResponse[i].due) {
            tasksResponse[i].date = tasksResponse[i].due;
          }
        }
      }
    },
    moveContextToTags: function(task, ownerUUID) {
      if (task.relationships) {
        var context = task.relationships.context;
        if (task.relationships.tags) {
          var foundCurrent = false;
          var previousContextIndex;
          for (var i=0, len=task.relationships.tags.length; i<len; i++) {
            var tag = TagsService.getTagByUUID(task.relationships.tags[i], ownerUUID);
            if (tag && tag.tagType === 'context') {
              if (context && tag.uuid === context) {
                foundCurrent = true;
              } else {
                previousContextIndex = i;
              }
            }
          }
          if (previousContextIndex !== undefined) {
            // Remove old
            task.relationships.tags.splice(previousContextIndex, 1);
          }
          if (!foundCurrent && context) {
            // Add new
            task.relationships.tags.push(context);
          }
        } else if (context) {
          task.relationships.tags = [context];
        }

        if (task.relationships.hasOwnProperty('context')) {
          delete task.relationships.context;
        }
        return context;
      }
    },
    moveListToParent: function(task) {
      if (task.relationships) {
        var list = task.relationships.list;
        if (list) {
          task.relationships.parent = list;
        } else if (task.relationships.hasOwnProperty('parent')) {
          delete task.relationships.parent;
        }
        if (task.relationships.hasOwnProperty('list')) {
          delete task.relationships.list;
        }
        return list;
      }
    },
    moveDateToDue: function(task) {
      if (task.date) {
        task.due = task.date;
        delete task.date;
        return task.due;
      }
    },
    updateTransientProperties: function(task, context, list, due) {
      if (context) {
        task.relationships.context = context;
      }
      if (list) {
        task.relationships.list = list;
      }
      if (due) {
        task.date = due;
      }
    }
  };
}

ExtendedItemService['$inject'] = ['TagsService'];
angular.module('em.services').factory('ExtendedItemService', ExtendedItemService);
