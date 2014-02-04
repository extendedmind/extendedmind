/*jshint sub:true*/
'use strict';

function TasksController($location, $scope, $timeout, $routeParams, UserSessionService, OwnerService, TasksService, ListsService, SwiperService, TasksSlidesService) {

  if (!$scope.task){
    if ($location.path().indexOf('/edit/' != -1) || $location.path().indexOf('/new' != -1)){
      if ($routeParams.uuid) {
        $scope.task = TasksService.getTaskByUUID($routeParams.uuid, UserSessionService.getActiveUUID());
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
    TasksService.saveTask(task, UserSessionService.getActiveUUID());
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
    TasksService.saveTask(task, UserSessionService.getActiveUUID());
  };

  $scope.editTask = function(task) {
    $location.path(OwnerService.getPrefix() + '/tasks/edit/' + task.uuid);
  };

  $scope.taskChecked = function(task) {
    if (task.completed) {
      TasksService.uncompleteTask(task, UserSessionService.getActiveUUID());
    } else {
      TasksService.completeTask(task, UserSessionService.getActiveUUID());
    }
  };

  $scope.taskToList = function(task) {
    TasksService.taskToList(task, UserSessionService.getActiveUUID());
    $location.path(OwnerService.getPrefix() + '/tasks/new/' + task.uuid);
  };

  $scope.deleteTask = function(task) {
    TasksService.deleteTask(task, UserSessionService.getActiveUUID());
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

    TasksService.saveTask(subtask, UserSessionService.getActiveUUID());
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
    ListsService.saveList(newList, UserSessionService.getActiveUUID()).then(function(list) {
      // Using timeout 0 to make sure that DOM is ready before refreshing
      // swiper.
      $timeout(function() {
        SwiperService.refreshSwiper(TasksSlidesService.LISTS);
      },0);
    });
    $scope.newList = {title:undefined};
  };
}

TasksController['$inject'] = ['$location', '$scope', '$timeout', '$routeParams', 'UserSessionService', 'OwnerService', 'TasksService', 'ListsService', 'SwiperService', 'TasksSlidesService'];
angular.module('em.app').controller('TasksController', TasksController);
