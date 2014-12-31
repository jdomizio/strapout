/**
 * Created by jdomizio on 12/31/2014.
 */
define(function(require) {
    'use strict';

    var ko = require('knockout'),
        $ = require('jquery');

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

    var sharedOverlay = new DropOverlay();







    function bindingHandler(Type, method) {
        return function (element, valueAccessor, allBindings) {
            var params = valueAccessor(),
                instance;

            instance = (params instanceof Type) ? params : new Type();

            return instance[method](element, valueAccessor, allBindings);
        };
    }

    function getParent($this) {
        var selector = $this.attr('data-target');

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
        }

        var $parent = selector && $(selector);

        return $parent && $parent.length ? $parent : $this.parent();
    }

    function getOpenMenuHandler(options) {
        options = options || {};

        if(options.slide) {
            return function($element) {
                $element.find('.dropdown-menu').first().stop(true, true).slideDown();
            };
        }
        else if(options.fade) {
            return function($element) {
                $element.find('.dropdown-menu').first().stop(true, true).fadeIn();
            };
        }
        return function($element) {
            $element.toggleClass('open');
        };
    }

    function getCloseMenuHandler(options) {
        options = options || {};

        if(options.slide) {
            return function($element) {
                $element.find('.dropdown-menu').first().stop(true, true).slideUp();
            };
        }
        else if(options.fade) {
            return function($element) {
                $element.find('.dropdown-menu').first().stop(true, true).fadeOut();
            };
        }
        return function($element) {
            $element.toggleClass('open');
        };
    }

    function FlexMenu(params) {
        params = params || {};

        this.isOpen = ko.observable(false);
        this.options = params.options;
        this.element = null;

        this.openMenu = getOpenMenuHandler(this.options);
        this.closeMenu = getCloseMenuHandler(this.options);
    }

    FlexMenu.prototype.open = function() {
        var $element, $parent, isActive;

        $element = $(this.element);
        $parent = getParent($element);

        $element.trigger('focus');

        if(!this.isOpen()) {
            this.openMenu($parent);
        }
        this.isOpen(true);
    };

    FlexMenu.prototype.close = function() {
        var $element, $parent, isActive;

        $element = $(this.element);
        $parent = getParent($element);

        if(this.isOpen()) {
            this.closeMenu($parent);
        }
        this.isOpen(false);
    };

    FlexMenu.prototype.toggle = function() {
        this.isOpen() ? this.close() : this.open();
    };

    FlexMenu.prototype.keydown = function(e) {
        if (!/(38|40|27)/.test(e.keyCode)) return;

        e.preventDefault();
        e.stopPropagation();

        if(!this.isOpen()) return;

        this.close();
    };

    FlexMenu.prototype.init = function(element, valueAccessor, allBindings) {
        var self = this,
            params,
            $element,
            nearestDropdown;

        params = valueAccessor();

        this.element = element;

        nearestDropdown = $(element).next('.dropdown-menu');

        ko.applyBindingsToNode(element, {
            'click': function () {
                self.toggle();
            }
        });

        $(document).on('keydown', self.keydown.bind(self));

        nearestDropdown.each(function() {
            ko.applyBindingsToNode(this, {
                'click': function() {
                    self.close();
                }
            });
        });

        if(this.options.overlay) {
            this.isOpen.subscribe(function(value) {
                if(value) {
                    sharedOverlay.create($(self.options.overlayTarget || '.kobs-overlay-target'), self.options);
                }
                else {
                    sharedOverlay.hide(0);
                }
            })
        }
    };

    ko.bindingHandlers['flexmenu'] = {
        'init': bindingHandler(FlexMenu, 'init')
    };

    return FlexMenu;
});