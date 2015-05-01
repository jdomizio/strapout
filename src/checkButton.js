strapout.CheckButton = (function() {

    function CheckButton() {
        this.element = null;
        this.selected = ko.observableArray();
    }

    CheckButton.prototype.init = function (element, valueAccessor) {
        var self = this,
            params,
            $element;

        params = valueAccessor();
        if (params instanceof CheckButton) {
        }
        else {
            setObservableProperty('selected', params, this);
        }

        this.element = element;
        $element = $(element);

        if (!$element.attr('data-toggle')) {
            $element.attr('data-toggle', 'buttons');
        }

        $element.find('input[type="checkbox"]').each(function () {
            var input = this;
            ko.applyBindingsToNode(input, {
                /** bootstrap doesn't play nice with knockout and checked binding.
                 * bootstrap stops event propagation before click would be called.
                 * TODO: make a binding to use for this */
                'event': {
                    'change': function () {
                        var checked = $(input).filter(':checkbox').prop('checked');
                        if (checked) {
                            self.selected.push($(input).val());
                        }
                        else {
                            self.selected.remove($(input).val());
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

    ko.bindingHandlers['checkButton'] = {
        init: initBindingHandler(CheckButton)
    };

    return CheckButton;
})();