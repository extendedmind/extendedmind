/*global angular */
'use strict';

angular.module('em.services').factory('FilterService',[
  function() {
    return {
      activeFilters: {
        tasksByDate:{
          name:'tasksByDate'
        },
        project:{
          name:'projects'
        },
        unsorted:{
          name:'unsorted'
        },
        tasksByProjectUUID:{
          name:'byProjectUUID'
        }
      }
    };
  }]);
