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

 function taskListCompletedDirective($rootScope) {
  return {
    restrict: 'A',
    require: '^list',
    scope: true,
    templateUrl: $rootScope.urlBase + 'app/tasks/taskListCompleted.html',
    compile: function(){
      return {
        post: function(scope, element, attrs, listController) {

          scope.showCompletedTasks = attrs.taskListCompleted;
          scope.toggleShowCompletedTasks = function () {
            scope.showCompletedTasks = !scope.showCompletedTasks;
          };

          var disableCompleted;
          scope.isCompletedDisabled = function() {
            if (attrs.taskListCompleted) {
              // Button is disabled when the flag is on.
              return true;
            }

            tryToChangeElementActivityStatus();
            return disableCompleted;
          };

          var containsCompleted, elementInActive;

          /*
          * Set element inactive/non-inactive.
          *
          * This mimics the functionality of :empty CSS selector which does not seem to work with Angularjs.
          */
          function tryToChangeElementActivityStatus() {
            if (!disableCompleted && !containsCompleted && !elementInActive) {
              // Set non-inactive element inactive :) Some negation jargon, but this way element is initially
              // set inactive here when needed, and there is no need to add class immediately.
              elementInActive = true;
              element[0].classList.add('inactive');
            } else if (!disableCompleted && containsCompleted && elementInActive) {
              // Set inactive element non-inactive. It has a subtle difference with being active.
              elementInActive = false;
              element[0].classList.remove('inactive');
            }
          }

          scope.containsCompleted = function(){
            var taskArray = scope.getFullArray();
            if (taskArray && taskArray.length){
              for (var i = 0; i < taskArray.length;i++){
                if (taskArray[i].trans.completed && !scope.isTaskFrozen(taskArray[i])){
                  containsCompleted = true;
                  tryToChangeElementActivityStatus();
                  return true;
                }
              }
            }
            containsCompleted = false;
            scope.showCompletedTasks = false;
            tryToChangeElementActivityStatus();
          };

          function filterCompletedTasks(tasks){
            if (tasks) {
              if (isCompletedTasksHidden()) {
                var visibleTasks = [];
                for (var i = 0; i < tasks.length; i++) {
                  var task = tasks[i];
                  if (!task.trans.completed || scope.isTaskFrozen(task)) visibleTasks.push(task);
                }
                return visibleTasks;
              }
              return tasks;
            }
          }

          function isCompletedTasksHidden() {
            return !scope.showCompletedTasks && !attrs.taskListCompleted;
          }

          listController.setCustomFilterItemVisible(filterCompletedTasks);
        }
      };
    }
  };
}
taskListCompletedDirective['$inject'] = ['$rootScope'];
angular.module('em.base').directive('taskListCompleted', taskListCompletedDirective);
