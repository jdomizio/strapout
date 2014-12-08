/**
 * Created by jdomizio on 10/16/2014.
 */
define(['knockout', 'jquery', '../../../../../src/popover', 'bootstrap'], function(ko, $, Popover) {
    'use strict';

    function ViewModel() {

        /** model for 'simple binding' example */
        this.simple = new Popover();

        this.codeConfigured = new Popover({
            title: 'Code-Configured',
            content: 'This message was configured within the viewModel.',
            options: {
                trigger: 'hover'
            }
        });

        this.inlineConfigured = new Popover();

        this.observabilityDemoPopover = new Popover({
            title: 'I am a title',
            content: 'I am a content.',
            options: {
                placement: 'bottom',
                trigger: 'hover'
            }
        });
    }

    return {
        ViewModel: ViewModel
    };
});