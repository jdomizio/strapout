module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        bowercopy: {
            options: {
                srcPrefix: 'bower_components'
            },
            libs: {
                files: {
                    'docs/examples/scripts/lib': [
                        'jquery/dist/*.{js,map}',
                        'requirejs/*.js',
                        'knockout/dist/*.js',
                        'bootstrap/dist/js/*.js'
                    ],
                    'docs/examples/css': [
                        'bootstrap/dist/css/*.{css,map}'
                    ],
                    'docs/examples/fonts': [
                        'bootstrap/dist/fonts/*'
                    ]
                }
            }
        },

        copy: {
            strapout: {
                files: [
                    {
                        cwd: 'dist/',
                        src: '*.{js,map}',
                        dest: 'docs/examples/scripts/lib/',
                        expand: true
                    }
                ]
            }
        },

        concat: {
            strapout: {
                src: [
                    'src/util/start.frag',
                    'src/util/*.js',
                    'src/modal.js',
                    'src/dropdown.js',
                    'src/popover.js',
                    'src/checkButton.js',
                    'src/radioButton.js',
                    'src/stateButton.js',
                    'src/toggleButton.js',
                    'src/tab.js',
                    'src/tooltip.js',
                    'src/util/end.frag'
                ],
                dest: 'dist/strapout.js'
            }
        },

        uglify: {
            strapout: {
                options: {
                    mangle: true,
                    sourceMap: true,
                    sourceMapName: 'dist/strapout.min.map',
                    sourceMapIncludeSources: true,
                    compress: true
                },
                files: {
                    'dist/strapout.min.js': [
                        'dist/strapout.js'
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('build', function() {
        grunt.task.run(['bowercopy:libs']);
        grunt.task.run(['concat:strapout']);
        grunt.task.run(['uglify:strapout']);
        grunt.task.run(['copy:strapout']);
    });
};