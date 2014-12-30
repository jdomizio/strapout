/**
 * Created by Jason on 8/24/2014.
 */
define(function(require) {
    'use strict';

    var ko = require('knockout'),
        Dropdown = require('../../../../../src/dropdown');

    require('bootstrap');

    function ViewModel() {
        var self = this;

        this.simple = new Dropdown();

        this.inlineIsOpen = ko.observable(false);

        this.dynamicDropdown = new Dropdown();
    }

    return {
        ViewModel: ViewModel
    };
});