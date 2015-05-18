/**
 * ViewModel / Binding for a bootstrap popover
 * 12/5/2014 - Added comments, constructor options
 */
strapout.Popover = (function() {

    function Popover(params) {
        params = params || {};

        this.title = createObservable(params.title);
        this.content = createObservable(params.content); // body text
        this.isOpen = createObservable(params.isOpen || false);
        this.template = createObservable(params.template);
        this.options = params.options || {};
        this.element = null;
    }

    /**
     * Initializes a popover (via popover binding)
     * @param element - The dom element to which the popover is being bound
     * @param valueAccessor - The value of the expression being passed to the binding
     *
     *  - If the binding is an instance of Popover, then we should go look for
     *    popoverOptions to find additional options possibly passed to the popover
     *
     *  - If the binding is not an instance of Popover, then we look to see if the
     *    individual properties that make up a popover have been passed to the binding
     *
     * @param allBindings
     *
     * TODO: Break this into smaller methods possibly
     */
    Popover.prototype.init = function(element, valueAccessor, allBindings) {
        var self = this,
            params,
            onShow,
            onShown,
            onHide,
            onHidden;

        params = valueAccessor();

        if(params instanceof Popover) {
            if(allBindings.has('popoverOptions')) {
                $.extend(this.options, allBindings.get('popoverOptions'));
            }
        }
        else {
            setObservableProperty('title', params, this);
            setObservableProperty('content', params, this);
            setObservableProperty('isOpen', params, this);
            setObservableProperty('template', params, this);
            if (params.options) {
                $.extend(this.options, params.options);
            }
        }
        // set title from options and ensure options is set from current value of title
        if(this.options.title) {
            this.title(this.options.title);
        }
        else if(typeof this.title() !== 'undefined') {
            this.options.title = this.title();
        }

        // set content from options and ensure options is set from current value of content
        if(this.options.content) {
            this.content(this.options.content);
        }
        else if(typeof this.content() !== 'undefined') {
            this.options.content = this.content();
        }

        if(this.options.template) {
            this.template(this.options.template);
        }
        else if(typeof this.template() !== 'undefined') {
            this.options.template = this.template();
        }

        // initialize the plugin
        this.element = element;
        $(element).popover(this.options);

        onShow = function() {
            if(self.isOpen()) {
                return false;
            }
        };
        onShown = function() {
            self.isOpen(true);
        };
        onHide = function() {
            if(!self.isOpen()) {
                return false;
            }
        };
        onHidden = function() {
            self.isOpen(false);
        };

        // subscribe to popover events
        if(ko.isWriteableObservable(this.isOpen)) {
            $(element).on('show.bs.popover', onShow);
            $(element).on('shown.bs.popover', onShown);
            $(element).on('hide.bs.popover', onHide);
            $(element).on('hidden.bs.popover', onHidden);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                $(element).off('show.bs.popover', onShow);
                $(element).off('shown.bs.popover', onShown);
                $(element).off('hide.bs.popover', onHide);
                $(element).off('hidden.bs.popover', onHidden);
            });
        }

        // propagate observable changes to bootstrap
        if(ko.isSubscribable(this.isOpen)) {
            this.isOpen.subscribe(function(v) {
                self[!!v ? 'open' : 'close']();
            });
        }
        if(ko.isSubscribable(this.title)) {
            this.title.subscribe(function(v) {
                $(element).data('bs.popover').options.title = v;
            });
        }
        if(ko.isSubscribable(this.content)) {
            this.content.subscribe(function(v) {
                $(element).data('bs.popover').options.content = v;
            });
        }
        if(ko.isSubscribable(this.template)) {
            this.template.subscribe(function(v) {
                var popover = $(element).data('bs.popover');
                if(!popover) {
                    popover.options.template = v;
                }

                /* there be danger here - if the popover is open and we change the $tip
                 * we will remove the reference that bootstrap uses to remove the popover
                 * element */
                else if(popover.$tip) {
                    if(popover.tip().hasClass('in')) {
                        self.close();
                    }

                    popover.$tip = $(v);
                }
            });
        }
    };

    /** Opens the popover */
    Popover.prototype.open = function() {
        if(!this.isOpen()) {
            $(this.element).popover('show');
        }
    };

    /** Closes the popover */
    Popover.prototype.close = function() {
        if(this.isOpen()) {
            $(this.element).popover('hide');
        }
    };

    /** Toggles the popover */
    Popover.prototype.toggle = function() {
        $(this.element).popover('toggle');
    };

    /** Disposes of the popover */
    Popover.prototype.dispose = function() {
        $(this.element).popover('destroy');
    };

    ko.bindingHandlers['popover'] = {
        init: initBindingHandler(Popover)
    };

    return Popover;
})();