/*global $,angular*/

( function() {'use strict';
    angular.module('em.swiper', []);

    angular.module('em.swiper').factory('swiper', function() {

      return {
        initSwiper : function() {
          var mySwiper = $('.swiper-container').swiper({
            mode : 'horizontal',
            loop : true
          });
        },
        reinitSwiper : function() {

          setTimeout(function() {
            var mySwiper = $('.swiper-container').swiper({
              mode : 'horizontal',
              loop : true
            });

          }, 500);
        }
      };
    });
  }());
