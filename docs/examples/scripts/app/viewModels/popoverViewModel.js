/**
 * Created by jdomizio on 10/16/2014.
 */
define(['knockout', 'jquery', 'strapout', 'bootstrap'], function(ko, $, strapout) {
    'use strict';

    var Popover = strapout.Popover;

    function ViewModel() {
        var self = this;
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

        this.templates = {
            'regular': '<div class="popover" role="tooltip"><div class="arrow"></div>' +
                       '<h3 class="popover-title" style="font-style: italic;"></h3>' +
                       '<div class="popover-content"></div></div>',
            'fancy': '<div class="popover" role="tooltip"><div class="arrow"></div>' +
                     '<h2 class="popover-title" style="font-weight: bold; background-color: red; color: white;"></h3>' +
                     '<div class="popover-content"></div></div>'
        };

        this.templatePopover = new Popover({
            title: 'Template',
            content: 'Click regular or fancy to change template styles.',
            options: {
                trigger: 'click'
            },
            template: this.templates['regular']
        });

        this.setTemplate = function(templateName) {
            return function() {
                self.templatePopover.template(self.templates[templateName]);
            };
        };

        this.isSelected = function(templateName) {
            return self.templatePopover.template() == self.templates[templateName];
        }
    }

    return {
        ViewModel: ViewModel
    };
});