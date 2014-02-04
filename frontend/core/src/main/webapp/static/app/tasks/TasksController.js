/* global angular */
'use strict';

function TasksController($location, $scope, $timeout, $routeParams, OwnerService, TasksService, ListsService, SwiperService, TasksSlidesService) {

  if (!$scope.task){
    if ($location.path().indexOf('/edit/' != -1) || $location.path().indexOf('/new' != -1)){
      if ($routeParams.uuid) {
        $scope.task = TasksService.getTaskByUUID($routeParams.uuid);
        if ($scope.task.due) $scope.showDate = true;
      }else {
        $scope.task = {
          relationships: {
            tags: []
          }
        };
        if ($routeParams.parentUUID){
          $scope.task.relationships.parent = $routeParams.parentUUID;
        }
      }
    }
  }

  $scope.focusDate = function() {
    $scope.showDate = true;
  };

  $scope.saveTask = function(task) {
    TasksService.saveTask(task);
    window.history.back();
  };

  $scope.cancelEdit = function() {
    window.history.back();
  };


  $scope.addNew = function() {
    $location.path($scope.prefix + '/tasks/new');
  };

  $scope.dateClicked = function(dateString) {
    SwiperService.swipeTo(TasksSlidesService.getDateSlidePath(dateString));
  };

  $scope.editTaskTitle = function(task) {
    TasksService.saveTask(task);
  };

  $scope.editTask = function(task) {
    $location.path(OwnerService.getPrefix() + '/tasks/edit/' + task.uuid);
  };

  $scope.taskChecked = function(task) {
    if (task.completed) {
      TasksService.uncompleteTask(task);
    } else {
      TasksService.completeTask(task);
    }
  };

  $scope.taskToList = function(task) {
    TasksService.taskToList(task);
    $location.path(OwnerService.getPrefix() + '/tasks/new/' + task.uuid);
  };

  $scope.deleteTask = function(task) {
    TasksService.deleteTask(task);
  };

  $scope.addSubtask = function(subtask) {
    $scope.subtask = {};

    // Quick hack to save the possible due date and list to prevent 
    // bug with adding a second subtask in view
    // TODO: Refactor task lists handling.
    if (subtask.due){
      $scope.subtask.due = subtask.due;
    }
    if (subtask.relationships && subtask.relationships.parent){
      $scope.subtask.relationships = {
        parent: subtask.relationships.parent
      };
    }

    TasksService.saveTask(subtask);
  };

  $scope.getSubtaskButtonClass = function(task) {
    if (!(task.relationships && task.relationships.parent)){
      return 'left-of-two';
    }
  };

  $scope.getDeleteButtonClass = function(task) {
    if (!(task.relationships && task.relationships.parent)){
      return 'right-of-two';
    }else{
      return 'wide-button';
    }
  };

  $scope.goToList = function(uuid) {
    SwiperService.swipeTo(TasksSlidesService.LISTS + '/' + uuid);
  };

  $scope.newList = {title:undefined};
  $scope.addList = function(newList) {
    ListsService.saveList(newList).then(function(list) {
      // Using timeout 0 to make sure that DOM is ready before refreshing
      // swiper.
      $timeout(function() {
        SwiperService.refreshSwiper(TasksSlidesService.LISTS);
      },0);
    });
    $scope.newList = {title:undefined};
  };

}

TasksController.$inject = ['$location', '$scope', '$timeout', '$routeParams', 'OwnerService', 'TasksService', 'ListsService', 'SwiperService', 'TasksSlidesService'];
angular.module('em.app').controller('TasksController', TasksController);
