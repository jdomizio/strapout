strapout.Modal = (function() {

    var defaultOptions = {
        show: false
    };

    function Modal(options) {
        options = options || {};

        this.isOpen = ko.observable(false);
        this.options = defaultOptions;
        this.element = null;

        this._needsToAppend = false;
    }

    Modal.prototype.open = function() {
        if(this._needsToAppend) {
            $(this.element).appendTo(this.options.appendTo);
            this._needsToAppend = false;
        }
        $(this.element).modal('show');
    };

    Modal.prototype.close = function() {
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
            params,
            onShow,
            onHidden;

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
            this._needsToAppend = true;
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

        onShow = function() {
            self.isOpen(true);
        };
        onHidden = function() {
            self.isOpen(false);
        };

        if(ko.isWriteableObservable(this.isOpen)) {
            $(element).on('show.bs.modal', onShow);
            $(element).on('hidden.bs.modal', onHidden);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                $(element).off('show.bs.modal', onShow);
                $(element).off('hidden.bs.modal', onHidden);
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