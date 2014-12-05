/**
 * Created by jdomizio on 10/16/2014.
 */
define(['knockout', 'jquery', '../../../../../src/tab', 'bootstrap'], function(ko, $, tabs) {
    'use strict';

    function ViewModel() {

        /** model for 'simple binding' example */
        this.simple = new tabs.TabList()
                   .addTab('Sponges', '#Sponges', true)
                   .addTab('Bricks', '#Bricks')
                   .addTab('Mortar', '#Mortar');
    }

    return {
        ViewModel: ViewModel
    };
});