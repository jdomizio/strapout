/**
 * Created by Jason on 8/24/2014.
 */
define(['./modalViewModel', './dropdownViewModel', './tooltipViewModel', './popoverViewModel', './buttonViewModel', './tabViewModel', './alertViewModel'],

function(modal, dropdown, tooltip, popover, button, tab, alertDialog) {

    function AppViewModel() {
        this.modal = new modal.ViewModel();
        this.dropdown = new dropdown.ViewModel();
        this.tooltip = new tooltip.ViewModel();
        this.popover = new popover.ViewModel();
        this.button = new button.ViewModel();
        this.tab = new tab.ViewModel();
        this.alertDialog = new alertDialog.ViewModel();
    }

    return AppViewModel;
});
