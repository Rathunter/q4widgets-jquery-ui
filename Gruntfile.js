var fs = require('fs');

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify_custom: {
            default: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: '*.js',
                    dest: 'dist',
                    ext: '.min.js',
                    extDot: 'last'
                }]
            }
        },

        uglify: {
            options: {
                banner: (
                    '<% var widget = widgets[grunt.task.current.target]; %>' +
                    '/* Widget: q4.<%= widget.name %> */\n' +
                    '/* Version: <%= widget.version %> */\n' +
                    '/* Compiled on <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                )
            }
        },

        jsdoc: {
            default: {
                src: 'src/*.js',
                dest: 'doc_json',
                options: {
                    configure: 'jsdoc.conf.json'
                }
            }
        },

        mustache_render: {
            default: {
                files: [{
                    expand: true,
                    cwd: 'doc_json',
                    src: '*.json',
                    template: 'jsdoc_template/doc.md.mustache',
                    dest: 'doc',
                    ext: '.md',
                    extDot: 'last'
                }]
            }
        },

        clean: ['doc_json']
    });

    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-mustache-render');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerMultiTask('uglify_custom', function () {
        this.files.forEach(function (file) {
            var path = file.src[0],
                data = fs.readFileSync(path, {encoding: 'utf8'}),
                name = data.match(/@class q4\.(.*)\n/)[1];

            // store this widget's data in the config
            grunt.config('widgets.' + name, {
                path: path,
                name: name,
                filename: path.split('/').pop(),
                version: data.match(/@version (.*)\n/)[1]
            });

            // create and run an uglify target for this file
            grunt.config('uglify.' + name + '.files', [{
                src: [path],
                dest: path.replace(/src\/(.*)\.js/, 'dist/$1.min.js')
            }]);
            grunt.task.run('uglify:' + name);
        });
    });

    grunt.registerTask('min', ['newer:uglify_custom']);
    grunt.registerTask('doc', ['jsdoc', 'mustache_render', 'clean']);

    grunt.registerTask('default', ['min', 'doc']);
};
