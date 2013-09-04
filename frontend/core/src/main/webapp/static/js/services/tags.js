/*global angular*/

( function() {'use strict';

    angular.module('em.services').factory('tagsArray', ['itemsArray',
    function(itemsArray) {
      var tags;

      return {
        setTags : function(tags) {
          this.tags = tags;
        },
        getTags : function() {
          return this.tags;
        },
        putNewTag : function(tag) {
          if (!itemsArray.itemInArray(this.tags, tag.title)) {
            this.tasks.push(tag);
          }
        }
      };
    }]);
  }());
