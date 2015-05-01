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