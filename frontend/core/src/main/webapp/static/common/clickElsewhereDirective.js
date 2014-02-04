'use strict';

// http://stackoverflow.com/a/12936046
function clickElsewhereDirective($document) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      scope.clickedElsewhere = false;

      element.bind('click', function(event) {
        // this part keeps it from firing the click on the document.
        event.stopPropagation();
      });
      $document.bind('click', function() {
        // magic here.
        scope.$apply(hideTextboxModal);
      });
      function hideTextboxModal() {
        $document.unbind('click');
        scope.clickedElsewhere = true;
      }
    }
  };
}
angular.module('common').directive('clickElsewhere', clickElsewhereDirective);
clickElsewhereDirective.$inject = ['$document'];
