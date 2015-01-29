var fs = require('fs');

function strip_module(req) {
    return req.split('module:')[1];
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

        var path = doclet.longname.split('.');

        // class
        if (path.length == 2 && doclet.kind == 'class') {
            classes[doclet.longname] = {
                name: doclet.longname,
                description: doclet.description,
                file: doclet.meta.filename,
                line: doclet.meta.lineno,
                author: doclet.author,
                examples: (doclet.examples || []).filter(single_line),
                exblocks: (doclet.examples || []).filter(multi_line),
                options: [],
                methods: [],
                requires: (doclet.requires || []).map(strip_module),
                augments: doclet.augments || [],
                children: []
            };
        }

        // option
        if (path.length == 4 && path[2] == 'options') {
            classes['q4.' + path[1]].options.push({
                name: doclet.name,
                description: doclet.description,
                line: doclet.meta.lineno,
                type: 'type' in doclet ? doclet.type.names.join('/') : undefined,
                params: (doclet.params || []).map(stringify_type),
                defaultval: doclet.defaultvalue,
                examples: (doclet.examples || []).filter(single_line),
                exblocks: (doclet.examples || []).filter(multi_line)
            });
        }

        // method
        if (path.length == 3 && doclet.kind == 'function' && doclet.name.charAt(0) != '_') {
            classes['q4.' + path[1]].methods.push({
                name: doclet.name,
                description: doclet.description,
                line: doclet.meta.lineno,
                params: (doclet.params || []).map(stringify_type),
                examples: (doclet.examples || []).filter(single_line),
                exblocks: (doclet.examples || []).filter(multi_line)
            });
        }
    });

    var clsnames = Object.keys(classes).sort();

    // format classes
    clsnames.forEach(function (clsname) {
        // reference child classes
        classes[clsname].augments.forEach(function (parent) {
            classes[parent].children.push(clsname);
        });
    });

    // export json data for classes
    clsnames.forEach(function (clsname) {
        fs.writeFile('doc_json/' + clsname + '.json', JSON.stringify(classes[clsname], null, 4), 'utf8', function (err) {
            if (err) throw err;
        });
    });
};
