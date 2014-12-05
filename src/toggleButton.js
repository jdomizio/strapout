define(function(require) {
    'use strict';

    var $ = require('jquery'),
        ko = require('knockout'),
        util = require('./util');

    require('bootstrap');

    function ToggleButton() {
        this.active = ko.observable(false);
        this.element = null;
    }

    ToggleButton.prototype.toggle = function() {
        this.active(!this.active());

        $(this.element).button('active');

        return false;
    };

    ToggleButton.prototype.init = function(element, valueAccessor) {
        var self = this,
            params,
            $element;

        params = valueAccessor();

        if(params instanceof ToggleButton) {
        }
        else {
            util.setObservableProperty('active', params, this);
        }

        this.element = element;
        $element = $(element);
        $element.button();

        // if data-toggle doesn't exist, create it on the element.
        if(!$element.attr('data-toggle')) {
            $element.attr('data-toggle', 'button');
        }

        ko.applyBindingsToNode(element, {
            'click': function() {
                return self.toggle();
            }
        });

        return {
            controlsDescendantBindings: false
        };
    };

    ko.bindingHandlers['toggleButton'] = {
        init: util.initBindingHandler(ToggleButton)
    };

    return ToggleButton;
});