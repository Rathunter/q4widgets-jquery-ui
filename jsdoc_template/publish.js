var fs = require('fs'),
    highlight = require('../node_modules/highlight.js').highlight,
    marked = require('../node_modules/grunt-jsdoc/node_modules/jsdoc/node_modules/marked'),
    mustache = require('../node_modules/mustache');

function parse_markdown_link(link) {
    var m = link.match(/\[(.*)\]\((.*)\)/);
    return {
        name: m[1].replace(/_/g, ' '),
        url: m[2]
    };
}

function format_value(value) {
    if (typeof value == 'string') return value;
    if (typeof value == 'boolean' || typeof value == 'number') return value.toString();
    return value;
}

function highlight_js(code) {
    return highlight('js', code).value;
}

function highlight_html(code) {
    return highlight('html', code).value;
}

function captioned_example(example) {
    var m = example.match(/^(?:([\s\S]*?)\s*\n---\n\s*)?([\s\S]*)$/);
    return {
        caption: marked(m[1] || ''),
        code: highlight_html(m[2])
    };
}

function stringify_type(param) {
    if ('type' in param) param.type = param.type.names.join('/');
    return param;
}

function single_line(example) {
    return example.indexOf('\n') == -1;
}

function multi_line(example) {
    return example.indexOf('\n') > -1;
}

exports.publish = function (data, opts) {
    var classes = {};

    data().get().forEach(function (doclet) {
        if (doclet.undocumented) return;

        var path = doclet.longname.split('.'),
            clss = path.slice(0, 2).join('.');

        // class
        if (path.length == 2 && doclet.kind == 'class') {
            classes[clss] = {
                name: clss,
                description: doclet.description,
                version: doclet.version,
                file: doclet.meta.filename,
                distfile: doclet.meta.filename.replace(/js$/, doclet.version + '.min.js'),
                line: doclet.meta.lineno,
                author: doclet.author,
                examples: (doclet.examples || []).map(captioned_example),
                options: [],
                methods: [],
                requires: (doclet.requires || []).map(parse_markdown_link),
                abstract: doclet.virtual,
                extends: doclet.augments || [],
                children: []
            };
        }

        // option
        if (path.length == 4 && path[2] == 'options') {
            classes[clss].options.push({
                name: doclet.name,
                description: doclet.description,
                line: doclet.meta.lineno,
                type: 'type' in doclet ? doclet.type.names : [],
                params: (doclet.params || []).map(stringify_type),
                defaultval: (doclet.defaultvalue !== undefined && doclet.defaultvalue !== null ?
                    highlight_js(format_value(doclet.defaultvalue)) : doclet.defaultValue),
                examples: (doclet.examples || []).filter(single_line).map(highlight_js),
                exblocks: (doclet.examples || []).filter(multi_line).map(highlight_js)
            });
        }

        // method
        if (path.length == 3 && doclet.kind == 'function' && doclet.name.charAt(0) != '_') {
            classes[clss].methods.push({
                name: doclet.name,
                description: doclet.description,
                line: doclet.meta.lineno,
                params: (doclet.params || []).map(stringify_type),
                examples: (doclet.examples || []).filter(single_line),
                exblocks: (doclet.examples || []).filter(multi_line)
            });
        }
    });

    for (clss in classes) {
        classes[clss].extends.forEach(function (parent) {
            // add reference to parent class
            classes[parent].children.push(clss);
            // inherit version and dist file from parent
            classes[clss].version = classes[parent].version;
            classes[clss].distfile = classes[parent].distfile;
        });
    }

    var classlist = Object.keys(classes).sort().map(function (clss) {
        return classes[clss];
    });

    // render template for each class
    var layoutTemplate = fs.readFileSync('jsdoc_template/layout.html.mustache', 'utf-8'),
        indexTemplate = fs.readFileSync('jsdoc_template/index.html.mustache', 'utf-8'),
        pageTemplate = fs.readFileSync('jsdoc_template/doc.html.mustache', 'utf-8');

    fs.writeFileSync('doc_html/index.html', mustache.render(layoutTemplate, {
        classes: classlist,
        content: mustache.render(indexTemplate, {classes: classlist})
    }), 'utf8');

    classlist.forEach(function (clss) {
        fs.writeFileSync('doc_html/' + clss.name + '.html', mustache.render(layoutTemplate, {
            classes: classlist,
            content: mustache.render(pageTemplate, clss)
        }), 'utf8');
    });
};
