/**
 * Created by Jason on 8/23/2014.
 */
; define(function(require) {
    "use strict";

    var $ = require('jquery'),
        ko = require('knockout'),
        util = require('./util'),
        CONTAINER_MARKER;

    require('bootstrap');

    CONTAINER_MARKER = 'tabContainer';

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
        init: util.initBindingHandler(TabList)
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
            util.setObservableProperty('title', params, this);
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
        var closest = util.closestMarker(element, CONTAINER_MARKER),
            provider = ko.bindingProvider['instance'],
            context, bindings;

        context = ko.contextFor(closest);
        bindings = provider.getBindingAccessors(closest, context);
        if(bindings && bindings['tabList']) {
            return bindings['tabList']();
        }
    };

    ko.bindingHandlers['tab'] = {
        init: util.initBindingHandler(Tab)
    };

    ko.bindingHandlers['tabContent'] = {
        init: function(element, valueAccessor, allBindings) {

        }
    };

    return {
        TabList: TabList,
        Tab: Tab
    };
});