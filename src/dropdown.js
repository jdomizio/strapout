/**
 * Created by Jason on 8/23/2014.
 */
define(['jquery', 'knockout', 'bootstrap'], function($, ko, bs) {
    "use strict";
    var sharedOverlay;

    // TODO: Refactor DropOverlay out of dropdown
    function DropOverlay() {
        this.isShowing = false;
        this.currentTimeout = null;
        this.currentOverlay = null;
    }

    DropOverlay.prototype.hide = function(time) {
        var self = this;

        time = arguments.length ? time : 100;

        this.currentTimeout = window.setTimeout(function() {
            $('.kobs-overlay').fadeOut(time, function () {
                $(this).remove();
            });
            self.isShowing = false;
            self.currentTimeout = null;
            self.currentOverlay = null;
        }, 200);
    };

    DropOverlay.prototype.create = function($element, options) {
        var container, i, len;

        if(this.currentTimeout) {
            window.clearTimeout(this.currentTimeout);
            $(this.currentOverlay).off('click touchstart');
            if(options.click) {
                $(this.currentOverlay).on('click touchstart', function(e) {
                    options.click(e);
                });
            }
            return;
        }

        container = $('<div/>');
        container.addClass('kobs-overlay');
        if(options.overlayWrapClasses) {

            for(i = 0, len = options.overlayWrapClasses.length; i < len; ++i) {
                container.addClass(options.overlayWrapClasses[i]);
            }
        }
//            if(options.overlayDepth) {
//                container.attr('style', 'z-index: ' + options.overlayDepth + ' !important;');
//            }

        var overlay = $('<div/>');
        if(options.overlayClasses) {

            for(i = 0, len = options.overlayClasses.length; i < len; ++i) {
                overlay.addClass(options.overlayClasses[i]);
            }
        }
        if(options.overlayDepth) {
            overlay.attr('style', 'z-index: ' + options.overlayDepth + ' !important;');
        }

        container.append(overlay);

        if(options.click) {
            container.on('click touchstart', function(e){
                options.click(e);
            });
        }

        this.currentOverlay = container;

        $element.append(container).fadeIn(100);
        this.isShowing = true;
    };

    sharedOverlay = new DropOverlay();

    function Dropdown() {
        this.isOpen = false;
        this.initElement = null;
    }

    Dropdown.prototype.init = function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value, onOpen, onClose, $element, $elementParent, clickHandler, self = this;

        value = new DropdownViewModel(valueAccessor());
        if(value.overlayCloseOnClick) {
            value.click = function() {
                self.close(element);
            };
        }
        $element = $(element);

        if (!$element.attr('data-toggle')) {
            $element.attr('data-toggle', 'dropdown');
        }
        $element.dropdown();

        // handle opening / closing via subscription
        if (value.isOpen && ko.isSubscribable(value.isOpen)) {

            /* Remove click handler from element so we can handle it instead */
            $element.off('click.bs.dropdown');

            /* Remove data-api click handler from element so it doesn't override us */
            $(element).on('click.bs.dropdown.data-api', function (e) {
                e.stopPropagation();
            });

            value.isOpen.subscribe(function (v) {
                if (v) {
                    self.open(element);
                }
                else {
                    self.close(element);
                }
            });
        }

        // handle updating isOpen if something other than us closed the menu
        if (ko.isWriteableObservable(value.isOpen)) {
            $elementParent = $element.parent();

            $elementParent.on('show.bs.dropdown', function () {
                if (value.slide) {
                    $(this).find('.dropdown-menu').first().stop(true, true).slideDown();
                }
                else if (value.fade) {
                    $(this).find('.dropdown-menu').first().stop(true, true).fadeIn();
                }

                if(value.showOverlay) {
                    sharedOverlay.create($(value.overlayTarget), value);
                }

                value.isOpen(true);
                if (typeof value.onOpen === 'function') {
                    value.onOpen();
                }
            });
            $elementParent.on('hidden.bs.dropdown', function () {
                if (value.slide) {
                    $(this).find('.dropdown-menu').first().stop(true, true).slideUp();
                    sharedOverlay.hide();
                }
                else if (value.fade) {
                    $(this).find('.dropdown-menu').first().stop(true, true).fadeOut();
                    sharedOverlay.hide();
                }
                else {
                    sharedOverlay.hide(0);
                }

                // handle the case where external event closes us
                if(self.isOpen) {
                    self.isOpen = false;
                }
                value.isOpen(false);
                if (typeof value.onClose === 'function') {
                    value.onClose();
                }
            });
        }

        // handle click
        ko.applyBindingsToNode(element, {
            'click': function () {
                self.toggle(self.isOpen, value.isOpen);
            }
        });

        return {
            controlsDescendantBindings: false
        };
    };

    Dropdown.prototype.update = function () { };

    Dropdown.prototype.open = function (element) {
        if (!this.isOpen) {
            $(element).dropdown('toggle');
            this.isOpen = true;
        }
    };

    Dropdown.prototype.close = function (element) {
        if (this.isOpen) {
            $(element).dropdown('toggle');
            this.isOpen = false;
        }
    };

    /**
     * Toggles state of isOpen based on value
     * @param value - the current state of the dropDown (true - open, false - closed)
     * @param isOpen - an observable that holds the state of whether the dropdown is open
     */
    Dropdown.prototype.toggle = function (isCurrentlyOpen, isOpen) {
        isOpen(!isCurrentlyOpen);
    };

    var handler = new Dropdown();
    ko.bindingHandlers['dropdown'] = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            (new Dropdown()).init(element, valueAccessor, allBindings, viewModel, bindingContext);
        }
    };

    function DropdownViewModel(data) {
        data = data || {};
        this.isOpen = data.isOpen || ko.observable(false);

        this.slide = data.slide || false;
        this.fade = data.fade || false;
        this.onOpen = data.onOpen;

        this.showOverlay = data.showOverlay || false;
        this.overlayDepth = data.overlayDepth || '100';
        this.overlayTarget = data.overlayTarget || '.kobs-overlay-target'
        this.overlayWrapClasses = data.overlayWrapClasses || ['overlay-wrapper'];
        this.overlayClasses = data.overlayClasses || ['overlay'];
        this.overlayCloseOnClick = typeof data.overlayCloseOnClick === 'undefined' ? true : data.overlayCloseOnClick;
    }

    return {
        Dropdown: Dropdown,
        ViewModel: DropdownViewModel
    };
});