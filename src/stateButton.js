define(function(require) {
    'use strict';

    var $ = require('jquery'),
        ko = require('knockout'),
        util = require('./util');

    require('bootstrap');

    function StateButton() {
        this.state = ko.observable('default');
        this.states = {
            'default': {
                text: null,
                action: null,
                next: null
            }
        };
        this.element = null;
    }

    StateButton.prototype.addState = function(state, options) {
        if(typeof options === 'String') {
            this.states[state] = {
                text: options,
                action: null,
                next: null
            }
        }
        else {
            this.states[state] = $.extend({
                text: null,
                action: null,
                next: null
            }, options);
        }
        return this;
    };

    StateButton.prototype.set = function(state) {
        var self = this,
            actionResult, currentState;

        currentState = this.states[this.state()];
        if(currentState && typeof currentState.action === 'function') {
            actionResult = currentState.action.apply(this);
        }

        // check to see if we got a thennable
        if(actionResult && typeof actionResult.then === 'function') {
            actionResult.then(function(result) {
                if(result !== false) {
                    self.state(state);
                }
            });
        }
        else {

            // synchronous results prevent moving to next state if action result handler returns false
            if (actionResult !== false) {
                this.state(state);
            }
        }
    };

    StateButton.prototype.reset = function() {
        this.state('default');
    };

    StateButton.prototype.action = function(state, action) {
        this.states[state].action = action;
        return this;
    };

    StateButton.prototype.next = function() {
        if(arguments.length === 2) {
            var state = arguments[0],
                nextState = arguments[1];

            this.states[state].next = nextState;
            return this;
        }

        // go to next defined state
        var currentState = this.states[this.state()];
        if(currentState && currentState.next !== null) {
            this.set(currentState.next);
        }
    };

    StateButton.prototype.init = function (element, valueAccessor, allBindings) {
        var self = this,
            params,
            $element;

        params = valueAccessor();

        if(params instanceof StateButton) {
        }
        else {
            util.setObservableProperty('state', params, this);
        }

        this.element = element;
        $element = $(element);
        ko.utils.objectForEach(this.states, function(property, value) {
            if(property === 'default') return;
            if($element.attr('data-' + property + '-text')) return;

            $element.attr('data-' + property + '-text', value.text);
        });

        $element.button();

        this.state.subscribe(function(v) {
            if(typeof v === 'undefined' || v === 'default') {
                $(element).button('reset');
                return;
            }
            $(element).button(v);
        });

        if(!allBindings.has('click')) {
            ko.applyBindingsToNode(element, {
                'click': function() {
                    return self.next();
                }
            })
        }

        return {
            controlsDescendantBindings: false
        };
    };

    ko.bindingHandlers['stateButton'] = {
        init: util.initBindingHandler(StateButton)
    };


    return StateButton;
});
