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

 function DetectBrowserService() {
  return {
    // http://stackoverflow.com/a/14223920
    getIosVersion: function() {
      if (this.isIos()) {
        // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
        var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
        return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
      }
    },
    isAndroid: function() {
      return /Android/i.test(navigator.userAgent);
    },
    isIos: function() {
      return /iP(hone|od|ad)/.test(navigator.platform);
    },
    isMobile: function() {
      return this.isAndroid() || this.isIos();
    },
    /*
    * It's generally better to use feature/object detection instead of a browser detection. This somewhat
    * works even though it detects other WebKit browsers as well, e.g. Safari and Opera, but the app it
    * optimized primary for Chrome/Chromium and secondary for WebKit.
    * http://stackoverflow.com/a/13348618
    */
    isChrome: function() {
      return window.chrome !== undefined;
    }
  };
}
angular.module('common').factory('DetectBrowserService', DetectBrowserService);
