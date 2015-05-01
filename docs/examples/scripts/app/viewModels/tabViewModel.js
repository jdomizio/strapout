/**
 * Created by jdomizio on 10/16/2014.
 */
define(['knockout', 'jquery', 'strapout', 'bootstrap'], function(ko, $, strapout) {
    'use strict';

    function ViewModel() {

        /** model for 'simple binding' example */
        this.simple = new strapout.TabList()
                   .addTab('Sponges', '#Sponges', true)
                   .addTab('Bricks', '#Bricks')
                   .addTab('Mortar', '#Mortar');
    }

    return {
        ViewModel: ViewModel
    };
});