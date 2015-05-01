/**
 * Created by jdomizio on 10/16/2014.
 */
define(['knockout', 'jquery', 'strapout', 'bootstrap'], function(ko, $, strapout) {
    'use strict';

    function ViewModel() {

        /** model for 'simple binding' example */
        this.simpleTooltip = new strapout.Tooltip();

        /** model for 'code-configured tooltips' example */
        this.codeConfiguredTooltip = new strapout.Tooltip({
            title: 'I was configured with code!',
            options: {
                placement: 'right'
            }
        });

        /** model for 'dynamic behaviors' example */
        this.behaviorTooltip = new strapout.Tooltip();
        this.behaviorTooltip.options.placement = 'bottom';
        this.behaviorTooltip.title('Default messages are awesome!');

        /** model for 'inline configuration' exmaple */
        this.inlineTooltip = new strapout.Tooltip();
    }

    return {
        ViewModel: ViewModel
    };
});