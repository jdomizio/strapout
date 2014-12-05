define(['jquery', 'bootstrap', 'knockout', './viewModels/appViewModel'],

function($, bs, ko, AppViewModel) {

    //require('knockout-boots/modal');
    ko.applyBindings(new AppViewModel(), document.getElementById('app'));
});
