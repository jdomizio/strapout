(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('strapout', ['jquery', 'knockout'], factory);
    } else {
        if(typeof root.ko === 'undefined') {
            throw new Error('knockoutjs is required for strapout.');
        }
        if(typeof root.jQuery === 'undefined') {
            throw new Error('jQuery is required for strapout.');
        }
        root.strapout = factory(root.$, root.ko);
    }
}(this, function ($, ko) {
var strapout = {};
/**
 * Sets a property from one object to another, trying to preserve the 'observability' of the objects
 * @param property
 * @param src
 * @param target
 */
function setObservableProperty(property, src, target) {
    if(typeof src[property] === 'undefined') {
        return;
    }
    if(ko.isObservable(src[property])) {
        target[property] = src[property];
        return;
    }
    target[property](src[property]);
}

/**
 * Creates an observable based on the value supplied
 * @param value - Either a value or an observable
 * @returns {*} - If value is observable already, returns value.  Otherwise wraps value in an observable.
 */
function createObservable(value) {
    return ko.isObservable(value) ? value : ko.observable(value);
}

function initBindingHandler(Type, initMethod) {
    return function (element, valueAccessor, allBindings) {
        var params = valueAccessor(),
            instance;

        instance = (params instanceof Type) ? params : new Type();
        initMethod = initMethod || 'init';

        return instance[initMethod](element, valueAccessor, allBindings);
    };
}

function closestMarker(element, marker) {
    return $(element).closest('[data-marker="' + marker + '"]')[0];
}
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
            onHidden,
            closeOnEscape;

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

        closeOnEscape = function(e) {
            e.which === 27 && self.close();
        };
        onShow = function() {
            self.isOpen(true);
            $(window).on('keydown', closeOnEscape);
        };
        onHidden = function() {
            self.isOpen(false);
            $(window).off('keydown', closeOnEscape);
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
strapout.StateButton = (function() {

    function StateButton() {
        this.state = ko.observable('default');
        this.states = {
            'default': {
                text: null,
                action: null,
                next: null
            }
        };
        this.element = null;
    }

    StateButton.prototype.addState = function(state, options) {
        if(typeof options === 'String') {
            this.states[state] = {
                text: options,
                action: null,
                next: null
            }
        }
        else {
            this.states[state] = $.extend({
                text: null,
                action: null,
                next: null
            }, options);
        }
        return this;
    };

    StateButton.prototype.set = function(state) {
        var self = this,
            actionResult, currentState;

        currentState = this.states[this.state()];
        if(currentState && typeof currentState.action === 'function') {
            actionResult = currentState.action.apply(this);
        }

        // check to see if we got a thennable
        if(actionResult && typeof actionResult.then === 'function') {
            actionResult.then(function(result) {
                if(result !== false) {
                    self.state(state);
                }
            });
        }
        else {

            // synchronous results prevent moving to next state if action result handler returns false
            if (actionResult !== false) {
                this.state(state);
            }
        }
    };

    StateButton.prototype.reset = function() {
        this.state('default');
    };

    StateButton.prototype.action = function(state, action) {
        this.states[state].action = action;
        return this;
    };

    StateButton.prototype.next = function() {
        if(arguments.length === 2) {
            var state = arguments[0],
                nextState = arguments[1];

            this.states[state].next = nextState;
            return this;
        }

        // go to next defined state
        var currentState = this.states[this.state()];
        if(currentState && currentState.next !== null) {
            this.set(currentState.next);
        }
    };

    StateButton.prototype.init = function (element, valueAccessor, allBindings) {
        var self = this,
            params,
            $element;

        params = valueAccessor();

        if(params instanceof StateButton) {
        }
        else {
            setObservableProperty('state', params, this);
        }

        this.element = element;
        $element = $(element);
        ko.utils.objectForEach(this.states, function(property, value) {
            if(property === 'default') return;
            if($element.attr('data-' + property + '-text')) return;

            $element.attr('data-' + property + '-text', value.text);
        });

        $element.button();

        this.state.subscribe(function(v) {
            if(typeof v === 'undefined' || v === 'default') {
                $(element).button('reset');
                return;
            }
            $(element).button(v);
        });

        if(!allBindings.has('click')) {
            ko.applyBindingsToNode(element, {
                'click': function() {
                    return self.next();
                }
            })
        }

        return {
            controlsDescendantBindings: false
        };
    };

    ko.bindingHandlers['stateButton'] = {
        init: initBindingHandler(StateButton)
    };


    return StateButton;
})();

strapout.ToggleButton = (function() {

    function ToggleButton() {
        this.active = ko.observable(false);
        this.element = null;
    }

    ToggleButton.prototype.toggle = function() {
        this.active(!this.active());

        $(this.element).button('active');

        return false;
    };

    ToggleButton.prototype.init = function(element, valueAccessor) {
        var self = this,
            params,
            $element;

        params = valueAccessor();

        if(params instanceof ToggleButton) {
        }
        else {
            setObservableProperty('active', params, this);
        }

        this.element = element;
        $element = $(element);
        $element.button();

        // if data-toggle doesn't exist, create it on the element.
        if(!$element.attr('data-toggle')) {
            $element.attr('data-toggle', 'button');
        }

        ko.applyBindingsToNode(element, {
            'click': function() {
                return self.toggle();
            }
        });

        return {
            controlsDescendantBindings: false
        };
    };

    ko.bindingHandlers['toggleButton'] = {
        init: initBindingHandler(ToggleButton)
    };

    return ToggleButton;
})();

var tabs = (function() {
    var CONTAINER_MARKER = 'tabContainer';

    function wrap(object) {
        if(ko.isObservable(object)) {
            return object;
        }
        return ko.observable(object);
    }

    function TabList() {
        this.element = null;
        this.tabs = [];
        this.content = {};
        this.currentTab = ko.observable();
    }

    TabList.prototype.init = function(element, viewModel, allBindings) {
        var self = this,
            params,
            $element;

        this.element = element;

        $element = $(element);
        if(!$element.attr('data-marker')) {
            $element.attr('data-marker', CONTAINER_MARKER);
        }
    };

    TabList.prototype.add = function(tab) {
        var self = this,
            index = this.tabs.length;
        this.tabs.push(tab);

        if(!index && this.element) {
            // default first tab to be active
            $(this.element).parent().addClass('active');
        }

        tab.index = index;
        tab.container = this;

        tab.active.subscribe(function(active) {
            if(active) {
                self.currentTab(tab);
            }
        });
        if(tab.active()) {
            self.currentTab(tab);
        }

        return this;
    };

    TabList.prototype.link = function(content, index) {
        this.content[index] = content;
    };

    TabList.prototype.addTab = function(title, target, active) {
        active = active || false;
        this.add(new Tab({
            title: title,
            target: target,
            active: active
        }));

        return this;
    };

    ko.bindingHandlers['tabList'] = {
        init: initBindingHandler(TabList)
    };

    function Tab(options) {
        $.extend(this, options);

        this.container = null;
        this.index = null;
        this.active = wrap(this.active);
        this.element = null;
        this.title = wrap(this.title);
        if(!this.target && this.title()) {
            this.target = '#' + this.title();
        }
    }

    Tab.prototype.init = function(element, valueAccessor, allBindings) {
        var self = this,
            container,
            params = valueAccessor();

        this.element = element;
        if(params instanceof Tab) {
        }
        else {
            container = this.closestTabList(element);
            container.add(this);
            setObservableProperty('title', params, this);
        }

        if(!allBindings.has('text')) {
            ko.applyBindingsToNode(element, {
                'text': this.title
            });
        }

        $(element).on('show.bs.tab', function(e) {
            var result;
            if(typeof self.onShow === 'function') {
                result = self.onShow.call(self);
            }
            return result;
        });
        $(element).on('shown.bs.tab', function(e) {
            var prev;
            if(e.relatedTarget) {
                prev = ko.contextFor(e.relatedTarget);
            }
            self.active(true);
            if(prev) {
                prev.$data.active(false);
            }
            if(typeof self.onShown === 'function') {
                self.onShown.call(self);
            }
        });

        if (!$(element).attr('data-toggle')) {
            $(element).attr('data-toggle', 'tab');
        }

        if(!($(element).attr('data-target') || $(element).attr('href'))) {
            $(element).attr('data-target', this.target);
        }


        if(this.active()) {
            if($(element).closest('li').not('active')) {
                $(element).closest('li').addClass('active');
            }
            if($(this.target).not('active')) {
                $(this.target).addClass('active');
            }
        }
    };

    Tab.prototype.show = function() {
        $(this.element).tab('show');
    };

    Tab.prototype.closestTabList = function(element) {
        var closest = closestMarker(element, CONTAINER_MARKER),
            provider = ko.bindingProvider['instance'],
            context, bindings;

        context = ko.contextFor(closest);
        bindings = provider.getBindingAccessors(closest, context);
        if(bindings && bindings['tabList']) {
            return bindings['tabList']();
        }
    };

    ko.bindingHandlers['tab'] = {
        init: initBindingHandler(Tab)
    };

    ko.bindingHandlers['tabContent'] = {
        init: function(element, valueAccessor, allBindings) {

        }
    };

    return {
        TabList: TabList,
        Tab: Tab
    };
})();

strapout.TabList = tabs.TabList;
strapout.Tab = tabs.Tab;
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
strapout.Collapse = (function() {

    function Collapse(params) {
        $.extend(this, {
            isOpen: ko.observable(false),
            enabled: ko.observable(true),
            options: {}
        }, params);

        this.element = null;
        this.trigger = null;
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

    return Collapse;
})();

return strapout;
}));