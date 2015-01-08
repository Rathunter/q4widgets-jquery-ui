module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                banner: '/*! Compiled on <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            min: {
                files: grunt.file.expandMapping(['src/*.js'], 'dist/', {
                    flatten: true,
                    rename: function (destBase, destPath) {
                        return destBase + destPath.replace('.js', '.min.js');
                    }
                })
            }
        },

        jsdoc: {
            doc: {
                src: ['src/*.js'],
                dest: 'doc_json',
                options: {
                    configure: 'jsdoc.conf.json'
                }
            }
        },

        mustache_render: {
            doc: {
                files: [
                    {
                        expand: true,
                        cwd: 'doc_json',
                        src: '*.json',
                        template: 'jsdoc_template/doc.md.mustache',
                        dest: 'doc',
                        ext: '.md',
                        extDot: 'last'
                    }
                ]
            }
        },

        clean: ['doc_json']
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-mustache-render');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('doc', ['jsdoc', 'mustache_render', 'clean'])
    grunt.registerTask('default', ['uglify', 'doc']);
};
