/* Copyright 2013-2015 Extended Mind Technologies Oy
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

function ContentService($q, BackendClientService) {

  var publicExtendedMindNoteRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    /public\/extended-mind\//.source +
    /[0-9a-z-]+/.source +
    '$'
    );

  var _md;
  function mardown(){
    if (!_md){
      _md = window.markdownit({breaks: true});

      // Remember old renderer, if overriden, or proxy to default renderer
      var defaultRender = _md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

      _md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        // If you are sure other plugins can't add `target` - drop check below
        var aIndex = tokens[idx].attrIndex('target');

        if (aIndex < 0) {
          tokens[idx].attrPush(['target', '_blank']); // add new attribute
        } else {
          tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
        }

        // pass token to default renderer.
        return defaultRender(tokens, idx, options, env, self);
      };
    }
    return _md;
  }

  function getPublicExtendedMindNote(pathPostfix){
    return $q(function(resolve, reject) {
      BackendClientService.get('/api/public/extended-mind/' + pathPostfix,
                               publicExtendedMindNoteRegexp, true).then(function(publicNoteResponse){
        var messageParams = {
          messageHeading: publicNoteResponse.note.title,
          messageIngress: publicNoteResponse.note.description,
          messageHtml: publicNoteResponse.note.content ?
            mardown().render(publicNoteResponse.note.content) : undefined,
          confirmText: 'close'
        };
        resolve(messageParams);
      },function(error){
        reject(error);
      });
    });
  }

  return {
    getHighlightedTextInstruction: function(text) {
      return $q(function(resolve, reject) {
        switch (text){
        case 'get done':
          resolve(getPublicExtendedMindNote('get-done'));
          break;
        default:
          reject();
          break;
        }
      });
    },
    publicExtendedMindNoteRegex: publicExtendedMindNoteRegexp
  };
}
ContentService['$inject'] = ['$q', 'BackendClientService'];
angular.module('em.base').factory('ContentService', ContentService);
