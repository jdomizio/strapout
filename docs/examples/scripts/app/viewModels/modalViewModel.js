define(['knockout', 'jquery', 'strapout', 'bootstrap'], function(ko, $, strapout) {

    /**
     * Creates a new Viewmodel
     * @constructor
     */
    function ModalViewModel() {

        this.simpleModal = new strapout.Modal({
            data: {
                title: 'it\'s a dialog',
                body: 'is this great or what?'
            }
        });

        //this.dialogOptions = {
        //    isOpen: this.dialog.show,
        //    options: {
        //        backdrop: 'static',
        //        show: false,
        //        keyboard: true
        //    }
        //};
    }

    ModalViewModel.prototype.showModal = function(selector) {
        return function() {
            $(selector).modal('show');
        };
    };

    function ModalDialog(data) {
        this.title = ko.observable();
        this.body = ko.observable();
        this.footer = ko.observable();

        this.show = ko.observable(false);

        this.update(data);
    }

    ModalDialog.prototype.update = function(data) {
        this.title(data.title || 'default');
        this.body(data.body || 'default');
        this.footer(data.footer || 'default');
    };

    ModalDialog.prototype.open = function() {
        this.show(true);
    };

    ModalDialog.prototype.openHandler = function() {
        return this.open.bind(this);
    };

    ModalDialog.prototype.close = function() {
        this.show(false);
    };

    ModalDialog.prototype.closeHandler = function() {
        return this.close.bind(this);
    };

    return {
        ViewModel: ModalViewModel,
        Dialog: ModalDialog
    };
});