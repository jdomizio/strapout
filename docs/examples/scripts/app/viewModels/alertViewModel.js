/**
 * Created by jdomizio on 10/16/2014.
 */
define(['knockout', 'jquery', '../../../../../src/alert', 'bootstrap'], function(ko, $, AlertDialog) {
    'use strict';

    function ViewModel() {

        /** model for 'simple binding' example */
        this.simple = new AlertDialog({ message: 'Alert!' });
    }

    return {
        ViewModel: ViewModel
    };
});