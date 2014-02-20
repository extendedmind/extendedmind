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
  // A simple boolean lock that signals if head & remove/setOffline process
  // is currently in progress
  // NOTE: Might needs upgrading to proper mutex if web workers and thus
  //       multiple threads are used.
  var processing = false;

  // Initialize variables from local storage when service 
  // is created
  if (localStorage.getItem('primaryRequest')) primary = JSON.parse(localStorage.getItem('primaryRequest'));
  if (localStorage.getItem('secondaryRequest')) secondary = JSON.parse(localStorage.getItem('secondaryRequest'));
  if (localStorage.getItem('requestQueue')) queue = JSON.parse(localStorage.getItem('requestQueue'));

  // Find index of a reversible item in queue
  function findReverseRequestIndex(request) {
    if (request.reverse) {
      for (var i=0, len=queue.length; i<len; i++) {
        if (request.reverse.url === queue[i].url &&
            request.reverse.method === queue[i].method){
          // Found a reverse of the request in the queue
          return i;
        }
      }
    }
  }

  // Find index of request with same uuid as given request
  function findRequestIndex(request) {
    for (var i=0, len=queue.length; i<len; i++) {
      if (request.uuid === queue[i].uuid){
        return i;
      }
    }
  }

  function pushToQueue(request) {
    queue.push(request);
    localStorage.setItem('requestQueue', JSON.stringify(queue));
  }

  function removeFromQueue(index) {
    queue.splice(index, 1);
    localStorage.setItem('requestQueue', JSON.stringify(queue));
  }

  var service = {
    push: function(request) {
      if (request.primary){
        if (!primary){
          primary = request;
          localStorage.setItem('primaryRequest', JSON.stringify(primary));
        }
      }else if (request.secondary){
        if (!secondary){
          secondary = request;
          localStorage.setItem('secondaryRequest', JSON.stringify(secondary));
        }
      }else{
        var reverseRequestIndex = findReverseRequestIndex(request);
        if (reverseRequestIndex !== undefined && reverseRequestIndex.offline){
          removeFromQueue(reverseRequestIndex);
        }else {
          pushToQueue(request);
        }
      }
    },
    remove: function(request) {
      if (primary && primary.uuid === request.uuid){
        primary = undefined;
        localStorage.setItem('primaryRequest', undefined);
      }else if (secondary && secondary.uuid === request.uuid){
        secondary = undefined;
        localStorage.setItem('secondaryRequest', undefined);
      }else{
        var requestIndex = findRequestIndex(request.uuid);
        if (requestIndex !== undefined){
          removeFromQueue(requestIndex);
        }
      }
      // Release lock
      processing = false;
    },
    setOffline: function (request) {
      if (primary && primary.uuid === request.uuid){
        primary.offline = true;
        localStorage.setItem('primaryRequest', JSON.stringify(primary));
      }else if (secondary && secondary.uuid === request.uuid){
        secondary.offline = true;
        localStorage.setItem('secondaryRequest', JSON.stringify(secondary));
      }else{
        var requestIndex = findRequestIndex(request.uuid);
        if (requestIndex !== undefined){
          queue[requestIndex].offline = true;
          localStorage.setItem('requestQueue', JSON.stringify(queue));
        }else {
          // This shouldn't happen, but if it does, I guess we want to retry
          request.offline = true;
          pushToQueue(request);
        }
      }
      // Release lock
      processing = false;
    },
    head: function () {
      if (processing){
        // Lock processing
        processing = true;
        if (primary){
          return primary;
        }else if (secondary){
          return secondary;
        }else if (queue && queue.length > 0){
          return queue[0];
        }
      }
    }
  };
  return service;
}
angular.module('em.services').factory('HttpRequestQueueService', HttpRequestQueueService);