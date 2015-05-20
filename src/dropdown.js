// TODO: Implement 'manual' option

strapout.Dropdown = (function() {

    function Dropdown(params) {
        params = params || {};

        this.isOpen = createObservable(params.isOpen || false);
        this.element = null;
        this.options = $.extend({}, params.options);

        this._forceClose = false; //used to determine if dropdown should close if sticky option is enabled.
        this._isOpening = false;
    }

    Dropdown.prototype.init = function(element, valueAccessor, allBindings) {
        var self = this,
            params,
            $element,
            $elementParent,
            $target,
            onShow,
            onShown,
            onHide,
            onHidden,
            onStickyClick,
            onStickyDataApi;

        params = valueAccessor();

        if(!(params instanceof Dropdown) && ko.isObservable(params)) {
            this.isOpen = params;
        }

        if(allBindings.has('dropdownOptions')) {
            this.options = $.extend(this.options, allBindings.get('dropdownOptions'));
        }

        // initialize the plugin
        this.element = element;

        // required by bootstrap
        $element = $(element);
        if (!$element.attr('data-toggle')) {
            $element.attr('data-toggle', 'dropdown');
        }
        $element.dropdown();
        $elementParent = $element.parent();

        if($element.attr('data-target')) {
            $target = $($element.attr('data-target'));
        }
        else {
            $target = $($elementParent.children().get(1));
        }

        onShow = function(e) {
            if(self.isOpen()) {
                return false;
            }
            if(self.options.sticky) {
                self._isOpening = true;
            }
        };

        onShown = function(e) {
            self.isOpen(true);
            if(self.options.sticky) {
                $(element).siblings('.dropdown-backdrop').remove();
            }
        };

        onHide = function(e) {
            if(!self.isOpen() || (self.options.sticky && !self._forceClose)) {
                return false;
            }
            if(self.options.sticky && self._forceClose) {
                self._forceClose = false;
            }
        };

        onHidden = function(e) {
            self.isOpen(false);
        };

        onStickyClick = function(e) {
            if(!self._isOpening && self.isOpen()) {
                self.close(true);
            }
            if(self._isOpening) {
                self._isOpening = false;
            }
        };

        onStickyDataApi = function(e) {
            // check to see if user clicked outside of dropdown element

            var $original = $(e.originalEvent.target),
                isException = false;

            if(self.options.include) {
                $.each(self.options.include, function(index, item) {
                    if(!isException && $original.closest(item).length) {
                        isException = true;
                    }
                });
            }
            if (!self._isOpening && $original.closest($target).length == 0) {
                !isException && self.close(true);
            }
            if(self._isOpening) {
                self._isOpening = false;
            }
        };

        if(ko.isWriteableObservable(this.isOpen)) {
            $elementParent.on('show.bs.dropdown', onShow);
            $elementParent.on('shown.bs.dropdown', onShown);
            $elementParent.on('hide.bs.dropdown', onHide);
            $elementParent.on('hidden.bs.dropdown', onHidden);
            if(this.options.sticky) {
                $(element).on('click.bs.dropdown', onStickyClick);
                $(window).on('click.bs.dropdown.data-api', onStickyDataApi);
            }
        }

        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            $elementParent.off('show.bs.dropdown', onShow);
            $elementParent.off('shown.bs.dropdown', onShown);
            $elementParent.off('hide.bs.dropdown', onHide);
            $elementParent.off('hidden.bs.dropdown', onHidden);
            if(self.options.sticky) {
                $(element).off('click.bs.dropdown', onStickyClick);
                $(window).off('click.bs.dropdown.data-api', onStickyDataApi);
            }
        });

        // propagate observable changes to bootstrap
        if(ko.isSubscribable(this.isOpen)) {
            this.isOpen.subscribe(function (v) {
                self[!!v ? 'open' : 'close']();
            });
        }
    };

    Dropdown.prototype.open = function() {
        if(!this.isOpen()) {
            $(this.element).dropdown('toggle');
        }
    };

    Dropdown.prototype.close = function(force) {
        if(this.isOpen()) {
            if(force && this.options.sticky) {
                this._forceClose = true;
            }
            $(this.element).dropdown('toggle');
        }
    };

    Dropdown.prototype.toggle = function(force) {
        if(this.isOpen()) {
            if(force && this.options.sticky) {
                this._forceClose = true;
            }
        }
        $(this.element).dropdown('toggle');
    };

    ko.bindingHandlers['dropdown'] = {
        'init': initBindingHandler(Dropdown)
    };

    return Dropdown;
})();