/**
 * ViewModel for a bootstrap tooltip
 * 12/5/2014 - Added comments, constructor options
 */
strapout.Tooltip = (function() {
    /**
     * Represents a bootstrap tooltip
     * @constructor
     */
    function Tooltip(params) {
        params = params || {};

        this.title = createObservable(params.title);
        this.isOpen = createObservable(params.isOpen || false);
        this.options = params.options || {};

        /** Set by knockout binding */
        this.element = null;
    }

    /**
     * Initializes a tooltip (via Tooltip binding)
     * @param element - The dom element to which the tooltip is being bound
     * @param valueAccessor - The value of the expression being passed to the binding
     *
     *  - If the binding is an instance of Tooltip, then we should go look for
     *    tooltipOptions to find additional options possibly passed to the tooltip
     *
     *  - If the binding is not an instance of Tooltip, then we look to see if the
     *    individual properties that make up a tooltip have been passed to the binding
     *
     * @param allBindings
     *
     * TODO: Break this into smaller methods possibly
     */
    Tooltip.prototype.init = function(element, valueAccessor, allBindings) {
        var self = this,
            params,
            onShow,
            onShown,
            onHide,
            onHidden;

        params = valueAccessor();

        if(params instanceof Tooltip) {
            if(allBindings.has('tooltipOptions')) {
                $.extend(this.options, allBindings.get('tooltipOptions'));
            }
        }
        else {
            setObservableProperty('title', params, this);
            setObservableProperty('isOpen', params, this);
            if (params.options) {
                $.extend(this.options, params.options);
            }
        }
        // If we specified a title via some options, make sure we set it
        if(this.options.title) {
            this.title(this.options.title);
        }
        // If we specified a value for title, make sure we set the options so bootstrap will know
        else if(typeof this.title() !== 'undefined') {
            this.options.title = this.title();
        }

        // initialize the plugin
        this.element = element;
        $(element).tooltip(this.options);

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

        // subscribe to tooltip events
        if(ko.isWriteableObservable(this.isOpen)) {
            $(element).on('show.bs.tooltip', onShow);
            $(element).on('shown.bs.tooltip', onShown);
            $(element).on('hide.bs.tooltip', onHide);
            $(element).on('hidden.bs.tooltip', onHidden);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                $(element).off('show.bs.tooltip', onShow);
                $(element).off('shown.bs.tooltip', onShown);
                $(element).off('hide.bs.tooltip', onHide);
                $(element).off('hidden.bs.tooltip', onHIdden);
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
                $(element).data('bs.tooltip').options.title = v;
            });
        }
    };

    /** Opens the tooltip */
    Tooltip.prototype.open = function() {
        if(!this.isOpen()) {
            $(this.element).tooltip('show');
        }
    };

    /** Closes the tooltip */
    Tooltip.prototype.close = function() {
        if(this.isOpen()) {
            $(this.element).tooltip('hide');
        }
    };

    /** Toggles the tooltip */
    Tooltip.prototype.toggle = function() {
        $(this.element).tooltip('toggle');
    };

    /** Disposes of the tooltip */
    Tooltip.prototype.dispose = function() {
        $(this.element).tooltip('destroy');
    };

    ko.bindingHandlers['tooltip'] = {
        init: initBindingHandler(Tooltip)
    };

    return Tooltip;
})();