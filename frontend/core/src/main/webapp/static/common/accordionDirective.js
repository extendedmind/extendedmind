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

      // Ensure that all the items in this accordion are closed
      $scope.closedOtherItems = false;
      this.closeOthers = function(openItem) {
        $scope.closedOtherItems = false;
        angular.forEach(this.items, function (item) {
          if ( item !== openItem ) {
            if (item.closeItem()){
              $scope.closedOtherItems = true;
            }
          }
        });

        // This is called when accordion item is opened
        // so it's a good place to bind to start listening
        // on clicking elsewhere
        if (!$scope.eventsBound){
          $scope.bindElsewhereEvents();
        }
        $scope.closedOtherItems;
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
          $document.unbind('click', $scope.elsewhereCallback);
          $document.unbind('touchstart', $scope.elsewhereCallback);
        }
        $scope.eventsBound = false;
      };

      $scope.bindElsewhereEvents = function () {
        $document.bind('click touchstart', $scope.elsewhereCallback);
        $scope.eventsBound = true;
      }

      $scope.elsewhereCallback = function(event) {
        // First rule out clicking on link with a closed accordion
        if (!(!$scope.closedOtherItems && event.target.id === "accordionTitleLink")){
          // If clicking elswehere than on the input or on an element that has as parent
          // the accordion-item, close accordion and unbind events.
          // NOTE: Class item-actions is needed to get clicking on buttons inside the 
          //       accordion to work!
          if (($scope.closedOtherItems && event.target.id === "accordionTitleLink") ||
              (!$(event.target).parents('.accordion-item-open').length && 
              !$(event.target).parents('.item-actions').length)){
            $scope.$apply(function(){
              angular.forEach($scope.thisController.items, function (item) {
                item.closeItem();
              });
              $scope.unbindElsewhereEvents();
            })
          }
        }
      };

    },
    link: function(scope, element, attrs) {
      element.addClass('accordion');
    }
  };
};
angular.module('common').directive('accordion', ['$document', accordionDirective]);
