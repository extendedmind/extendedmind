/* Copyright 2013-2017 Extended Mind Technologies Oy
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

 function TimestampFormatterService($filter) {
  return {
    formatToLocaleTime: function(date, useHour12) {
      if (useHour12) {
        // e.g. 9:35 am
        return $filter('date')(date, 'h:mm a').toLowerCase();
      } else {
        // e.g. 09:35
        return $filter('date')(date, 'HH:mm');
      }
    },
    formatToLocaleTimeWithDate: function(date, useHour12) {
      var formattedDate;
      if (useHour12) {
        // e.g. tue 1 september 9:35 am
        formattedDate = $filter('date')(date, 'h:mm a EEE d MMM');
      } else {
        // e.g. tue 1 september 09:35
        formattedDate = $filter('date')(date, 'HH:mm EEE d MMM');
      }
      return formattedDate.toLowerCase();
    },
    formatToLocaleDateWithTime: function(date, useHour12) {
      var formattedDate;
      if (useHour12) {
        // e.g. tue 1 september 9:35 am
        formattedDate = $filter('date')(date, 'EEE d MMMM y h:mm a');
      } else {
        // e.g. tue 1 september 09:35
        formattedDate = $filter('date')(date, 'EEE d MMMM y HH:mm');
      }
      return formattedDate.toLowerCase();
    }
  };
 }
 TimestampFormatterService['$inject'] = ['$filter'];
 angular.module('common').factory('TimestampFormatterService', TimestampFormatterService);
