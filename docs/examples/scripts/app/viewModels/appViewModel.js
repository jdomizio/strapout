/**
 * Created by Jason on 8/24/2014.
 */
define(function(require) {

    var
        modal = require('./modalViewModel'),
        dropdown = require('./dropdownViewModel'),
        tooltip = require('./tooltipViewModel'),
        popover = require('./popoverViewModel'),
        button = require('./buttonViewModel'),
        tab = require('./tabViewModel');
        //alertDialog = require('./alertViewModel');

    function AppViewModel() {
        this.modal = new modal.ViewModel();
        this.dropdown = new dropdown.ViewModel();
        this.tooltip = new tooltip.ViewModel();
        this.popover = new popover.ViewModel();
        this.button = new button.ViewModel();
        this.tab = new tab.ViewModel();
        //this.alertDialog = new alertDialog.ViewModel();
    }

    return AppViewModel;
});
