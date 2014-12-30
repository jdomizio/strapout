/**
 * ViewModel / Binding for a bootstrap popover
 * 12/5/2014 - Added comments, constructor options
 */
define(function(require) {
    'use strict';

    var $ = require('jquery'),
        ko = require('knockout'),
        util = require('./util');

    require('bootstrap');

    function Popover(params) {
        params = params || {};

        this.title = util.createObservable(params.title);
        this.content = util.createObservable(params.content); // body text
        this.isOpen = util.createObservable(params.isOpen || false);
        this.template = util.createObservable(params.template);
        this.options = params.options || {};
        this.element = null;
    }

    /**
     * Initializes a popover (via popover binding)
     * @param element - The dom element to which the popover is being bound
     * @param valueAccessor - The value of the expression being passed to the binding
     *
     *  - If the binding is an instance of Popover, then we should go look for
     *    popoverOptions to find additional options possibly passed to the popover
     *
     *  - If the binding is not an instance of Popover, then we look to see if the
     *    individual properties that make up a popover have been passed to the binding
     *
     * @param allBindings
     *
     * TODO: Break this into smaller methods possibly
     */
    Popover.prototype.init = function(element, valueAccessor, allBindings) {
        var self = this,
            params;

        params = valueAccessor();

        if(params instanceof Popover) {
            if(allBindings.has('popoverOptions')) {
                $.extend(this.options, allBindings.get('popoverOptions'));
            }
        }
        else {
            util.setObservableProperty('title', params, this);
            util.setObservableProperty('content', params, this);
            util.setObservableProperty('isOpen', params, this);
            util.setObservableProperty('template', params, this);
            if (params.options) {
                $.extend(this.options, params.options);
            }
        }
        // set title from options and ensure options is set from current value of title
        if(this.options.title) {
            this.title(this.options.title);
        }
        else if(typeof this.title() !== 'undefined') {
            this.options.title = this.title();
        }

        // set content from options and ensure options is set from current value of content
        if(this.options.content) {
            this.content(this.options.content);
        }
        else if(typeof this.content() !== 'undefined') {
            this.options.content = this.content();
        }

        if(this.options.template) {
            this.template(this.options.template);
        }
        else if(typeof this.template() !== 'undefined') {
            this.options.template = this.template();
        }

        // initialize the plugin
        this.element = element;
        $(element).popover(this.options);

        // subscribe to popover events
        if(ko.isWriteableObservable(this.isOpen)) {
            $(element).on('show.bs.popover', function() {
                if(self.isOpen()) {
                    return false;
                }
            });
            $(element).on('shown.bs.popover', function() {
                self.isOpen(true);
            });
            $(element).on('hide.bs.popover', function() {
                if(!self.isOpen()) {
                    return false;
                }
            });
            $(element).on('hidden.bs.popover', function() {
                self.isOpen(false);
            });
        }

        // propagate observable changes to bootstrap
        if(ko.isSubscribable(this.isOpen)) {
            this.isOpen.subscribe(function(v) {
                self[!!v ? 'open' : 'close']();
            });
        }
        if(ko.isSubscribable(this.title)) {
            this.title.subscribe(function(v) {
                $(element).data('bs.popover').options.title = v;
            });
        }
        if(ko.isSubscribable(this.content)) {
            this.content.subscribe(function(v) {
                $(element).data('bs.popover').options.content = v;
            });
        }
        if(ko.isSubscribable(this.template)) {
            this.template.subscribe(function(v) {
                var popover = $(element).data('bs.popover');
                if(!popover) {
                    popover.options.template = v;
                }

                /* there be danger here - if the popover is open and we change the $tip
                 * we will remove the reference that bootstrap uses to remove the popover
                 * element */
                else if(popover.$tip) {
                    if(popover.tip().hasClass('in')) {
                        self.close();
                    }

                    popover.$tip = $(v);
                }
            });
        }
    };

    /** Opens the popover */
    Popover.prototype.open = function() {
        if(!this.isOpen()) {
            $(this.element).popover('show');
        }
    };

    /** Closes the popover */
    Popover.prototype.close = function() {
        if(this.isOpen()) {
            $(this.element).popover('hide');
        }
    };

    /** Toggles the popover */
    Popover.prototype.toggle = function() {
        $(this.element).popover('toggle');
    };

    /** Disposes of the popover */
    Popover.prototype.dispose = function() {
        $(this.element).popover('destroy');
    };

    ko.bindingHandlers['popover'] = {
        init: util.initBindingHandler(Popover)
    };

    return Popover;
});