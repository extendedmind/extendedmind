/*global angular */
'use strict';

angular.module('em.services').factory('FilterService',[
  function() {
    return {
      activeFilters: {
        tasksByDate:{
          name:'tasksByDate'
        },
        unsorted:{
          name:'unsorted'
        },
        tasksByListUUID:{
          name:'byListUUID'
        }
      }
    };
  }]);
