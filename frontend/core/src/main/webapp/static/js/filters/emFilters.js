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

      var tasksDateFilter = function(tasks,filterValue) {

        var filteredValues, d,i;
        filteredValues=[];
        i=0;

        Date.prototype.yyyymmdd = function() {
          var yyyy = this.getFullYear().toString();
          var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
          var dd  = this.getDate().toString();
          return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]); // padding
        };
        d = new Date();

        while (tasks[i]) {
          if (tasks[i].due){
            if(tasks[i].due === d.yyyymmdd()){
              filteredValues.push(tasks[i]);
            }
          }
          i++;
        }

        return filteredValues;
      };
      return tasksDateFilter;
    }]);

}());
