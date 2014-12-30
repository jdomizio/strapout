define(function(require) {
    'use strict';

    var $ = require('jquery'),
        ko = require('knockout'),
        util = require('./util');

    require('bootstrap');

    function Dropdown(params) {
        params = params || {};

        this.isOpen = util.createObservable(params.isOpen || false);
        this.element = null;
    }

    Dropdown.prototype.init = function(element, valueAccessor, allBindings) {
        var self = this,
            params,
            $element,
            $elementParent;

        params = valueAccessor();

        if(!(params instanceof Dropdown) && ko.isObservable(params)) {
            this.isOpen = params;
        }

        // initialize the plugin
        this.element = element;

        // required by bootstrap
        $element = $(element);
        if (!$element.attr('data-toggle')) {
            $element.attr('data-toggle', 'dropdown');
        }
        $element.dropdown();

        // subscribe to popover events
        if(ko.isWriteableObservable(this.isOpen)) {
            $elementParent = $element.parent();
            $elementParent.on('show.bs.dropdown', function() {
                if(self.isOpen()) {
                    return false;
                }
            });
            $elementParent.on('shown.bs.dropdown', function() {
                self.isOpen(true);
            });
            $elementParent.on('hide.bs.dropdown', function() {
                if(!self.isOpen()) {
                    return false;
                }
            });
            $elementParent.on('hidden.bs.dropdown', function() {
                self.isOpen(false);
            });
        }

        // propagate observable changes to bootstrap
        if(ko.isSubscribable(this.isOpen)) {

            ///* Remove click handler from element so we can handle it instead */
            //$element.off('click.bs.dropdown');
            //
            ///* Remove data-api click handler from element so it doesn't override us */
            //$(element).on('click.bs.dropdown.data-api', function (e) {
            //    e.stopPropagation();
            //});

            this.isOpen.subscribe(function (v) {
                //self[!!v ? 'open' : 'close']();
            });
        }
    };
    Dropdown.prototype.open = function() {
        if(!this.isOpen()) {
            $(this.element).dropdown('toggle');
        }
    };

    Dropdown.prototype.close = function() {
        if(this.isOpen()) {
            $(this.element).dropdown('toggle');
        }
    };

    Dropdown.prototype.toggle = function() {
        $(this.element).dropdown('toggle');
    };

    ko.bindingHandlers['dropdown'] = {
        'init': util.initBindingHandler(Dropdown)
    };

    return Dropdown;
});