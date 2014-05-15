'use strict';

function scrollToEdgeDirective() {

  return {
    restrict: 'A',
    replace: true,
    require: '^scrollToContainer',
    template: function(tElement, tAttrs) {
      if (tAttrs.scrollToEdge === 'top') {
        var previousLoaderText = 'previous...';
        if (tAttrs.scrollToEdgeText) {
          previousLoaderText = tAttrs.scrollToEdgeText;
        }
        return '<div id="pull-to-previous" class="loader">' +
        '<span>' + previousLoaderText + '</span>' +
        '</div>';
      } else if (tAttrs.scrollToEdge === 'bottom') {
        var nextLoaderText = 'previous...';
        if (tAttrs.scrollToEdgeText) {
          nextLoaderText = tAttrs.scrollToEdgeText;
        }
        return '<div id="pull-to-next" class="loader">' +
        '<span>' + nextLoaderText + '</span>' +
        '</div>';
      }
    },
    link: function postLink(scope, element, attrs, scrollToContainerController) {
      if (attrs.scrollToEdge === 'bottom') {
        element.css('bottom', '-' + scope.getRubberBandThreshold() + 'px');
      }
      scrollToContainerController.registerToggleEdgeElementActiveCallback(attrs.scrollToEdge, toggleElementActive);

      function toggleElementActive(isActive) {
        element[0].classList.toggle('loader-active', isActive);
      }
    }
  };
}
scrollToEdgeDirective.$inject = [];
angular.module('em.directives').directive('scrollToEdge', scrollToEdgeDirective);
