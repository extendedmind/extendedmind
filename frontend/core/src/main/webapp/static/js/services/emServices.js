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
      var today,months;

      today={};
      months = [
      {name:'jan',days:31},
      {name:'feb',days:28},
      {name:'mar',days:31},
      {name:'apr',days:30},
      {name:'may',days:31},
      {name:'jun',days:30},
      {name:'jul',days:31},
      {name:'aug',days:31},
      {name:'sep',days:30},
      {name:'oct',days:31},
      {name:'nov',days:30},
      {name:'dec',days:31}
      ];


      return{
        yyyymmdd:function(d){
          var yyyy = d.getFullYear().toString();
          var mm = (d.getMonth()+1).toString(); // getMonth() is zero-based
          var dd  = d.getDate().toString();

          return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]); // padding
        },
        today:function(){
          return today;
        },
        week:function(){
          var date,day,week,i;
          date=new Date();
          week=[];
          i=0;

          for(i=0;i<7;i++){
            day={};
            day.date = date.getDate();

            day.month = {};
            day.month.name=months[date.getMonth()].name;
            day.month.day=date.getMonth();
            
            day.year=date.getFullYear();
            day.yyyymmdd=this.yyyymmdd(date);
            week.push(day);

            if(i===0){
              day.displayDate='today';
              day.displayDateShort = day.displayDate;
              today = day;
            }else{
              day.displayDate=day.month.name + ' ' + day.date;
              day.displayDateShort = day.date;
            }

            if(date.getDate() < months[date.getMonth()].days){
              date.setDate(date.getDate()+1);
            } else{
              date.setDate(1);
              if(date.getMonth()<11){
                date.setMonth(date.getMonth()+1);
              } else {
                date.setMonth(0);
                date.setYear(date.getYear()+1);
              }
            }
          }
          return week;
        }
      }
    }]);

angular.module('em.services').factory('filterService',[ 
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
        }
      }
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
