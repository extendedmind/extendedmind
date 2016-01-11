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

function ContentService($q, BackendClientService, PlatformService) {

  var publicExtendedMindNoteRegexp = new RegExp(
    /^/.source +
    BackendClientService.apiPrefixRegex.source +
    /public\/extended-mind\//.source +
    /[0-9a-z-]+/.source +
    '$'
    );
  var privacyRegexp = new RegExp(
    /^/.source +
    /\/static\/privacy\.html/.source +
    '$'
    );
  var termsRegexp = new RegExp(
    /^/.source +
    /\/static\/terms\.html/.source +
    '$'
    );

  var _md;
  function markdown(){
    if (!_md){
      _md = window.markdownit({breaks: true});

      // Remember old renderer, if overriden, or proxy to default renderer
      var defaultRender = _md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

      _md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        var targetValue = '_blank'

        if (PlatformService.isSupported('openLinkExternal')){
          var hrefIndex = tokens[idx].attrIndex('href');
          if (hrefIndex >= 0 ){
            // HACK: Use target as a temporary storage for URL, because no other attribute seems to stick
            // at this point in Markdown-IT. bindPreprocessedHtml.js changes the target attribute it to a
            // nicer 'data-href' before compiling the link.
            targetValue = tokens[idx].attrs[hrefIndex][1];
            tokens[idx].attrs.splice(hrefIndex, 1);
            tokens[idx].attrPush(['class', 'clickable']);
          }
        }
        var targetIndex = tokens[idx].attrIndex('target');
        if (targetIndex < 0) {
          tokens[idx].attrPush(['target', targetValue]); // add new attribute
        } else {
          tokens[idx].attrs[targetIndex][1] = targetValue;    // replace value of existing attr
        }
        // pass token to default renderer.
        return defaultRender(tokens, idx, options, env, self);
      };
    }
    return _md;
  }

  function onExternalLinkClick(clickEvent){
    console.log(clickEvent)
  }

  function getPublicExtendedMindNote(pathPostfix){
    return $q(function(resolve, reject) {
      BackendClientService.get('/api/public/extended-mind/' + pathPostfix,
                               publicExtendedMindNoteRegexp, true).then(function(publicNoteResponse){
        var messageParams = {
          messageHeading: publicNoteResponse.note.title,
          messageIngress: publicNoteResponse.note.description,
          messageHtml: publicNoteResponse.note.content ?
            markdown().render(publicNoteResponse.note.content) : undefined,
          confirmText: 'close'
        };
        resolve(messageParams);
      },function(error){
        reject(error);
      });
    });
  }

  function getExternalHtml(path, regex){
    return $q(function(resolve, reject) {
      BackendClientService.get(path, regex, true).then(function(response){
        resolve(response);
      }, function(error){
        reject(error);
      });
    });
  }

  return {
    getExternalHtml: function(type) {
      return $q(function(resolve, reject) {
        switch (type){
        case 'privacy':
          resolve(getExternalHtml('/static/privacy.html', privacyRegexp));
          break;
        case 'terms':
          resolve(getExternalHtml('/static/terms.html', termsRegexp));
          break;
        default:
          reject();
          break;
        }
      });
    },
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
    publicExtendedMindNoteRegex: publicExtendedMindNoteRegexp,
    privacyRegex: privacyRegexp,
    termsRegex: termsRegexp
  };
}
ContentService['$inject'] = ['$q', 'BackendClientService', 'PlatformService'];
angular.module('em.base').factory('ContentService', ContentService);
