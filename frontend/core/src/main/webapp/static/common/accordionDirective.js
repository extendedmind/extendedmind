/*global angular */
'use strict';

// From:
// https://github.com/angular-app/Samples/tree/master/1820EN_10_Code/03_basic_accordion_directive

// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
function accordionDirective($document){
  return {
    restrict:'A',
    controller: function($scope) {

      // This array keeps track of the accordion items
      this.items = [];

      // Ensure that all the items in this accordion are closed, unless close-others explicitly says not to
      this.closeOthers = function(openItem) {
        angular.forEach(this.items, function (item) {
          if ( item !== openItem ) {
            item.closeItem();
          }
        });

        // This is called when accordion item is opened
        // so it's a good place to bind to start listening
        // on clicking elsewhere
        if (!$scope.eventsBound){
          $scope.bindElsewhereEvents();
        }
      };
      
      // This is called from the accordion-item directive to add itself to the accordion
      this.addItem = function(itemScope) {
        var that = this;
        this.items.push(itemScope);

        itemScope.$on('$destroy', function (event) {
          that.removeItem(itemScope);
        });
      };

      // This is called from the accordion-item directive when to remove itself
      this.removeItem = function(item) {
        var index = this.items.indexOf(item);
        if ( index !== -1 ) {
          this.items.splice(this.items.indexOf(item), 1);
        }
      };

      $scope.$on('$destroy', function() {
        $scope.unbindElsewhereEvents();
      });

      // "Click elsewhere to close accordion"

      $scope.thisController = this;
      $scope.eventsBound = false;
      $scope.unbindElsewhereEvents = function() {
        if ($scope.eventsBound){
          $document.unbind('click', $scope.elswhereCallback);
          $document.unbind('touchstart', $scope.elswhereCallback);
        }
        $scope.eventsBound = false;
      };

      $scope.bindElsewhereEvents = function () {
        $document.bind('click touchstart', $scope.elswhereCallback);
        $scope.eventsBound = true;
      }

      $scope.elswhereCallback = function(event) {
        // If clicking elswehere than on the link or on an element that has as parent
        // this accordion, close accordion and unbind events.
        // NOTE: Class item-actions is needed to get clicking on buttons inside the 
        //       accordion to work!
        if (event.target.id !== "accordionTitleLink" && 
            !$(event.target).parents('.accordion').length && 
            !$(event.target).parents('.item-actions').length){
          $scope.$apply(function(){
            $scope.thisController.closeOthers();
            $scope.unbindElsewhereEvents();
          })
        }
      };

    },
    link: function(scope, element, attrs) {
      element.addClass('accordion');
    }
  };
};
angular.module('common').directive('accordion', ['$document', accordionDirective]);
