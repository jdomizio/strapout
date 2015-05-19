define(function(require) {
    'use strict';

    var ko = require('knockout'),
        strapout = require('strapout');

    require('bootstrap');

    function ViewModel() {
        var self = this;

        this.simple = new strapout.Collapse();
    }

    return {
        ViewModel: ViewModel
    };
});