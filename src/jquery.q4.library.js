(function ($) {
    $.widget('q4.library', {
        options: {
            /* The base URL for API calls. Should end with a slash. */
            feedUrl: '/',
            /* The number of items to display per page, or 0 for unlimited. */
            perPage: 0,
            /* Whether to sort the documents by year. */
            sortByYear: true,
            /* Whether to show an "all years" option. */
            allowAllYears: true,
            /* The label for the "all years" option. */
            allYearsText: 'All',
            /* The year to display first. Default is "all", or most recent.
             * It may be useful to pass new Date().getFullYear(). */
            startYear: null,
            /* A Moment.js date format string. */
            dateFormat: 'MM/DD/YYYY',
            /* An overall template for the timeline. */
            template: (
                '<ul class="content-types"></ul>' +
                '<ul class="tags"></ul>' +
                '<p>' +
                    '<input type="text" class="search">' +
                    'Year: <select class="years"></select>' +
                    'Documents per page: <select class="perpage"></select>' +
                '</p>' +
                '<p class="docsfound"></p>' +
                '<ul class="documents"></ul>' +
                '<ul class="pager"></ul>'
            ),
            /* An HTML string to display while loading. */
            loadingTemplate: 'loading...',
            /* A selector for a message about the number of documents found. */
            docsFoundContainer: '.docsfound',
            /* An HTML string to display the number of documents found. */
            docsFoundTemplate: 'Showing {{docFirst}}–{{docLast}} of {{docTotal}} documents.',
            /* An HTML string to display when no documents are found. */
            noDocsTemplate: 'No documents found. Please try broadening your search.',

            /* A selector for the document list. */
            docContainer: '.documents',
            /* A template for a list of single documents. */
            singleDocTemplate: (
                '<h3 class="docheader single">' +
                    '<span class="title">Title</span>' +
                    '<span class="date">Date</span>' +
                    '<span class="type">Type</span>' +
                    '<span class="size">Size</span>' +
                '</h3>' +
                '<ul class="doclist">' +
                    '{{#docs}}' +
                    '<li class="single"><a href="{{url}}" target="_blank">' +
                        '<span class="title">{{title}}</span>' +
                        '<span class="date">{{date}}</span>' +
                        '<span class="type">{{type}}</span>' +
                        '<span class="size">{{size}}</span>' +
                    '</a></li>' +
                    '{{/docs}}' +
                '</ul>'
            ),
            /* A template for a list of documents with sub-documents. */
            multiDocTemplate: (
                '<h3 class="docheader multi">' +
                    '<span class="title">Title</span>' +
                    '<span class="date">Date</span>' +
                    '<span class="type">Type</span>' +
                    '<span class="size">Size</span>' +
                '</h3>' +
                '<ul class="doclist">' +
                    '{{#docs}}' +
                    '<li class="multi">' +
                        '<div class="trigger">' +
                            '<span class="title">{{title}}</span>' +
                            '<span class="date">{{date}}</span>' +
                        '</div>' +
                        '<ul class="docs">' +
                            '{{#subdocs}}' +
                            '<li><a href="{{url}}" target="_blank">' +
                                '<span class="title">{{title}}</span>' +
                                '<span class="date"></span>' +
                                '<span class="type">{{type}}</span>' +
                                '<span class="size">{{size}}</span>' +
                            '</a></li>' +
                            '{{/subdocs}}' +
                        '</ul>' +
                    '</li>' +
                    '{{/docs}}' +
                '</ul>'
            ),

            /* A selector for the overall container for the accordion effect on multiple-document items. */
            accordionContainer: '.multi',
            /* A selector for the trigger for the accordion effect. */
            accordionTrigger: '.trigger',
            /* A selector for the list of documents that will be shown/hidden by the accordion. */
            accordionDocContainer: '.docs',

            /* A selector for the pager. */
            pagerContainer: '.pager',
            /* A selector for each pager link. */
            pagerTrigger: '> *',
            /* A template for individual pager links. */
            pagerTemplate: '<li>{{page}}</li>',
            /* A list of four labels for first, previous, next, and last pager items. */
            pagerLabels: {
                first: '«',
                prev: '<',
                next: '>',
                last: '»'
            },

            perPageOptions: {
                /* A selector for the container. */
                container: '.perpage',
                /* The type of input to use. */
                input: 'select',
                /* A template for each trigger or select option. */
                template: '<option>{{number}}</option>',
                /* A selector for each trigger. */
                trigger: '> *',
                /* Whether to allow multiple triggers to be selected at once. */
                allowMulti: false,
                /* Whether to allow no triggers to be selected. */
                allowNone: false
            },

            /* A selector for the search box. */
            searchSelector: '.search',

            /* An array of categories.
             * These can be either contentType strings,
             * or {name, contentType, options} objects with the following properties:
             *   name: The display name.
             *   contentType: One of the types defined in this.contentTypes.
             *   cssClass: An optional class to apply to the widget.
             *   options: An optional object of parameters to pass to the API:
             *     tag: Tag(s) to filter by. Can be a string or an array.
             *     year: Year(s) to filter by. String or array.
             *     type: For contentAssets only, the download list(s) to use.\
             */
            categories: ['contentAssets', 'events', 'financialReports', 'presentations', 'pressReleases'],
            /* Content type options. */
            catOptions: {
                /* A selector for the container. */
                container: '.content-types',
                /* The type of input to use. */
                input: 'trigger',
                /* A template for each trigger or select option. */
                template: '<li>{{name}}</li>',
                /* A selector for each trigger. */
                trigger: '> *',
                /* Whether to allow multiple triggers to be selected at once. */
                allowMulti: false,
                /* Whether to allow no triggers to be selected. */
                allowNone: false
            },

            /* An array of preset tags to filter by
             * (used if tagOptions.input is 'select' or 'trigger').
             * Tags can be either strings, or {name, value} objects.
             */
            tags: [],
            /* Tag options. */
            tagOptions: {
                /* A selector for the container. */
                container: '.tags',
                /* The type of input to use. */
                input: 'trigger',
                /* A template for each trigger or select option. */
                template: '<li>{{name}}</li>',
                /* A selector for each trigger. */
                trigger: '> *',
                /* Whether to allow multiple triggers to be selected at once. */
                allowMulti: true,
                /* Whether to allow no triggers to be selected. */
                allowNone: true
            },

            /* Year options. */
            yearOptions: {
                /* A selector for the container. */
                container: '.years',
                /* The type of input to use. */
                input: 'select',
                /* A template for each trigger or select option. */
                template: '<option value="{{value}}">{{year}}</option>',
                /* A selector for each trigger. */
                trigger: '> *',
                /* Whether to allow multiple triggers to be selected at once. */
                allowMulti: false,
                /* Whether to allow no triggers to be selected. */
                allowNone: false
            },

            /* A callback fired after a filter control is updated,
             * but before matching documents are loaded.
             * Use event.preventDefault() to cancel loading documents. */
            onFilterUpdate: function () {},
            /* A callback fired after loading a new page of documents. */
            pageComplete: function () {}
        },

        contentTypes: {
            contentAssets: {
                name: 'Downloads',
                multiple: false,
                parse: function (item, o) {
                    return {
                        title: item.Title,
                        date: moment(item.ContentAssetDate).format(o.dateFormat),
                        list: item.Type,
                        url: item.FilePath,
                        type: item.FileType,
                        size: item.FileSize
                    };
                }
            },

            events: {
                name: 'Events',
                multiple: true,
                parse: function (item, o) {
                    if (!item.EventPresentation.length && !item.Attachments.length) return;

                    docs = [];
                    $.each(item.EventPresentation, function (i, pres) {
                        docs.push({
                            title: pres.Title,
                            url: pres.DocumentPath,
                            type: pres.DocumentFileType,
                            size: pres.DocumentFileSize
                        });
                    });
                    $.each(item.Attachments, function (i, att) {
                        docs.push({
                            title: att.Title,
                            url: att.Url,
                            type: att.Extension,
                            size: att.Size
                        });
                    });
                    return {
                        title: item.Title,
                        date: moment(item.StartDate).format(o.dateFormat),
                        subdocs: docs
                    };
                }
            },

            financialReports: {
                name: 'Financial Reports',
                multiple: true,
                parse: function (item, o) {
                    if (!item.Documents.length) return;
                    
                    docs = [];
                    $.each(item.Documents, function (i, doc) {
                        docs.push({
                            title: doc.DocumentTitle,
                            url: doc.DocumentPath,
                            type: doc.DocumentFileType,
                            size: doc.DocumentFileSize
                        });
                    });
                    return {
                        title: item.ReportTitle,
                        date: moment(item.ReportDate).format(o.dateFormat),
                        subdocs: docs
                    };
                }
            },

            presentations: {
                name: 'Presentations',
                multiple: false,
                parse: function (item, o) {
                    return {
                        title: item.Title,
                        date: moment(item.PresentationDate).format(o.dateFormat),
                        url: item.DocumentPath,
                        type: item.DocumentFileType,
                        size: item.DocumentFileSize
                    };
                }
            },

            pressReleases: {
                name: 'Press Releases',
                multiple: false,
                parse: function (item, o) {
                    if (!('DocumentPath' in item) || !item.DocumentPath.length) return;
                    return {
                        title: item.Headline,
                        date: moment(item.PressReleaseDate).format(o.dateFormat),
                        url: item.DocumentPath,
                        type: item.DocumentFileType,
                        size: item.DocumentFileSize
                    };
                }
            }
        },

        setFilter: function (filter, value, reload) {
            if (filter == 'category') filter = 'cat';
            if (filter == 'tags') filter = 'tag';

            this._setInput(filter, value);
            this._updateFilterFromInput(filter, reload);
        },

        _create: function () {
            var o = this.options;

            $.ajaxSetup({cache: true});

            // store these options in a more convenient array
            this.filterOpts = {
                cat: o.catOptions,
                tag: o.tagOptions,
                year: o.yearOptions,
                perPage: o.perPageOptions,
                search: {
                    container: o.searchSelector,
                    input: 'text'
                }
            };

            // render the library and load the initial page of documents
            this._drawLibrary();
            this._bindEvents();
            this._countAndLoadDocuments();
        },

        _drawLibrary: function () {
            var _ = this,
                $e = this.element,
                o = this.options;

            // render template
            $e.html(Mustache.render(o.template));

            // revert invalid input options to default
            var inputTypes = ['select', 'trigger', 'text'];
            $.each([o.catOptions, o.tagOptions, o.yearOptions], function (i, opts) {
                if ($.inArray(opts.input, inputTypes) == -1) {
                    opts.input = 'trigger';
                };
            });

            // initialize search term
            $e.data('search', $(o.searchSelector, $e).val());

            // normalize and display category options
            var $cats = $(o.catOptions.container, $e);
            $.each(o.categories, function (i, cat) {
                if (typeof cat === 'string' && cat in _.contentTypes) {
                    cat = {name: _.contentTypes[cat].name, contentType: cat};
                }
                else if (typeof cat === 'object' && 'contentType' in cat && cat.contentType in _.contentTypes) {
                    if (!('name' in cat)) cat.name = _.contentTypes[cat.contentType].name;
                }
                else return true;

                if (!('options' in cat) || typeof cat.options !== 'object') {
                    cat.options = {};
                }

                o.categories[i] = cat;

                $(Mustache.render(o.catOptions.template, cat)).data('cat', i).appendTo($cats);
            });
            // start with first content type
            this._setInput('cat', 0);
            $e.data('cat', 0);

            // display preset tag options - passed as either strings or objects
            var $tags = $(o.tagOptions.container, $e);
            $.each(o.tags, function (i, tag) {
                // TODO: support multiple tags or tag values passed as an array
                if (typeof tag === 'string') {
                    tag = {name: tag, value: tag};
                }
                else if (typeof tag === 'object' && 'value' in tag) {
                    if (!('name' in tag)) tag.name = tag.value;
                }
                else return true;

                $(Mustache.render(o.tagOptions.template, tag)).data('tag', tag.value).appendTo($tags);
            });

            // validate and display per-page options
            var $perPage = $(o.perPageOptions.container, $e),
                perPage = [];
            $.each($.isArray(o.perPage) ? o.perPage : [o.perPage], function (i, opt) {
                if (parseInt(opt)) perPage.push(parseInt(opt));
            });
            if (perPage) {
                $.each(perPage, function (i, opt) {
                    $(Mustache.render(o.perPageOptions.template, {
                        number: opt
                    })).data('perPage', opt).appendTo($perPage);
                });
                // select first valid option in the filter control
                _._setInput('perPage', perPage[0]);
                $e.data('perPage', perPage[0]);
            }
        },

        _bindEvents: function () {
            var $e = this.element,
                o = this.options;

            // need to set these in a slightly unusual way because of the variable selectors
            var handlers = {};

            // add handlers for each filter input
            $.each(this.filterOpts, function (filter, opts) {
                if (opts.input == 'select' || opts.input == 'text') {
                    // just update the filter data
                    handlers['change ' + opts.container] = function (e) {
                        this._trigger('onFilterUpdate', e);
                        if (e.isDefaultPrevented()) return;

                        this._updateFilterFromInput(filter, true);
                    }
                } else if (opts.input == 'trigger') {
                    // update trigger display, then update the filter data
                    handlers['click ' + opts.container + ' ' + opts.trigger] = function (e) {
                        this._trigger('onFilterUpdate', e);
                        if (e.isDefaultPrevented()) return;

                        this._setInput(filter, $(e.target).data(filter));
                        this._updateFilterFromInput(filter, true);
                    }
                }
            });

            // add handler for clicking an accordion trigger
            handlers['click ' + o.docContainer + ' ' + o.accordionContainer + ' ' + o.accordionTrigger] = function (e) {
                $(e.currentTarget).closest(o.accordionContainer).find(o.accordionDocContainer).slideToggle(200);
            };

            this._on(handlers);
        },

        _setInput: function (filter, value) {
            var $e = this.element,
                opts = this.filterOpts[filter];

            // values are displayed differently for different input types
            if (opts.input == 'select' || opts.input == 'text') {
                $(opts.container, $e).val(value);

            } else if (opts.input == 'trigger') {
                var $triggers = $(opts.container + ' ' + opts.trigger, $e),
                    $trigger = $triggers.filter(function () {
                        return $(this).data(filter) == value;
                    });

                if (!opts.allowNone && $trigger.hasClass('active') && $triggers.filter('.active').length == 1) {
                    // at least one trigger must be active at a time
                    return;
                }
                if (!opts.allowMulti && !$trigger.hasClass('active')) {
                    // only one trigger can be active at a time
                    $triggers.removeClass('active');
                }
                $trigger.toggleClass('active');
            }
        },

        _updateFilterFromInput: function (filter, reload) {
            var $e = this.element,
                opts = this.filterOpts[filter];

            // data is gathered differently for different input types
            if (opts.input == 'select' || opts.input == 'text') {
                $e.data(filter, $(opts.container, $e).val());

            } else if (opts.input == 'trigger') {
                var $triggers = $(opts.container + ' ' + opts.trigger, $e);

                // get values of all active triggers
                var values = [];
                $triggers.filter('.active').each(function () {
                    // use concat to flatten any array values
                    values = values.concat($(this).data(filter));
                });
                $e.data(filter, values);
            }

            // optionally, refetch documents based on updated filter
            if (reload) {
                if (filter == 'year' || filter == 'perPage') {
                    // don't need to refetch years or document count
                    this._updateDocumentCount();
                    this._loadDocumentPage(1);
                } else {
                    this._countAndLoadDocuments();
                }
            }
        },

        _countAndLoadDocuments: function () {
            var _ = this,
                $e = this.element,
                o = this.options,
                cat = o.categories[$e.data('cat')],
                opts = $.extend({}, cat.options, {
                    tag: ($e.data('tag') || []),
                    year: $e.data('year'),
                    string: $e.data('search')
                }),
                $docs = $(o.docContainer, $e).html(o.loadingTemplate),
                $docsfound = $(o.docsFoundContainer, $e).empty();

            // fetch filter options and get page count
            // TODO: support multiple content types
            $.ajax({
                url: o.feedUrl + cat.contentType + '/years',
                data: opts,
                traditional: true,
                dataType: 'jsonp',
                success: function (data) {
                    var years = [],
                        yeartotals = {},
                        total = 0;

                    if (!data.length) {
                        $docs.empty();
                        $docsfound.html(o.noDocsTemplate);
                        return;
                    }

                    // add "all" option to start of year totals list if enabled
                    if (o.allowAllYears) {
                        yeartotals[''] = 0;
                    }

                    $.each(data, function (i, year) {
                        years.push(year._id.year);
                        yeartotals[year._id.year] = year.total;
                        yeartotals[''] += year.total;
                    });
                    $e.data('yeartotals', yeartotals);
                    $e.data('years', years);

                    // set current year and render pager
                    _._updateDocumentCount();

                    // render years
                    var $years = $(o.yearOptions.container, $e).empty();
                    if (o.sortByYear && $years.length) {
                        if (o.allowAllYears) {
                            $(Mustache.render(o.yearOptions.template, {value: '', year: o.allYearsText})).data('year', '').appendTo($years);
                        }
                        $.each(years, function (i, year) {
                            $(Mustache.render(o.yearOptions.template, {value: year, year: year})).data('year', year).appendTo($years);
                        });
                    }
                    _._setInput('year', $e.data('year'));

                    // show the first page
                    _._loadDocumentPage(1);
                }
            });
        },

        _updateDocumentCount: function () {
            var _ = this,
                o = this.options,
                $e = this.element,
                $pager = $(o.pagerContainer, $e).empty();

            // reset year if a year with no documents is currently selected
            if ($.inArray(parseInt($e.data('year')), $e.data('years')) == -1 &&
                !($e.data('year') == '' && o.allowAllYears)) {
                // if startYear is specified and it exists, use it
                $e.data('year', ($.inArray(o.startYear, $e.data('years')) > -1) ? o.startYear :
                    // otherwise use "all" if enabled, or the most recent year
                    ($e.data('years').length && !o.allowAllYears ? $e.data('years')[0] : ''));
            }

            // render pager
            if ($e.data('perPage') && $pager.length) {
                $pager.pager({
                    count: $e.data('yeartotals')[$e.data('year')],
                    perPage: $e.data('perPage'),
                    trigger: o.pagerTrigger,
                    template: o.pagerTemplate,
                    labels: o.pagerLabels,
                    beforeChange: function (pager, page) {
                        _._loadDocumentPage(page);
                    }
                });
            }
        },

        _loadDocumentPage: function (page) {
            var _ = this,
                $e = _.element,
                o = _.options,
                cat = o.categories[$e.data('cat')],
                ctype = this.contentTypes[cat.contentType],
                opts = $.extend({}, cat.options, {
                    tag: ($e.data('tag') || []),
                    year: $e.data('year'),
                    string: $e.data('search'),
                    skip: $e.data('perPage') ? (page - 1) * $e.data('perPage') : 0,
                    limit: $e.data('perPage') || 0
                }),
                $docs = $(o.docContainer, $e).html(o.loadingTemplate),
                $docsfound = $(o.docsFoundContainer, $e).empty();

            // get this page of records for current filter options
            $.ajax({
                url: o.feedUrl + cat.contentType + '/search',
                data: opts,
                traditional: true,
                dataType: 'jsonp',
                success: function (data) {
                    var template = 'template' in cat ? cat.template : (ctype.multiple ? o.multiDocTemplate : o.singleDocTemplate),
                        docs = [],
                        doctotal = $e.data('yeartotals')[$e.data('year')] || 0;

                    // render document list
                    $.each(data, function (i, item) {
                        var itemData = ctype.parse(item.Q4Dto, o);
                        if (itemData) docs.push(itemData);
                    });
                    $docs.html(Mustache.render(template, {docs: docs}));

                    // add class for this category, and store it for removal later
                    if ('cssClass' in cat) {
                        $e.removeClass($e.data('catClass'));
                        $e.addClass(cat.cssClass).data('catClass', cat.cssClass);
                    }

                    // render "documents found" message
                    $docsfound.html(Mustache.render(o.docsFoundTemplate, {
                        docCount: docs.length,
                        docTotal: doctotal,
                        docFirst: opts.skip + 1,
                        docLast: opts.skip + docs.length,
                        page: page,
                        pageCount: Math.ceil(doctotal / $e.data('perPage'))
                    }));

                    // fire callback
                    _._trigger('pageComplete');
                }
            });
        }
    });
})(jQuery);