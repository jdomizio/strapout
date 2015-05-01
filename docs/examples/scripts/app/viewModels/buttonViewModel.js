/**
 * Created by jdomizio on 10/16/2014.
 */
define(['knockout', 'jquery', 'strapout', 'bootstrap'], function(ko, $, strapout) {
    'use strict';

    function ViewModel() {

        /** model for 'simple binding' example */
        this.stateful = new strapout.StateButton();
        this.stateful.addState('saving', 'Saving...');

        this.toggle = new strapout.ToggleButton();

        this.check = new strapout.CheckButton();

        this.radio = new strapout.RadioButton();
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