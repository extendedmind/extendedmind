'use strict';

// From:
// https://github.com/angular-app/Samples/tree/master/1820EN_10_Code/03_basic_accordion_directive

// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
angular.module('common').directive('accordion', ['$document',
  function($document) {
    return {
      restrict: 'A',
      controller: function($scope) {

      // This array keeps track of the accordion title scopes
      this.titleScopes = [];
      // Ensure that all the items in this accordion are closed
      $scope.closedOtherItems = false;
      this.closeOthers = function(activeScope) {
        $scope.closedOtherItems = false;
        angular.forEach(this.titleScopes, function (titleScope) {
          if ( titleScope !== activeScope ) {
            if (titleScope.closeItem()){
              $scope.closedOtherItems = true;
            }
          }
        });
        $scope.openItem = activeScope.item;

        // This is called when accordion title is opened
        // so it's a good place to bind to start listening
        // on clicking elsewhere
        if (!$scope.eventsBound){
          $scope.bindElsewhereEvents();
        }
      };

      $scope.isOpen = function(item) {
        if ($scope.openItem){
          if ($scope.openItem.uuid === item.uuid){
            return true;
          }
        }
      };

      // This is called from the accordion-title directive to add itself to the accordion
      this.addItem = function(itemScope) {
        var that = this;
        this.titleScopes.push(itemScope);

        itemScope.$on('$destroy', function() {
          that.removeItem(itemScope);
        });
      };

      // This is called from the accordion-title directive when to remove itself
      this.removeItem = function(titleScope) {
        var index = this.titleScopes.indexOf(titleScope);
        if ( index !== -1 ) {
          this.titleScopes.splice(this.titleScopes.indexOf(titleScope), 1);
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
        }
        $scope.eventsBound = false;
      };

      $scope.bindElsewhereEvents = function () {
        $document.bind('click', $scope.elsewhereCallback);
        $scope.eventsBound = true;
      };

      $scope.elsewhereCallback = function(event) {
        // First rule out clicking on link with a closed accordion
        if (!(!$scope.closedOtherItems && event.target.id === 'accordionTitleLink')) {
          // If clicking elswehere than on the input or on an element that has as parent
          // the accordion-title, close accordion and unbind events.
          // NOTE: Class item-actions is needed to get clicking on buttons inside the 
          //       accordion to work!
          if (($scope.closedOtherItems && event.target.id === 'accordionTitleLink') ||
            (!$(event.target).parents('.accordion-item-active').length &&
              !$(event.target).parents('.item-actions').length)) {
            $scope.$apply(function() {
              angular.forEach($scope.thisController.titleScopes, function (titleScope) {
                titleScope.closeItem();
              });

              $scope.openItem = undefined;
              $scope.unbindElsewhereEvents();
            });
          }
        }
      };
    },
    link: function(scope, element) {
      element.addClass('accordion');
    }
  };
}]);
