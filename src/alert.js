/** this sucks, you're thinking about this the wrong way **/

define(function(require) {
    'use strict';

    var ko = require('knockout'),
        $ = require('jquery'),
        util = require('./util'),
        defaultTemplate;

    require('bootstrap');

    function AlertDialog(options) {
        options = options || {};

        this.isOpen = ko.observable(false);
        this.template = null;
        this.appendTo = 'body';

        this.message = ko.observable(options.message);
        this.title = ko.observable(options.title);
        this.data = options.data;
    }

    AlertDialog.prototype.open = function() {
        if(this.isOpen()) return;

        var element = document.createElement('div');
        element.innerHTML = this.template;
        var $element = $(element);

        $(this.appendTo).append($element);

        this.initializeAlert(element);

        this.isOpen(true);
    };

    AlertDialog.prototype.initializeAlert = function(element) {
        var self = this;
        $(element).alert();
        if(ko.isWritableObservable(this.isOpen)) {
            $(element).on('closed.bs.alert', function() {
                self.isOpen(false);
                if(element) { ko.cleanNode(element); }
            })
        }
        if(ko.isSubscribable(this.isOpen)) {
            this.isOpen.subscribe(function(v) {
               if(!v && $(element).length) {
                   $(element).alert('close');
               }
            });
        }
        //ko.applyBindings(element);
    };

    AlertDialog.prototype.init = function(element, valueAccessor, allBindings) {
        var self = this,
            params;

        params = valueAccessor();

        if(params instanceof AlertDialog) {
        }
        else {
            util.setObservableProperty('isOpen', params, this);
            util.setObservableProperty('message', params, this);
            util.setObservableProperty('title', params, this);
            util.setObservableProperty('data', params, this);
        }

        // Gather inner markup as template
        this.template = $(element).html();

        // Remove template markup from dom
        $(element).remove();

        //$(element).alert();
        //if(ko.isWriteableObservable(this.isOpen)) {
        //    $(element).on('closed.bs.alert', function() {
        //        self.isOpen(false);
        //    });
        //}
        return {
            controlsDescendantBindings: false
        };
    };

    ko.bindingHandlers['alertDialog'] = {
        init: util.initBindingHandler(AlertDialog)
    };

    return AlertDialog;
});