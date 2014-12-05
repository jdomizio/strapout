/**
 * Created by jdomizio on 10/16/2014.
 */
define(['knockout', 'jquery', '../../../../../src/button', 'bootstrap'], function(ko, $, buttons) {
    'use strict';

    function ViewModel() {

        /** model for 'simple binding' example */
        this.stateful = new buttons.StateButton();
        this.stateful.addState('saving', 'Saving...');

        this.toggle = new buttons.ToggleButton();

        this.check = new buttons.CheckButton();

        this.radio = new buttons.RadioButton();
    }

    ViewModel.prototype.saveStateful = function() {
        var self = this;
        this.stateful.set('saving');
        window.setTimeout(function() {
            self.stateful.reset();
        }, 2000);
    };

    return {
        ViewModel: ViewModel
    };
});