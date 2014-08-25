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

 /* global $, angular */
'use strict';

// Originally from: https://raw.github.com/RyanBertrand/angularjs-modal-service
// with Bootstrap modals.js included within

angular.module('em.base').factory('ModalService', ["$document", "$compile", "$rootScope", "$controller", "$timeout",
    function ($document, $compile, $rootScope, $controller, $timeout) {

        // ####################################

        /* ========================================================================
         * Bootstrap: modal.js v3.1.1
         * http://getbootstrap.com/javascript/#modals
         * ========================================================================
         * Copyright 2011-2014 Twitter, Inc.
         * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
         * ======================================================================== */

        +function ($) {
          'use strict';

          // MODAL CLASS DEFINITION
          // ======================

          var Modal = function (element, options) {
            this.options   = options
            this.$element  = $(element)
            this.$backdrop =
            this.isShown   = null

            if (this.options.remote) {
              this.$element
                .find('.modal-content')
                .load(this.options.remote, $.proxy(function () {
                  this.$element.trigger('loaded.bs.modal')
                }, this))
            }
          }

          Modal.DEFAULTS = {
            backdrop: true,
            keyboard: true,
            show: true
          }

          Modal.prototype.toggle = function (_relatedTarget) {
            return this[!this.isShown ? 'show' : 'hide'](_relatedTarget)
          }

          Modal.prototype.show = function (_relatedTarget) {
            var that = this
            var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

            this.$element.trigger(e)

            if (this.isShown || e.isDefaultPrevented()) return

            this.isShown = true

            this.escape()

            this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

            this.backdrop(function () {
              var transition = $.support.transition && that.$element.hasClass('fade')

              if (!that.$element.parent().length) {
                that.$element.appendTo(document.body) // don't move modals dom position
              }

              that.$element
                .show()
                .scrollTop(0)

              if (transition) {
                that.$element[0].offsetWidth // force reflow
              }

              that.$element
                .addClass('in')
                .attr('aria-hidden', false)

              that.enforceFocus()

              var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

              transition ?
                that.$element.find('.modal-dialog') // wait for modal to slide in
                  .one($.support.transition.end, function () {
                    that.$element.trigger('focus').trigger(e)
                  })
                  .emulateTransitionEnd(300) :
                that.$element.trigger('focus').trigger(e)
            })
          }

          Modal.prototype.hide = function (e) {
            if (e) e.preventDefault()

            e = $.Event('hide.bs.modal')

            this.$element.trigger(e)

            if (!this.isShown || e.isDefaultPrevented()) return

            this.isShown = false

            this.escape()

            $(document).off('focusin.bs.modal')

            this.$element
              .removeClass('in')
              .attr('aria-hidden', true)
              .off('click.dismiss.bs.modal')

            $.support.transition && this.$element.hasClass('fade') ?
              this.$element
                .one($.support.transition.end, $.proxy(this.hideModal, this))
                .emulateTransitionEnd(300) :
              this.hideModal()
          }

          Modal.prototype.enforceFocus = function () {
            $(document)
              .off('focusin.bs.modal') // guard against infinite focus loop
              .on('focusin.bs.modal', $.proxy(function (e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                  this.$element.trigger('focus')
                }
              }, this))
          }

          Modal.prototype.escape = function () {
            if (this.isShown && this.options.keyboard) {
              this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
                e.which == 27 && this.hide()
              }, this))
            } else if (!this.isShown) {
              this.$element.off('keyup.dismiss.bs.modal')
            }
          }

          Modal.prototype.hideModal = function () {
            var that = this
            this.$element.hide()
            this.backdrop(function () {
              that.removeBackdrop()
              that.$element.trigger('hidden.bs.modal')
            })
          }

          Modal.prototype.removeBackdrop = function () {
            this.$backdrop && this.$backdrop.remove()
            this.$backdrop = null
          }

          Modal.prototype.backdrop = function (callback) {
            var animate = this.$element.hasClass('fade') ? 'fade' : ''

            if (this.isShown && this.options.backdrop) {
              var doAnimate = $.support.transition && animate

              this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
                .appendTo(document.body)

              this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
                if (e.target !== e.currentTarget) return
                this.options.backdrop == 'static'
                  ? this.$element[0].focus.call(this.$element[0])
                  : this.hide.call(this)
              }, this))

              if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

              this.$backdrop.addClass('in')

              if (!callback) return

              doAnimate ?
                this.$backdrop
                  .one($.support.transition.end, callback)
                  .emulateTransitionEnd(150) :
                callback()

            } else if (!this.isShown && this.$backdrop) {
              this.$backdrop.removeClass('in')

              $.support.transition && this.$element.hasClass('fade') ?
                this.$backdrop
                  .one($.support.transition.end, callback)
                  .emulateTransitionEnd(150) :
                callback()

            } else if (callback) {
              callback()
            }
          }


          // MODAL PLUGIN DEFINITION
          // =======================

          var old = $.fn.modal

          $.fn.modal = function (option, _relatedTarget) {
            return this.each(function () {
              var $this   = $(this)
              var data    = $this.data('bs.modal')
              var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

              if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
              if (typeof option == 'string') data[option](_relatedTarget)
              else if (options.show) data.show(_relatedTarget)
            })
          }

          $.fn.modal.Constructor = Modal


          // MODAL NO CONFLICT
          // =================

          $.fn.modal.noConflict = function () {
            $.fn.modal = old
            return this
          }


          // MODAL DATA-API
          // ==============

          $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
            var $this   = $(this)
            var href    = $this.attr('href')
            var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
            var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

            if ($this.is('a')) e.preventDefault()

            $target
              .modal(option, this)
              .one('hide', function () {
                $this.is(':visible') && $this.trigger('focus')
              })
          })

          $(document)
            .on('show.bs.modal', '.modal', function () { $(document.body).addClass('modal-open') })
            .on('hidden.bs.modal', '.modal', function () { $(document.body).removeClass('modal-open') })

        }(jQuery);

        // ####################################

        var defaults = {
            id: null,
            template: null,
            templateUrl: null,
            title: 'Default Title',
            backdrop: true,
            asyncSuccess: false,
            success: {label: 'OK', fn: null},
            cancel: {label: 'Close', fn: null},
            controller: null, //just like route controller declaration
            backdropClass: "modal-backdrop",
            footerTemplate: null,
            modalClass: "modal",
            css: {

            },
            showHeader: false,
            showHeaderCloseButton: true,
            removeOnDismiss: true,
            allowKeyboardDismiss: true,
            allowBackdropDismiss: true
        };
        var body = $document.find('body');

        return {
          createDialog: function(templateUrl/*optional*/, options, passedInLocals) {
            // Handle arguments if optional template isn't provided.
            if (angular.isObject(templateUrl)) {
                passedInLocals = options;
                options = templateUrl;
            } else {
                options.templateUrl = templateUrl;
            }

            options = angular.extend({}, defaults, options); //options defined in constructor

            //Do we have an ID element?
            if (!options.id) {
                //Set the id to a random to not clash with other elements
                options.id = 'modal-' + Date.now().toString();
            }

            //DOM Builders
            var buildModalDismissOptions = function () {
                var dismissOptions = '';
                if (options.backdrop){
                  if (!options.allowBackdropDismiss) dismissOptions = ' data-backdrop="static" ';
                }else{
                  // Disable backdrop altogether
                  dismissOptions = ' data-backdrop="false" ';
                }
                if (!options.allowKeyboardDismiss) {
                    //For built in Boostrap ESC support
                    dismissOptions = dismissOptions + ' data-keyboard="false" ';
                }

                return dismissOptions;
            };

            var buildModalHeader = function () {
                var defaultHeaderTail =
                    '    <button ng-show="$showHeaderCloseButton" type="button" class="close" ng-click="$modalCancel()">&times;</button>' +
                    '    <h2 ng-show="$showHeader">{{$title}}</h2>' +
                    '  </div>';

                if (options.showHeader) {
                    return '  <div class="modal-header">' + defaultHeaderTail;
                }
                else {
                    //Add some padding for the close button
                    if (options.showHeaderCloseButton) {
                        return '<div style="height: 22px; padding-right: 10px">' + defaultHeaderTail;
                    }
                    else {
                        return '';
                    }
                }
            };

            var buildModalBody = function () {
                if (options.template) {
                    if (angular.isString(options.template)) {
                        // Simple string template
                        return '<div class="modal-body">' + options.template + '</div>';
                    } else {
                        // jQuery/JQlite wrapped object
                        return '<div class="modal-body">' + options.template.html() + '</div>';
                    }
                } else {
                    // Template url
                    return '<div class="modal-body" ng-include="\'' + options.templateUrl + '\'"></div>';
                }
            };

            var buildModalFooter = function () {
                var footerContents = null;
                if (options.footerTemplate) {
                    footerContents = options.footerTemplate;
                }
                else if (options.footerTemplateUrl){
                  // Include footer from url
                  return '<div class="modal-footer" ng-include="\'' + options.footerTemplateUrl + '\'"></div>';
                }else{
                  //Default Footer
                  footerContents = '><button class="btn" ng-click="$modalCancel()">{{$modalCancelLabel}}</button>' +
                      '<button class="btn btn-primary" ng-click="$modalSuccess()">{{$modalSuccessLabel}}</button>';
                }

                return '<div class="modal-footer">' +
                    footerContents +
                    '</div>';
            };

            var key;
            var idAttr = ' id="' + options.id + '" ';
            var modalElementID = '#' + options.id;

            var dismissOptions = buildModalDismissOptions();
            var modalHeader = buildModalHeader();
            var modalBody = buildModalBody();
            var modalFooter = buildModalFooter();

            //We don't have the scope we're gonna use yet, so just get a compile function for modal
            var modalEl = angular.element(
                '<div class="' + options.modalClass + ' fade"' + idAttr + dismissOptions + '>' +
                    '<div class="modal-dialog"><div class="modal-content">' +
                    modalHeader +
                    modalBody +
                    modalFooter +
                    '</div></div></div>');

            for (key in options.css) {
                modalEl.css(key, options.css[key]);
            }

            var handleEscPressed = function (event) {
                if (event.keyCode === 27) {
                    scope.$modalCancel();
                }
            };

            var closeFn = function () {
                if (options.allowKeyboardDismiss) {
                    body.unbind('keydown', handleEscPressed);
                }

                $(modalElementID).modal('hide');
            };

            if (options.allowKeyboardDismiss) {
                body.bind('keydown', handleEscPressed);
            }


            var ctrl, locals,
                scope = options.scope || $rootScope.$new();

            scope.$title = options.title;
            scope.$showHeader = options.showHeader;
            scope.$showHeaderCloseButton = options.showHeaderCloseButton;
            scope.$modalClose = closeFn;
            scope.$modalCancel = function () {
                var callFn = options.cancel.fn || closeFn;
                callFn.call(this);
                scope.$modalClose();
            };
            scope.$modalSuccess = function () {
                var callFn = options.success.fn || closeFn;
                if (options.asyncSuccess){
                  callFn(this, scope.$modalClose, options.success.fnParam, options.success.fnParamParam, options.success.fnPromise);
                }else{
                  callFn.call(this);
                  scope.$modalClose();
                }
            };
            scope.$modalSuccessLabel = options.success.label;
            scope.$modalCancelLabel = options.cancel.label;

            if (options.controller) {
                locals = angular.extend({$scope: scope}, passedInLocals);
                ctrl = $controller(options.controller, locals);
                // Yes, ngControllerController is not a typo
                modalEl.contents().data('$ngControllerController', ctrl);
            }

            $compile(modalEl)(scope);
            body.append(modalEl);

            if (!passedInLocals || (passedInLocals && !passedInLocals.deferredShow)) {
              $timeout(function () {
                $(modalElementID).modal('show');
              }, 200);
            }

            if (options.removeOnDismiss) {
                //Setup the Bootstrap callback to remove from the modal when dismissed
                $(modalElementID).on('hidden.bs.modal', function () {
                    //Remove from the DOM
                    var elem = document.getElementById(options.id);
                    elem.parentNode.removeChild(elem);
                });
            }
          }
        };
    }]);