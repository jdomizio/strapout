/**
 * Created by Jason on 8/24/2014.
 */
define(function(require) {
    'use strict';

    var ko = require('knockout'),
        strapout = require('strapout');

    require('bootstrap');

    var Dropdown = strapout.Dropdown;

    function ViewModel() {
        var self = this;

        this.simple = new Dropdown();

        this.inlineIsOpen = ko.observable(false);

        this.dynamicDropdown = new Dropdown();
        this.mouseEvents = {
            'mouseover': this.dynamicDropdown.open.bind(this.dynamicDropdown),
            'mouseleave': this.dynamicDropdown.close.bind(this.dynamicDropdown)
        };
    }

    return {
        ViewModel: ViewModel
    };
});