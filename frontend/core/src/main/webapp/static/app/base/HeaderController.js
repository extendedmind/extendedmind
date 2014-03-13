/* global $ */
'use strict';

function HeaderController($scope, $location, $document, $element, $rootScope, SnapService) {

  $scope.omnibarText = {};
  $scope.omniBarVisible = false;
  $scope.omniBarActive = false;
  $scope.isMenuOpen = false;

  $scope.toggleMenu = function toggleMenu() {
    if ($rootScope.isMobile) {
      SnapService.toggle();
    } else if ($rootScope.isDesktop) {
      $scope.isMenuOpen = !$scope.isMenuOpen;
    }
  };

  $scope.showOmnibar = function() {
    $scope.omniBarVisible = true;
  };

  $scope.saveOmnibarText = function(omnibarText) {
    if (omnibarText.title && omnibarText.title.length > 0){
      $scope.addNewItem(omnibarText.title).then(function(/*item*/){
        $scope.omnibarText.title = '';
      });
    }
  };

  $scope.omniBarFocus = function(focus) {
    if (focus) {
      $scope.omniBarActive = true;
      $scope.bindElsewhereEvents();
    } else {
      $scope.unbindElsewhereEvents();
      if ($scope.omnibarText == null || $scope.omnibarText.title == null || $scope.omnibarText.title.length === 0) {
        $scope.omniBarActive = false;
      }
    }
  };

  // "Click elsewhere to lose omnibar focus"

  $scope.$on('$destroy', function() {
    $scope.unbindElsewhereEvents();
  });

  $scope.eventsBound = false;
  $scope.unbindElsewhereEvents = function() {
    if ($scope.eventsBound){
      $document.unbind('click', $scope.elsewhereCallback);
    }
    $scope.eventsBound = false;
  };

  $scope.bindElsewhereEvents = function () {
    if (!$scope.eventsBound){
      $document.bind('click', $scope.elsewhereCallback);
      $scope.eventsBound = true;
    }
  };

  $scope.elsewhereCallback = function(event) {
    // Rule out clicking on omnibar text itself,
    // or any of the search results 
    if (event.target.id !== 'omniItem' && event.target.id !== 'omnibarPlus' &&
        event.target.id !== 'accordionTitleLink' &&
        !$(event.target).is('input') &&
        !$(event.target).is('label') &&
        !$(event.target).hasClass('page-header') &&
        !$(event.target).parents('.accordion-item-active').length &&
        !$(event.target).parents('.item-actions').length) {
      $scope.$apply(function() {
        $scope.unbindElsewhereEvents();
        $scope.omniBarFocus(false);
        $scope.omnibarText.title = '';
        $scope.omniBarVisible = false;
      });
    }
  };
}

HeaderController['$inject'] = [
'$scope', '$location', '$document', '$element', '$rootScope', 'SnapService'];
angular.module('em.app').controller('HeaderController', HeaderController);
