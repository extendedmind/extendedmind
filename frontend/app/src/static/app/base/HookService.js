/* Copyright 2013-2016 Extended Mind Technologies Oy
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

function HookService($q) {

  // List all available hooks here with default implementation.
  // The easiest way to extend functionality is to override this service,
  // with custom hooks.
  return {
    setInboxId: function() {
      return $q(function(resolve){resolve();});
    },
    initializeEntryControllerScope: function(entryControllerScope){
      return true;
    },
    startEntryTutorial: function(entryControllerScope){
      return true;
    },
    swipeToEntryLogin: function(entryControllerScope){
      return true;
    }
  };
}
HookService['$inject'] = ['$q'];
angular.module('em.base').factory('HookService', HookService);
