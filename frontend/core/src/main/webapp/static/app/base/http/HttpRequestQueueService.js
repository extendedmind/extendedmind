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

 /* global angular */
 'use strict';

/*
* Stores all requests into local storage
*/
function HttpRequestQueueService() {

  // Primary is the first every time, secondary the second
  var primary, secondary;
  // After primary and secondary there is a FIFO queue
  var queue = [];
  // Before last is executed, well, before the last
  var beforeLast;
  // Last request is executed last
  var last;
  // A simple boolean lock that signals if head & remove/setOffline process
  // is currently in progress
  // NOTE: Might needs upgrading to proper mutex if web workers with
  //       multiple threads are used.
  var processing = false;

  // Initialize variables from local storage when service
  // is created
  if (localStorage.getItem('primaryRequest')) {
    primary = JSON.parse(localStorage.getItem('primaryRequest'));
  }
  if (localStorage.getItem('secondaryRequest')) {
    secondary = JSON.parse(localStorage.getItem('secondaryRequest'));
  }
  if (localStorage.getItem('requestQueue')) {
    queue = JSON.parse(localStorage.getItem('requestQueue'));
  }
  if (localStorage.getItem('beforeLastRequest')) {
    beforeLast = JSON.parse(localStorage.getItem('beforeLastRequest'));
  }
  if (localStorage.getItem('lastRequest')) {
    last = JSON.parse(localStorage.getItem('lastRequest'));
  }

  // Find index of a reversible item in queue
  function findReverseRequestIndex(request) {
    for (var i=0, len=queue.length; i<len; i++) {
      if (queue[i].params && queue[i].params.reverse &&
        request.content.url === queue[i].params.reverse.url &&
        request.content.method === queue[i].params.reverse.method) {
          // Found a reverse of the request in the queue
        return i;
      }
    }
  }

  // Returns true if there is the same request in the queue
  function findReplaceableRequestIndex(request) {
    for (var i=0, len=queue.length; i<len; i++) {
      if (queue[i].params && queue[i].params.replaceable &&
          request.content.url === queue[i].content.url &&
          request.content.method === queue[i].content.method) {
        // Found a replaceable request from the queue
        return i;
      }
    }
  }

  // Find index of request with same uuid as given request
  function findRequestIndex(request) {
    for (var i=0, len=queue.length; i<len; i++) {
      if (request === queue[i]) {
        return i;
      }
    }
  }

  function pushToQueue(request) {
    queue.push(request);
    persistQueue();
  }

  function removeFromQueue(index) {
    queue.splice(index, 1);
    persistQueue();
  }

  function persistQueue() {
    if (queue.length === 0) {
      localStorage.removeItem('requestQueue');
    } else {
      localStorage.setItem('requestQueue', JSON.stringify(queue));
    }
  }

  function getHead(skipSecondary) {
    if (primary) {
      return primary;
    } else if (secondary && !skipSecondary) {
      return secondary;
    } else if (queue && queue.length > 0) {
      return queue[0];
    } else if (beforeLast) {
      return beforeLast;
    } else if (last) {
      return last;
    }
  }

  function pruneQueue(request){
    var reverseRequestIndex = findReverseRequestIndex(request);
    if (reverseRequestIndex !== undefined &&
      (getHead() !== queue[reverseRequestIndex] || queue[reverseRequestIndex].offline)) {
        // Found reverse method that is either not the head or is the head but has been set offline
      removeFromQueue(reverseRequestIndex);
      return false;
    }
    var replaceableIndex = findReplaceableRequestIndex(request);
    if (replaceableIndex !== undefined){
      if (queue[replaceableIndex].content.data === undefined && request.content.data === undefined){
        // The method does not have a payload, we just stop here. This happens e.g. for
        // delete, where second identical call will fail with "already deleted" if this is not done.
        return false;
      }else if (getHead() !== queue[replaceableIndex] || queue[replaceableIndex].offline){
        // There is data to be replaced, and the request is not the head, or is the head but
        // not on its way to the server: just replace
        queue[replaceableIndex].content.data = request.content.data;
        persistQueue();
        return false;
      }
    }
    return true;
  }

  var service = {
    push: function(request) {
      if (request.primary) {
        if (!primary || primary.offline) {
          primary = request;
          localStorage.setItem('primaryRequest', JSON.stringify(primary));
        }
      } else if (request.secondary) {
        if (!secondary || secondary.offline) {
          secondary = request;
          localStorage.setItem('secondaryRequest', JSON.stringify(secondary));
        }
      } else if (request.beforeLast) {
        if (!beforeLast || beforeLast.offline) {
          beforeLast = request;
          localStorage.setItem('beforeLastRequest', JSON.stringify(beforeLast));
        }
      } else {
        if (pruneQueue(request)){
          pushToQueue(request);
        }else{
          return false;
        }
      }
      return true;
    },
    concatLastContentDataArray: function(request) {
      if (!last) {
        last = request;
      } else {
        // last already exists, concat the data from this request to
        // the end of the data array in the last request
        last.content.data = last.content.data.concat(request.content.data);
      }
      localStorage.setItem('lastRequest', JSON.stringify(last));
    },
    remove: function(request) {
      if (request.primary) {
        primary = undefined;
        localStorage.removeItem('primaryRequest');
      } else if (request.secondary) {
        secondary = undefined;
        localStorage.removeItem('secondaryRequest');
      } else if (request.beforeLast) {
        beforeLast = undefined;
        localStorage.removeItem('beforeLastRequest');
      } else if (request.last) {
        last = undefined;
        localStorage.removeItem('lastRequest');
      } else {
        var requestIndex = findRequestIndex(request);
        if (requestIndex !== undefined) {
          removeFromQueue(requestIndex);
        }
      }
      // Release lock
      processing = false;
    },
    setOffline: function(request) {
      if (request.primary) {
        primary.offline = true;
        localStorage.setItem('primaryRequest', JSON.stringify(primary));
      } else if (request.secondary) {
        secondary.offline = true;
        localStorage.setItem('secondaryRequest', JSON.stringify(secondary));
      } else if (request.beforeLast) {
        beforeLast.offline = true;
        localStorage.setItem('beforeLastRequest', JSON.stringify(beforeLast));
      } else {
        var requestIndex = findRequestIndex(request);
        if (requestIndex !== undefined) {
          queue[requestIndex].offline = true;
          // We want to retry to see if there are reverse or replaceable items in the queue
          if (pruneQueue(queue[requestIndex])){
            persistQueue();
          }else{
            removeFromQueue(requestIndex);
          }
        } else {
          // This shouldn't happen, but if it does, I guess we want to retry
          request.offline = true;
          pushToQueue(request);
        }
      }
      // Release lock
      processing = false;
    },
    releaseLock: function() {
      processing = false;
    },
    getHead: function(skipSecondary) {
      if (!processing) {
        var headRequest = getHead(skipSecondary);
        if (headRequest) {
          processing = true;
          return headRequest;
        }
      }
    },
    isPrimaryHead: function() {
      if (primary) return true;
    },
    getQueue: function() {
      return queue;
    },
    saveQueue: function() {
      persistQueue();
    },
    clearPrimary: function() {
      if (!processing && primary) {
        primary = undefined;
        localStorage.removeItem('primaryRequest');
      }
    }
  };
  return service;
}
angular.module('em.base').factory('HttpRequestQueueService', HttpRequestQueueService);
