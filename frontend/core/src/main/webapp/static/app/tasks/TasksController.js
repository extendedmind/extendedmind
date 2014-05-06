'use strict';

function TasksController($location, $rootScope, $routeParams, $scope, DateService, SwiperService, UISessionService, TasksService, AnalyticsService) {

  // edit tasks or new task dialog
  if (!$scope.task) {
    if ($location.path().indexOf('/edit/' != -1) || $location.path().indexOf('/new' != -1)) {
      // edit task
      if ($routeParams.uuid) {
        $scope.task = TasksService.getTaskByUUID($routeParams.uuid, UISessionService.getActiveUUID());
        if ($scope.task.due) $scope.showDateInput = true;
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
  // existing task
  else {
    if ($scope.task.due) {
      $scope.showDateInput = true;
    }
  }

  $scope.focusDate = function() {
    $scope.showDateInput = true;
  };

  $scope.hideDate = function() {
    $scope.showDateInput = false;
  };

  $scope.repeatTypes = ['daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'yearly'];

  $scope.saveTask = function(task) {
    if (task.uuid) {
      AnalyticsService.do('saveTask', 'new');
    } else {
      AnalyticsService.do('saveTask', 'existing');
    }
    TasksService.saveTask(task, UISessionService.getActiveUUID()).then(gotoTask);

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
      if (!$scope.isFeatureActive('tasks')) {
        $scope.setActiveFeature('tasks');
      }
      $location.path(UISessionService.getOwnerPrefix());
    }
  };

  $scope.cancelEdit = function() {
    $scope.gotoPreviousPage();
  };

  $scope.addNew = function() {
    $location.path($scope.ownerPrefix + '/tasks/new');
  };

  $scope.editTaskTitle = function(task) {
    AnalyticsService.do('editTaskTitle');
    TasksService.saveTask(task, UISessionService.getActiveUUID());
  };

  $scope.editTask = function(task) {
    $location.path(UISessionService.getOwnerPrefix() + '/tasks/edit/' + task.uuid);
  };

  $scope.taskChecked = function(task) {
    if (task.completed) {
      AnalyticsService.do('uncompleteTask');
      TasksService.uncompleteTask(task, UISessionService.getActiveUUID());
    } else {
      AnalyticsService.do('completeTask');
      TasksService.completeTask(task, UISessionService.getActiveUUID());
    }
  };

  $scope.taskToList = function(task) {
    TasksService.taskToList(task, UISessionService.getActiveUUID());
    $location.path(UISessionService.getOwnerPrefix() + '/tasks/new/' + task.uuid);
  };

  $scope.deleteTask = function(task) {
    AnalyticsService.do('deleteTask');
    TasksService.deleteTask(task, UISessionService.getActiveUUID());
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

    TasksService.saveTask(subtaskToSave, UISessionService.getActiveUUID()).then(function(/*subtaskToSave*/) {
      AnalyticsService.do('addTask');
    });
  };

  $scope.taskQuickEditDone = function(task) {
    AnalyticsService.do('taskQuickEditDone');
    TasksService.saveTask(task, UISessionService.getActiveUUID());
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

TasksController['$inject'] = ['$location', '$rootScope', '$routeParams', '$scope', 'DateService', 'SwiperService', 'UISessionService', 'TasksService', 'AnalyticsService'];
angular.module('em.app').controller('TasksController', TasksController);
