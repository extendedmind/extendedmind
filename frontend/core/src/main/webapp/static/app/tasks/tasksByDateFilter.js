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

 function tasksByDate(DateService) {
  return function(tasks, date, passthrough) {
    // Return unfiltered task.
    if (passthrough) {
      return tasks;
    }

    var filteredItems = [];
    if (tasks && tasks.length) {

      // Tasks with 'no date'.
      if (date === null) {
        for (var i = 0, len = tasks.length; i < len; i++) {
          if (!tasks[i].due) filteredItems.push(tasks[i]);
        }
        return filteredItems;
      }

      var today = DateService.getTodayYYYYMMDD();
      var todayMidnight = new Date().setHours(0, 0, 0, 0);

      for (var k = 0, kLen = tasks.length; k < kLen; k++) {
        var task = tasks[k];
        if (task.due) {
          // Match tasks with given date, or if date is today match also overdue tasks
          if (task.due === date || (date === today && task.due < today)) {
            // Don't add completed tasks to future dates or tasks that were completed before today
            if (!(task.trans.completed && date > today) &&
                !(task.trans.completed && task.trans.completed < todayMidnight))
            {
              filteredItems.push(task);
              continue;
            }
          }
        }
        // But do add all tasks that were completed today to today's tasks
        if (date === today && task.trans.completed && task.trans.completed > todayMidnight) {
          filteredItems.push(task);
        }
      }
    }
    return filteredItems;
  };
}
angular.module('em.tasks').filter('tasksByDate', tasksByDate);
