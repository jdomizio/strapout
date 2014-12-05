/**
 * Created by Jason on 8/23/2014.
 */
;define(['knockout', 'jquery', 'bootstrap'], function(ko, $) {
    "use strict";

    function Collapse() {
    }

    Collapse.prototype.init = function(element, valueAccessor) {
        var value, $element, options;

        value = valueAccessor();
        $element = $(element);

        $element.collapse(value.options);

        if(value.isOpen && ko.isSubscribable(value.isOpen)) {
            value.isOpen.subscribe(function(newValue) {
                if(newValue) {
                    $(element).collapse('show');
                }
                else {
                    $(element).collapse('hide');
                }
            });
        }
        if(ko.isWriteableObservable(value.isOpen)) {
            if(value.options.toggle) {
                value.isOpen(true);
            }
            $element.on('shown.bs.collapse', function() {
                value.isOpen(true);
            });
            $element.on('hidden.bs.collapse', function() {
                value.isOpen(false);
            })
        }

        return {
            controlsDescendantBindings: false
        };
    };

    ko.bindingHandlers['collapse'] = {
        init: function() {
            var collapse = new Collapse();
            collapse.init.apply(collapse, arguments);
        }
    };

    return {
        Collapse: Collapse
    };
});