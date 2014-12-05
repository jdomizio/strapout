/**
 * Created by Jason on 8/24/2014.
 */
define(['knockout', 'jquery', 'bootstrap', '../../../../../src/dropdown'], function(ko, $, bs) {

    function DropdownViewModel() {
        this.menu = new Menu();
    }

    function Menu() {
        var self = this;

        this.isOpen = ko.observable(false);
        this.show = function() {
            self.isOpen(true);
        };

        this.hide = function() {
            self.isOpen(false);
        };
    }

    return {
        Viewmodel: DropdownViewModel,
        Menu: Menu
    };
});