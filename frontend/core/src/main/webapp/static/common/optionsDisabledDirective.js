/* Copyright 2013-2014 Extended Mind Technologies Oy
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 'use strict';

// http://stackoverflow.com/a/20790905
function optionsDisabledDirective($parse) {
  var disableOptions = function(scope, attr, element, data, fnDisableIfTrue) {
    // refresh the disabled options in the select element.
    var options = element.find('option');
    for (var position = 0, index = 0; position < options.length; position++) {
      var elem = angular.element(options[position]);
      if (elem.val() !== '') {
        var locals = {};
        locals[attr] = data[index];
        elem.attr('disabled', fnDisableIfTrue(scope, locals));
        index++;
      }
    }
  };
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelController) {
      // parse expression and build array of disabled options
      var expElements = attrs.optionsDisabled.match(
        /^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
      var attrToWatch = expElements[3];
      var fnDisableIfTrue = $parse(expElements[1]);

      scope.$watch(attrToWatch, function(newValue) {
        if (newValue) disableOptions(scope, expElements[2], element, newValue, fnDisableIfTrue);
      }, true);

      function isAddNewOption(uuid) {
        var dataSourceArray = scope.$eval(attrToWatch);
        for (var i = 0, len = dataSourceArray.length; i < len; i++) {
          if (dataSourceArray[i].uuid === uuid && dataSourceArray[i].isAddNewItem) {
            ngModelController.$setViewValue();  // https://docs.angularjs.org/api/ng/type/ngModel.NgModelController
            return true;
          }
        }
      }

      // handle model updates properly
      scope.$watch(attrs.ngModel, function(newValue) {
        var disOptions = $parse(attrToWatch)(scope);
        if (newValue) {
          if (isAddNewOption(newValue)) {
            scope.setAddNewListVisible();
            return;
          }
          disableOptions(scope, expElements[2], element, disOptions, fnDisableIfTrue);
        }
      });
    }
  };
}
optionsDisabledDirective['$inject'] = ['$parse'];
angular.module('common').directive('optionsDisabled', optionsDisabledDirective);
