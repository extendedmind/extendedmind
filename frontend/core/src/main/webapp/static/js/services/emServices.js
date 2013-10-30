/*global angular*/

( function() {'use strict';

  angular.module('em.services').factory('userPrefix', ['userSessionStorage',
    function(userSessionStorage) {
      var prefix = 'my';

      return {
        setCollectivePrefix : function() {
          this.setPrefix('collective' + '/' + userSessionStorage.getActiveUUID());
        },
        setMyPrefix : function() {
          this.setPrefix('my');
        },
        setPrefix : function(name) {
          prefix = name;
        },
        getPrefix : function() {
          return prefix;
        }
      };
    }]);

  angular.module('em.services').value('version', 0.1);

  angular.module('em.services').factory('Enum', [
    function() {
      var pageIndex = {
        my : {
          notes : 1,
          my : 0,
          tasks : 1
        }
      };
      return pageIndex;
    }]);

  angular.module('em.services').factory('date',[
    function(){
      var d;
      d=new Date();

      return{
        yyyymmdd:function(){
          var yyyy = d.getFullYear().toString();
          var mm = (d.getMonth()+1).toString(); // getMonth() is zero-based
          var dd  = d.getDate().toString();

          return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]); // padding
        },
        today:function(date){
          return date === this.yyyymmdd();
        }
      }
    }]);

  angular.module('em.services').factory('filterService',[ 
    function() {
      return {
        activeFilters: {
          tasksByDate:{
            "name":'tasksByDate',
            "filterBy": "2013-10-30"
          },
          project:'projects'}
        };
      }]);

  angular.module('em.services').factory('disableCarousel', [
    function() {
      var swiping;

      return {
        setSwiping : function(swipe) {
          this.swiping = swipe;
        },
        getSwiping : function() {
          return this.swiping;
        }
      };
    }]);

}());
