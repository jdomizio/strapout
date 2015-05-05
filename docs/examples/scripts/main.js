(function() {

    require.config({
        baseUrl: 'scripts',
        paths: {
            'jquery': 'lib/jquery.min',
            'bootstrap': 'lib/bootstrap.min',
            'knockout': 'lib/knockout',
            'strapout': 'lib/strapout'
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
