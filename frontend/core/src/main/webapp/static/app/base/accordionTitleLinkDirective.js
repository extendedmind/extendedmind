'use strict';

function accordionTitleLinkDirective($rootScope) {
  return {
    require: '^accordion',        // We need this directive to be inside an accordion
    restrict: 'A',                // It will be an attribute
    scope: {
      titleLength: '=accordionTitleLink',
      boldTitle: '=accordionTitleLinkBold'
    },
    link: function($scope, $element, $attrs, accordionCtrl) {

      var accordionTitleLinkWidth;
      if (!$scope.boldTitle){
        accordionTitleLinkWidth = accordionCtrl.getTitleLinkElementWidth();
        if (!accordionTitleLinkWidth){
          $scope.$evalAsync(function(){
            accordionTitleLinkWidth = $element.parent().innerWidth();
            accordionCtrl.getTitleLinkElementWidth(accordionTitleLinkWidth);
            addClasses();
          });
        }
      }else{
        // Can't use cached value for bold titles
        $scope.$evalAsync(function(){
          accordionTitleLinkWidth = $element.parent().innerWidth();
          addClasses();
        });
      }

      function addClasses() {
        if (isTitleOnTwoLines(accordionTitleLinkWidth)){
          var classes = 'ellipsis';
          if ($rootScope.packaging === 'ios-cordova'){
            classes += ' needsSmallPadding';
          }else {
            classes += ' needsBigPadding';
          }
          $element.parent().addClass(classes);
        }
      }

      function isTitleOnTwoLines(width) {
        if (!$scope.boldTitle){
          if ($scope.titleLength * 5.4 > width){
            return true;
          }
        }else{
          // Bold titles
          if ($scope.titleLength * 8 > width){
            return true;
          }
        }
      }

    }
  };
}
accordionTitleLinkDirective.$inject = ['$rootScope'];
angular.module('em.directives').directive('accordionTitleLink', accordionTitleLinkDirective);
