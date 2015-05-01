define(function(require) {
    'use strict';

    var $ = require('jquery'),
        ko = require('knockout'),
        util = require('./util/util'),
        StateButton = require('./stateButton'),
        ToggleButton = require('./toggleButton'),
        CheckButton = require('./checkButton'),
        RadioButton = require('./radioButton');

    function Button(options) {
        options = options || {};

        if(options.stateful) {
            StateButton.apply(this);
        }
    }

    return {
        Button: Button,
        StateButton: StateButton,
        ToggleButton: ToggleButton,
        CheckButton: CheckButton,
        RadioButton: RadioButton
    };
});