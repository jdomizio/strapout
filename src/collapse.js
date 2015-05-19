strapout.Collapse = (function() {

    function Collapse(params) {
        $.extend(this, {
            isOpen: ko.observable(false),
            options: {}
        }, params);

        this.element = null;
    }

    $.extend(Collapse.prototype, {
        'initCollapse': function(element, valueAccessor, allBindings) {
            var self = this,
                bindingParams,
                onShow,
                onShown,
                onHide,
                onHidden;

            bindingParams = valueAccessor();
            this.element = element;

            if(bindingParams instanceof Collapse) {
                if(allBindings.has('collapseOptions')) {
                    $.extend(this.options, allBindings.get('collapseOptions'));
                }
            }
            else {
                setObservableProperty('isOpen', bindingParams, this);
                if(bindingParams.options) {
                    $.extend(this.options, bindingParams.options);
                }
            }
            this.isOpen(this.options.show);

            $(element).collapse(this.options);

            //if(this.isOpen && ko.isSubscribable(this.isOpen)) {
            //    this.isOpen.subscribe(function(newValue) {
            //        if(newValue) {
            //            $(element).collapse('show');
            //        }
            //        else {
            //            $(element).collapse('hide');
            //        }
            //    });
            //}

            onShown = function() {
                self.isOpen(true);
            };
            onHidden = function() {
                self.isOpen(false);
            };

            if(ko.isWriteableObservable(this.isOpen)) {
                if(this.options.toggle) {
                    this.isOpen(true);
                }
                $(element).on('shown.bs.collapse', onShown);
                $(element).on('hidden.bs.collapse', onHidden);

                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    $(element).off('shown.bs.collapse', onShown);
                    $(element).off('show.bs.collapse', onHidden);
                });
            }

            // inner elements should already be bound
            return {
                controlsDescendantBindings: false
            };
        },

        'initCollapsible': function(element, valueAccessor, allBindings) {

        },

        'open': function() {
            $(this.element).collapse('show');
        },

        'close': function() {
            $(this.element).collapse('hide');
        }
    });

    ko.bindingHandlers['collapse'] = {
        init: initBindingHandler(Collapse, 'initCollapse')
    };

    ko.bindingHandlers['collapsible'] = {
        init: initBindingHandler(Collapse, 'initCollapsible')
    };

    return Collapse;
})();