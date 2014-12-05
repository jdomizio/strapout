/**
 * Created by jdomizio on 10/16/2014.
 */
define(['knockout', 'jquery', '../../../../../src/popover', 'bootstrap'], function(ko, $, Popover) {
    'use strict';

    function ViewModel() {

        /** model for 'simple binding' example */
        this.simple = new Popover();
    }

    return {
        ViewModel: ViewModel
    };
});