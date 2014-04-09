'use strict';

function TasksController($location, $scope, $routeParams, UserSessionService, TasksService, AnalyticsService) {

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
          $scope.task.relationships.list = $routeParams.parentUUID;
        }
      }
    }
  }

  $scope.repeatTypes = ['daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'yearly'];

  $scope.taskHasDate = function(task) {
    if (task.date) {
      return true;
    }
    return false;
  };

  $scope.focusDate = function() {
    $scope.showDate = true;
  };

  $scope.saveTask = function(task) {
    if (task.uuid){
      AnalyticsService.do("saveTask", "new");
    }else{
      AnalyticsService.do("saveTask", "existing");
    }
    TasksService.saveTask(task, UserSessionService.getActiveUUID());
    window.history.back();
  };

  $scope.cancelEdit = function() {
    window.history.back();
  };

  $scope.addNew = function() {
    $location.path($scope.ownerPrefix + '/tasks/new');
  };

  $scope.editTaskTitle = function(task) {
    AnalyticsService.do("editTaskTitle");
    TasksService.saveTask(task, UserSessionService.getActiveUUID());
  };

  $scope.editTask = function(task) {
    $location.path(UserSessionService.getOwnerPrefix() + '/tasks/edit/' + task.uuid);
  };

  $scope.taskChecked = function(task) {
    if (task.completed) {
      AnalyticsService.do("uncompleteTask");
      TasksService.uncompleteTask(task, UserSessionService.getActiveUUID());
    } else {
      AnalyticsService.do("completeTask");
      TasksService.completeTask(task, UserSessionService.getActiveUUID());
    }
  };

  $scope.taskToList = function(task) {
    TasksService.taskToList(task, UserSessionService.getActiveUUID());
    $location.path(UserSessionService.getOwnerPrefix() + '/tasks/new/' + task.uuid);
  };

  $scope.deleteTask = function(task) {
    AnalyticsService.do("deleteTask");
    TasksService.deleteTask(task, UserSessionService.getActiveUUID());
  };

  $scope.addSubtask = function(subtask) {
    if (!subtask.title  || subtask.title.length === 0) return false;
    var subtaskToSave = {title: subtask.title};
    if (subtask.date){
      subtaskToSave.date = subtask.date;
    }
    if (subtask.relationships){
      subtaskToSave.relationships = {};
      if(subtask.relationships.list){
        subtaskToSave.relationships.list = subtask.relationships.list;
      }
      if(subtask.relationships.context){
        subtaskToSave.relationships.context = subtask.relationships.context;
      }
    }
    delete subtask.title;

    TasksService.saveTask(subtaskToSave, UserSessionService.getActiveUUID()).then(function(/*subtaskToSave*/){
      AnalyticsService.do("addTask");
    });
  };

  $scope.taskQuickEditDone = function(task) {
    AnalyticsService.do("taskQuickEditDone");
    TasksService.saveTask(task, UserSessionService.getActiveUUID());
    $scope.close(task, true);
  };

  $scope.getDoneButtonClass = function(task) {
    if (!(task.relationships && task.relationships.list)){
      return 'left-of-three';
    }else{
      return 'left-of-two';
    }
  };

  $scope.getSubtaskButtonClass = function(task) {
    if (!(task.relationships && task.relationships.list)){
      return 'center-of-three';
    }
  };

  $scope.getDeleteButtonClass = function(task) {
    if (!(task.relationships && task.relationships.list)){
      return 'right-of-three';
    }else{
      return 'right-of-two';
    }
  };
}

TasksController['$inject'] = ['$location', '$scope', '$routeParams', 'UserSessionService', 'TasksService', 'AnalyticsService'];
angular.module('em.app').controller('TasksController', TasksController);
