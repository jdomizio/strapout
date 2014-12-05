; (function() {

    require.config({
        baseUrl: 'scripts',
        paths: {
            'jquery': 'lib/jquery-2.1.1',
            'bootstrap': 'lib/bootstrap',
            'knockout': 'lib/knockout-3.2.0'
        },
        shim: {
            'bootstrap': {
                export: '$',
                deps: ['jquery']
            }
        }
    });

    require(['./app/app']);
})();
