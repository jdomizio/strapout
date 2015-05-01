strapout.RadioButton = (function() {

    function RadioButton() {
        this.element = null;
        this.selected = ko.observable();
    }

    RadioButton.prototype.init = function(element, valueAccessor) {
        var self = this,
            params,
            $element;

        params = valueAccessor();
        if(params instanceof RadioButton) {
        }
        else {
            setObservableProperty('selected', params, this);
        }

        this.element = element;
        $element = $(element);

        if(!$element.attr('data-toggle')) {
            $element.attr('data-toggle', 'buttons');
        }

        $element.find('input[type="radio"]').each(function() {
            var input = this;
            ko.applyBindingsToNode(input, {
                /** bootstrap doesn't play nice with knockout and checked binding.
                 * bootstrap stops event propagation before click would be called.
                 * TODO: make a binding to use for this */
                'event': {
                    'change': function () {
                        var checked = $(input).filter(':radio').prop('checked');
                        if(checked) {
                            self.selected($(input).val());
                        }
                    }
                }
            });
        });

        $element.button();

        return {
            controlsDescendantBindings: false
        };
    };

    ko.bindingHandlers['radioButton'] = {
        init: initBindingHandler(RadioButton)
    };

    return RadioButton;
})();