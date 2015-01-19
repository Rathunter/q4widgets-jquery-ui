var fs = require('fs');

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify_newer: {
            default: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: '*.js',
                }]
            }
        },

        uglify: {
            options: {
                banner: (
                    '<% var widget = widgets[grunt.task.current.target]; %>' +
                    '/*\n' +
                    'Widget:   q4.<%= widget.name %>\n' +
                    'Version:  <%= widget.version %>\n' +
                    'Compiled: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '*/\n'
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

        clean: {
            doc: ['doc_json']
        }
    });

    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-mustache-render');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerMultiTask('uglify_newer', function () {
        grunt.config('clean_and_uglify.default.files', this.files.map(function (file) {
            var path = file.src[0],
                data = fs.readFileSync(path, {encoding: 'utf8'}),
                name = path.match(/q4\.(.*)\.js/)[1],
                version = data.match(/@version (.*)\n/)[1],
                file = {
                    src: [path],
                    dest: 'dist/q4.' + name + '.' + version + '.min.js'
                };

            // create clean and uglify targets for this file
            grunt.config('clean.' + name, ['dist/q4.' + name + '.*.min.js']);
            grunt.config('uglify.' + name + '.files', [file]);

            // while we're at it, add info to config for use in the uglify banner
            grunt.config('widgets.' + name, {
                name: name,
                version: version
            });

            // add this file to the clean/uglify task
            return file;
        }));

        // run clean/uglify only for changed files
        grunt.task.run('newer:clean_and_uglify');
    });

    grunt.registerMultiTask('clean_and_uglify', function () {
        this.files.forEach(function (file) {
            // run the clean and uglify targets for this file
            var name = file.src[0].match(/q4\.(.*)\.js/)[1];
            grunt.task.run('clean:' + name);
            grunt.task.run('uglify:' + name);
        });
    });

    grunt.registerTask('min', ['uglify_newer']);
    grunt.registerTask('doc', ['jsdoc', 'mustache_render', 'clean:doc']);

    grunt.registerTask('default', ['min', 'doc']);
};
