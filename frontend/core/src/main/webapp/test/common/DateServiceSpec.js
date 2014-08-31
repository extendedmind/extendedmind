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

 describe('DateService', function() {

  var DateService;

  beforeEach(function() {
    module('em.appTest');

    inject(function(_DateService_) {
      DateService = _DateService_;
    });

  });

  it('should detect day change', function() {
    // make today return tomorrow
    spyOn(DateService, 'getTodayYYYYMMDD').andCallFake(function() {
      var today =  new Date();
      var date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      var yyyy, mm, dd;
      yyyy = date.getFullYear().toString();
      mm = (date.getMonth() + 1).toString();
      dd = date.getDate().toString();
      return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]);
    });
    var currentWeek = DateService.generateAndReturnCurrentWeek(new Date());

    expect(DateService.isCurrentWeekValid(currentWeek))
    .toBe(false);
  });
});
