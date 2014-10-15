(function ($) {
    $.widget('q4.library', {
        options: {
            /* The base URL for API calls. Should end with a slash. */
            feedUrl: '/',
            /* The number of items to display per page, or 0 for unlimited. */
            perPage: 0,
            /* Whether to sort the documents by year. */
            sortByYear: true,
            /* A Moment.js date format string. */
            dateFormat: 'MM/DD/YYYY',
            /* An overall template for the timeline. */
            template: (
                '<ul class="categories"></ul>' +
                '<input type="text" name="tags" class="tags">' +
                '<select class="years"></select>' +
                '<ul class="documents"></ul>' +
                '<ul class="pager"></ul>'
            ),
            /* An HTML string to display while loading. */
            loadingTemplate: 'loading...',
            /* An HTML string to display the number of documents found. */
            docsFoundTemplate: 'Showing {{pageCount}} of {{total}} documents.',
            /* An HTML string to display when no documents are found. */
            noDocsTemplate: 'No documents found. Please try broadening your search.',

            /* An array of categories. Categories can be either
             * content types, or {name, contentType} objects.
             * Content types must match the ones defined in this.contentTypes
             */
            categories: ['contentAssets', 'events', 'financialReports', 'presentations', 'pressReleases'],
            /* The type of input to use for categories. Options: select, trigger */
            catInput: 'trigger',
            /* A selector for the category container. */
            catContainer: '.categories',
            /* A selector for each category trigger (if catInput is 'trigger'). */
            catTrigger: '> *',
            /* A template for each category trigger. */
            catTemplate: '<li>{{name}}</li>',

            /* An array of preset tags to filter by
             * (if tagInput is 'select' or 'trigger').
             * Tags can be either strings, or {name, value} objects.
             */
            tags: [],
            /* The type of input to use for tags. Options: select, text, trigger */
            tagInput: 'text',
            /* A selector for the tag container. */
            tagContainer: '.tags',
            /* A selector for each tag trigger (if tagInput is 'trigger'). */
            tagTrigger: '> *',
            /* A template for each tag (if tagInput is 'select' or 'trigger'). */
            tagTemplate: '<span>{{name}}</span>',

            /* The type of input to use for years. Options: select, trigger */
            yearInput: 'select',
            /* A selector for the year container. */
            yearContainer: '.years',
            /* A selector for each year trigger (if yearInput is 'trigger'). */
            yearTrigger: '> *',
            /* A template for each year. */
            yearTemplate: '<option>{{year}}</option>',

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
                        '<span class="trigger">' +
                            '<span class="title">{{title}}</span>' +
                            '<span class="date">{{date}}</span>' +
                        '</span>' +
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

            /* A callback that is fired after loading a new page of documents. */
            afterPage: null
        },

        contentTypes: {
            contentAssets: {
                name: 'Downloads',
                multiple: false,
                parse: function (item, o) {
                    return {
                        title: item.Title,
                        date: moment(item.ContentAssetDate, 'MM/DD/YYYY hh:mm:ss').format(o.dateFormat),
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
                        date: moment(item.StartDate, 'MM/DD/YYYY hh:mm:ss').format(o.dateFormat),
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
                        date: moment(item.ReportDate, 'MM/DD/YYYY hh:mm:ss').format(o.dateFormat),
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
                        date: moment(item.PresentationDate, 'MM/DD/YYYY hh:mm:ss').format(o.dateFormat),
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
                        date: moment(item.PressReleaseDate, 'MM/DD/YYYY hh:mm:ss').format(o.dateFormat),
                        url: item.DocumentPath,
                        type: item.DocumentFileType,
                        size: item.DocumentFileSize
                    };
                }
            }
        },

        showPage: function (page) {
            var _ = this,
                $e = _.element,
                o = _.options,
                cat = $e.data('cat'),
                opts = {
                    tag: $e.data('tag'),
                    year: $e.data('year'),
                    skip: (page - 1) * o.perPage,
                    limit: o.perPage
                },
                $docs = $(o.docContainer, $e).html(o.loadingTemplate);

            $.getJSON(o.feedUrl + cat + '?callback=?', opts, function (data) {
                var template = _.contentTypes[cat].multiple ? o.multiDocTemplate : o.singleDocTemplate,
                    docs = [];
                $.each(data, function (i, item) {
                    var itemData = _.contentTypes[cat].parse(item.Q4Dto, o);
                    if (itemData) docs.push(itemData);
                });
                $docs.html(Mustache.render(template, {docs: docs}));
            });
        },

        showYear: function (year) {
            // filter by years: not implemented yet
        },

        updateFilter: function (values) {
            var _ = this,
                $e = _.element,
                o = _.options,
                $docs = $(o.docContainer, $e).html(o.loadingTemplate),
                $pager = $(o.pagerContainer, $e).empty();

            // update and store the current filter values in the widget element
            $e.data(values);

            // get page count
            var countOpts = {
                tag: $e.data('tag'),
                year: $e.data('year')
            }
            $.getJSON(o.feedUrl + $e.data('cat') + '/count?callback=?', countOpts, function (data) {
                if (!data.total) {
                    $docs.html(o.noDocsTemplate);
                    return;
                }

                var years = [2014, 2013, 2012]; // obviously this is temporary!

                var $years = $(o.yearContainer, $e).empty();
                
                // render years
                if (o.sortByYear && $years.length) {
                    $years.pager({
                        pages: years,
                        showFirstLast: false,
                        showPrevNext: false,
                        trigger: o.yearTrigger,
                        template: o.yearTemplate.replace('{{year}}', '{{label}}'),
                        labels: o.pagerLabels,
                        beforeChange: function (pager, year) {
                            _.showYear(year);
                        }
                    });
                }

                // show the first page, and initialize pager if possible
                if (o.perPage && $pager.length) {
                    $pager.pager({
                        count: data.total,
                        perPage: o.perPage,
                        trigger: o.pagerTrigger,
                        template: o.pagerTemplate.replace('{{page}}', '{{label}}'),
                        labels: o.pagerLabels,
                        beforeChange: function (pager, page) {
                            _.showPage(page);
                        }
                    });
                } else {
                    _.showPage(1);
                }
            });
        },

        _bindEvents: function () {
            var $e = this.element,
                o = this.options;

            // need to set these in a slightly unusual way because of the variable selectors
            var handlers = {};

            function addFilterEvent(key, container, input, trigger) {
                if (input == 'select' || input == 'text') {
                    // add handler for changing a form input
                    handlers['change ' + container] = function (e) {
                        if (key == 'year') {
                            this.showYear($(e.target).val());
                        } else {
                            values = {};
                            values[key] = $(e.target).val();
                            this.updateFilter(values);
                        }
                    }
                } else if (input == 'trigger') {
                    // add handler for clicking a filter trigger
                    handlers['click ' + container + ' ' + trigger] = function (e) {
                        $(container + ' ' + trigger, $e).removeClass('active');
                        $(e.target).addClass('active');

                        if (key == 'year') {
                            this.showYear($(e.target).data('year'));
                        } else {
                            values = {};
                            values[key] = $(e.target).data(key);
                            this.updateFilter(values);
                        }
                    }
                }
            }
            addFilterEvent('cat', o.catContainer, o.catInput, o.catTrigger);
            addFilterEvent('tag', o.tagContainer, o.tagInput, o.tagTrigger);
            addFilterEvent('year', o.yearContainer, o.yearInput, o.yearTrigger);

            // add handler for clicking an accordion trigger
            handlers['click ' + o.docContainer + ' ' + o.accordionContainer + ' ' + o.accordionTrigger] = function (e) {
                $(e.currentTarget).closest(o.accordionContainer).find(o.accordionDocContainer).slideToggle(200);
            };

            this._on(handlers);
        },

        _drawLibrary: function () {
            var _ = this,
                $e = _.element,
                o = _.options,
                $cats, $tags;

            // render template
            $e.html(Mustache.render(o.template));

            // revert invalid options to defaults
            if (o.catInput != 'select' && o.catInput != 'trigger') o.catInput = 'trigger';
            if (o.tagInput != 'select' && o.tagInput != 'trigger' && o.tagInput != 'text') o.tagInput = 'text';
            if (o.yearInput != 'select' && o.yearInput != 'trigger') o.yearInput = 'select';

            // display category options - passed as either strings or objects
            $cats = $(o.catContainer, $e);
            $.each(o.categories, function (i, cat) {
                if (typeof cat === 'string' && cat in _.contentTypes) {
                    $(Mustache.render(o.catTemplate, {
                        name: _.contentTypes[cat].name,
                        value: cat
                    })).data('cat', cat).appendTo($cats);
                } else if (typeof cat === 'object' && 'contentType' in cat && cat.contentType in _.contentTypes) {
                    $(Mustache.render(o.catTemplate, {
                        name: ('name' in cat ? cat.name : _.contentTypes[cat.contentType].name),
                        value: cat.contentType
                    })).data('cat', cat.contentType).appendTo($cats);
                }
            });

            // display preset tag options - passed as either strings or objects
            $tags = $(o.tagContainer, $e);
            $.each(o.tags, function (i, tag) {
                if (typeof tag == 'string') {
                    $(Mustache.render(o.tagTemplate, {
                        name: tag, 
                        value: tag
                    })).data('tag', tag).appendTo($tags);
                } else if (typeof tag == 'object' && 'value' in tag) {
                    $(Mustache.render(o.tagTemplate, {
                        name: ('name' in tag ? tag.name : tag.value), 
                        value: tag
                    })).data('tag', tag).appendTo($tags);
                }
            });

            _._bindEvents();

            $(o.catTrigger, $cats).first().click();
        },

        _create: function () {
            $.ajaxSetup({cache: true});

            this._drawLibrary();
        }
    });
})(jQuery);
