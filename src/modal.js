strapout.Modal = (function() {

    var defaultOptions = {
        show: false
    };

    function Modal(options) {
        options = options || {};

        this.isOpen = ko.observable(false);
        this.options = defaultOptions;
        this.element = null;
    }

    Modal.prototype.open = function() {
        //if(this.isOpen()) return;
        $(this.element).modal('show');
    };

    Modal.prototype.close = function() {
        //if(!this.isOpen()) return;
        $(this.element).modal('hide');
    };

    Modal.prototype.extend = function() {
        if(arguments.length === 1) {
            ko.utils.objectForEach(arguments[0], this.extendOne.bind(this));
            return this;
        }
        if(arguments.length === 2) {
            this.extendOne(arguments[0], arguments[1]);
            return this;
        }
        return false;
    };

    Modal.prototype.extendOne = function(name, method) {
        if(typeof this[name] !== 'undefined') return false;

        this[name] = method;
    };

    Modal.prototype.init = function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var self = this,
            params;

        params = valueAccessor();
        this.element = element;

        if(params instanceof Modal) {
            if(allBindings.has('modalOptions')) {
                this.options = $.extend(this.options, allBindings.get('modalOptions'));
            }
        }
        else {
            setObservableProperty('isOpen', params, this);
            if(params.options) {
                this.options = $.extend(this.options, params.options);
            }
        }
        this.isOpen(this.options.show);

        if(this.options.appendTo) {
            $(element).appendTo(this.options.appendTo);
        }
        $(element).modal(this.options);

        if(this.isOpen && ko.isSubscribable(this.isOpen)) {
            this.isOpen.subscribe(function(newValue) {
                if(!!newValue) {
                    self.open();
                }
                else {
                    self.close();
                    $(element).modal('hide');
                }
            })
        }
        if(ko.isWriteableObservable(this.isOpen)) {
            $(element).on('show.bs.modal', function() {
                self.isOpen(true);
            });
            $(element).on('hidden.bs.modal', function() {
                self.isOpen(false);
            });
        }

        // inner elements are already bound
        return {
            controlsDescendantBindings: false
        };
    };

    ko.bindingHandlers['modal'] = {
        init: initBindingHandler(Modal)
    };

    return Modal;
})();