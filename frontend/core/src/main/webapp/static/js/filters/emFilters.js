/*global angular*/
/*jslint plusplus: true*/

( function() {'use strict';

  angular.module('em.filters').filter('interpolate', ['version',
    function(version) {
      return function(text) {
        return String(text).replace(/\%VERSION\%/mg, version);
      };
    }]);

  angular.module('em.filters').filter('tagTitle', ['itemsArray', 'tagsArray',
    function(itemsArray, tagsArray) {
      var userItemsFilter = function(itemTags) {
        var filteredValues, i, tag, tags;
        filteredValues = [];

        if (itemTags) {

          i = 0;
          tags = tagsArray.getTags();

          while (itemTags[i]) {
            tag = itemsArray.getItemByUUID(tags, itemTags[i]);
            filteredValues.push(tag);
            i++;
          }
        }

        return filteredValues;
      };
      return userItemsFilter;
    }]);

  angular.module('em.filters').filter('visibleNoteContent', [
    function() {
      var userItemsFilter = function(note) {
        var filteredValues, i;
        filteredValues = [];

        if (note.content) {
          filteredValues.push(note.content);
        }
        if (note.link) {
          filteredValues.push(note.link);
        }

        return filteredValues;
      };
      return userItemsFilter;
    }]);

  angular.module('em.filters').filter('visibleTaskContent', [
    function() {
      var userItemsFilter = function(task) {
        var filteredValues, i;
        filteredValues = [];

        if (task.due) {
          filteredValues.push(task.due);
        }
        if (task.link) {
          filteredValues.push(task.link);
        }

        return filteredValues;
      };
      return userItemsFilter;
    }]);

  angular.module('em.filters').filter('tasksFilter', [
    function() {

      var filter = function(tasks,filterValue) {

        var tasksFilter ={};

        tasksFilter.tasksByDate=function(tasks,filterBy){

          var filteredValues,i;
          filteredValues=[];
          i=0;

          while (tasks[i]) {
            if (tasks[i].due){
              if(tasks[i].due === filterBy){
                filteredValues.push(tasks[i]);
              }
            }
            i++;
          }
          return filteredValues;
        }

        tasksFilter.projects=function(tasks){

          var filteredValues,i;
          filteredValues=[];
          i=0;

          while (tasks[i]) {
            if (tasks[i].project){
              filteredValues.push(tasks[i]);
            }
            i++;
          }
          return filteredValues;
        }

        tasksFilter.unsorted=function(tasks){

          var filteredValues,i;
          filteredValues=[];
          i=0;

          while (tasks[i]) {
            if (tasks[i].relationships){
              if(!tasks[i].relationships.parentTask){
                filteredValues.push(tasks[i]);
              }
            }
            else {
              if(!tasks[i].project){
                filteredValues.push(tasks[i]);
              }
            }
            i++;
          }
          return filteredValues;
        }

        if (filterValue){
          return tasksFilter[filterValue.name](tasks, filterValue.filterBy);
        }
        return tasks;
      };

      return filter;
    }]);

}());
