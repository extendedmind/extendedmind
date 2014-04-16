'use strict';

function TasksController($location, $rootScope, $routeParams, $scope, DateService, SwiperService, UserSessionService, TasksService, AnalyticsService) {

  if (!$scope.task) {
    // edit tasks or new task dialog
    if ($location.path().indexOf('/edit/' != -1) || $location.path().indexOf('/new' != -1)) {
      // edit task
      if ($routeParams.uuid) {
        $scope.task = TasksService.getTaskByUUID($routeParams.uuid, UserSessionService.getActiveUUID());
        if ($scope.task.due) $scope.showDate = true;
      }
      // new task
      else {
        $scope.task = {
          relationships: {
            tags: []
          }
        };
        if ($rootScope.omnibarTask) {
          $scope.task.title = $rootScope.omnibarTask.title;
          delete $rootScope.omnibarTask;
        }
        if ($routeParams.parentUUID) {
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
    if (task.uuid) {
      AnalyticsService.do('saveTask', 'new');
    } else {
      AnalyticsService.do('saveTask', 'existing');
    }
    TasksService.saveTask(task, UserSessionService.getActiveUUID()).then(gotoTask);

    function gotoTask(savedTask) {
      var mainSlidePath, pageSlidePath;

      // date
      if (savedTask.due) {
        mainSlidePath = 'tasks/home';
        DateService.constructActiveWeekByDate(new Date(savedTask.due));
        DateService.constructDatePickerWeeksByDate(new Date(savedTask.due));
        var weekDay = DateService.getWeekday(new Date(savedTask.due));
        pageSlidePath = mainSlidePath + '/' + weekDay;
      }
      // list
      else if (savedTask.relationships && savedTask.relationships.parent) {
        mainSlidePath = 'tasks/details';
        pageSlidePath = mainSlidePath + '/' + savedTask.relationships.parent;

      }
      // context
      else if (savedTask.relationships && savedTask.relationships.tags && savedTask.relationships.tags[0]) {
        mainSlidePath = 'tasks/details';
        pageSlidePath = mainSlidePath + '/' + savedTask.relationships.tags[0];
      }
      // unsorted
      else {
        mainSlidePath = 'tasks/details';
        pageSlidePath = mainSlidePath + '/unsorted';
      }

      SwiperService.setInitialSlidePath('tasks', mainSlidePath);
      SwiperService.setInitialSlidePath(mainSlidePath, pageSlidePath);
      $location.path(UserSessionService.getOwnerPrefix() + '/tasks');
    }
  };

  $scope.cancelEdit = function() {
    window.history.back();
  };

  $scope.addNew = function() {
    $location.path($scope.ownerPrefix + '/tasks/new');
  };

  $scope.editTaskTitle = function(task) {
    AnalyticsService.do('editTaskTitle');
    TasksService.saveTask(task, UserSessionService.getActiveUUID());
  };

  $scope.editTask = function(task) {
    $location.path(UserSessionService.getOwnerPrefix() + '/tasks/edit/' + task.uuid);
  };

  $scope.taskChecked = function(task) {
    if (task.completed) {
      AnalyticsService.do('uncompleteTask');
      TasksService.uncompleteTask(task, UserSessionService.getActiveUUID());
    } else {
      AnalyticsService.do('completeTask');
      TasksService.completeTask(task, UserSessionService.getActiveUUID());
    }
  };

  $scope.taskToList = function(task) {
    TasksService.taskToList(task, UserSessionService.getActiveUUID());
    $location.path(UserSessionService.getOwnerPrefix() + '/tasks/new/' + task.uuid);
  };

  $scope.deleteTask = function(task) {
    AnalyticsService.do('deleteTask');
    TasksService.deleteTask(task, UserSessionService.getActiveUUID());
  };

  $scope.addSubtask = function(subtask) {
    if (!subtask.title  || subtask.title.length === 0) return false;
    var subtaskToSave = {title: subtask.title};
    if (subtask.date) {
      subtaskToSave.date = subtask.date;
    }
    if (subtask.relationships) {
      subtaskToSave.relationships = {};
      if(subtask.relationships.list) {
        subtaskToSave.relationships.list = subtask.relationships.list;
      }
      if(subtask.relationships.context) {
        subtaskToSave.relationships.context = subtask.relationships.context;
      }
    }
    delete subtask.title;

    TasksService.saveTask(subtaskToSave, UserSessionService.getActiveUUID()).then(function(/*subtaskToSave*/) {
      AnalyticsService.do('addTask');
    });
  };

  $scope.taskQuickEditDone = function(task) {
    AnalyticsService.do('taskQuickEditDone');
    TasksService.saveTask(task, UserSessionService.getActiveUUID());
    $scope.close(task, true);
  };

  $scope.getDoneButtonClass = function(task) {
    if (!(task.relationships && task.relationships.list)) {
      return 'left-of-three';
    } else {
      return 'left-of-two';
    }
  };

  $scope.getSubtaskButtonClass = function(task) {
    if (!(task.relationships && task.relationships.list)) {
      return 'center-of-three';
    }
  };

  $scope.getDeleteButtonClass = function(task) {
    if (!(task.relationships && task.relationships.list)) {
      return 'right-of-three';
    } else {
      return 'right-of-two';
    }
  };
}

TasksController['$inject'] = ['$location', '$rootScope', '$routeParams', '$scope', 'DateService', 'SwiperService', 'UserSessionService', 'TasksService', 'AnalyticsService'];
angular.module('em.app').controller('TasksController', TasksController);
