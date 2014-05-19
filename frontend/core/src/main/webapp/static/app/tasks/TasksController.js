'use strict';

function TasksController($scope, DateService, SwiperService, UISessionService, TasksService, AnalyticsService) {

  var featureChangedCallback = function featureChangedCallback(name, data, state){
    if (name === 'taskEdit'){
      if (data){
        $scope.task = data;
      }else{
        $scope.task = {
          relationships: {}
        };
      }
      $scope.initializeTask($scope.task);
    }
  };
  UISessionService.registerFeatureChangedCallback(featureChangedCallback, 'TasksController');

  $scope.initializeTask = function(task){
    if (task.due) $scope.showDateInput = true;
    else $scope.showDateInput = false;
  };

  $scope.focusDate = function() {
    $scope.showDateInput = true;
  };

  $scope.hideDate = function() {
    $scope.showDateInput = false;
  };

  $scope.repeatTypes = ['daily', 'weekly', 'monthly', 'yearly'];

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

      if (!$scope.isFeatureActive('tasks')) {
        UISessionService.changeFeature('tasks', savedTask, mainSlidePath);
      }
      SwiperService.swipeToWithCallback(pageSlidePath);
    }
  };

  $scope.editTaskTitle = function(task) {
    AnalyticsService.do('editTaskTitle');
    TasksService.saveTask(task, UISessionService.getActiveUUID());
  };

  $scope.editTask = function(task) {
    UISessionService.changeFeature('taskEdit', task);
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

  $scope.deleteTask = function(task) {
    AnalyticsService.do('deleteTask');
    TasksService.deleteTask(task, UISessionService.getActiveUUID());
  };

  $scope.addSubtask = function(subtask, refreshScrollerAndScrollToFocusedAddElementCallback) {
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
    if (refreshScrollerAndScrollToFocusedAddElementCallback) refreshScrollerAndScrollToFocusedAddElementCallback();
  };

  $scope.taskQuickEditDone = function(task) {
    AnalyticsService.do('taskQuickEditDone');
    TasksService.saveTask(task, UISessionService.getActiveUUID());
  };
}

TasksController['$inject'] = ['$scope', 'DateService', 'SwiperService', 'UISessionService', 'TasksService', 'AnalyticsService'];
angular.module('em.app').controller('TasksController', TasksController);
