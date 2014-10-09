(function ($) {
    $.widget('q4.library', {
        options: {
            /* The base URL for API calls. Should end with a slash. */
            feedUrl: '/',
            /* The number of items to display per page, or 0 for unlimited. */
            perPage: 0,
            /* A Moment.js date format string. */
            dateFormat: 'MM/DD/YYYY',

            /* An array of categories. Categories can be either
             * endpoint strings, or objects with these properties:
             *   title: The title to display (optional).
             *   endpoint: The API endpoint to fetch from.
             */
            categories: ['contentAssets', 'events', 'financialReports', 'presentations', 'pressReleases'],
            /* A selector for the category container. */
            catContainer: '.categories',
            /* Whether to treat the category container as a select box. */
            catIsSelect: false,
            /* A selector for each category trigger (ignored if catIsSelect). */
            catTrigger: '> *',
            /* A template for each category trigger. */
            catTemplate: '<li>{{title}}</li>',

            /* An array of tags to filter by (ignored unless tagIsSelect). */
            tags: [],
            /* A selector for the tag container. */
            tagContainer: '.tags',
            /* Whether to treat the tag container as a select box. */
            tagIsSelect: true,
            /* A selector for each tag trigger (ignored if tagIsSelect). */
            tagTrigger: '> *',
            /* A template for each tag trigger. */
            tagTemplate: '<option>{{tag}}</option>',

            /* A selector for the year container. */
            yearContainer: '.years',
            /* Whether to treat the year container as a select box. */
            yearIsSelect: true,
            /* A selector for each year trigger (ignored if yearIsSelect). */
            yearTrigger: '> *',
            /* A template for each year trigger. */
            yearTemplate: '<option>{{year}}</option>',

            /* A selector for the document list. */
            docContainer: '.documents',
            /* A template for the header of a list of single-document items. */
            docHeaderTemplate: (
                '<div class="header single">' +
                    '<span class="title">Title</span>' +
                    '<span class="date">Date</span>' +
                    '<span class="type">Type</span>' +
                    '<span class="size">Size</span>' +
                '</div>'
            ),
            /* A template for the header of a list of multiple-document items. */
            multiHeaderTemplate: (
                '<div class="header multi">' +
                    '<span class="title">Title</span>' +
                    '<span class="date">Date</span>' +
                    '<span class="type">Type</span>' +
                    '<span class="size">Size</span>' +
                '</div>'
            ),
            /* A template for single-document items in the list. */
            docTemplate: (
                '<li class="single"><a href="{{url}}" target="_blank">' +
                    '<span class="title">{{title}}</span>' +
                    '<span class="date">{{date}}</span>' +
                    '<span class="type">{{type}}</span>' +
                    '<span class="size">{{size}}</span>' +
                '</a></li>'
            ),
            /* A template for multiple-document items in the list. */
            multiTemplate: (
                '<li class="multi">' +
                    '<span class="trigger">' +
                        '<span class="title">{{title}}</span>' +
                        '<span class="date">{{date}}</span>' +
                    '</span>' +
                    '<ul class="docs">' +
                        '{{#docs}}' +
                        '<li><a href="{{url}}" target="_blank">' +
                            '<span class="title">{{title}}</span>' +
                            '<span class="date"></span>' +
                            '<span class="type">{{type}}</span>' +
                            '<span class="size">{{size}}</span>' +
                        '{{/docs}}' +
                    '</ul>' +
                '</li>'
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
            pagerTemplate: '<li>{{label}}</li>',
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
                title: 'Downloads',
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
                title: 'Events',
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
                        docs: docs
                    };
                }
            },

            financialReports: {
                title: 'Financial Reports',
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
                        docs: docs
                    };
                }
            },

            presentations: {
                title: 'Presentations',
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
                title: 'Press Releases',
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
                endpoint = $e.data('cat'),
                opts = {
                    tag: $e.data('tag'),
                    year: $e.data('year'),
                    skip: (page - 1) * o.perPage,
                    limit: o.perPage
                },
                $docs = $(o.docContainer, $e).html('loading...');

            $.getJSON(o.feedUrl + endpoint + '?callback=?', opts, function (data) {
                // render header
                if (_.contentTypes[endpoint].multiple) {
                    itemTemplate = o.multiTemplate;
                    headerTemplate = o.multiHeaderTemplate;
                } else {
                    itemTemplate = o.docTemplate;
                    headerTemplate = o.docHeaderTemplate;
                }
                $docs.html(Mustache.render(headerTemplate, {}));

                // render documents
                $.each(data, function (i, item) {
                    var itemData = _.contentTypes[endpoint].parse(item.Q4Dto, o);
                    if (itemData) $docs.append(Mustache.render(itemTemplate, itemData));
                });
            });
        },

        updateFilter: function (values) {
            var _ = this,
                $e = _.element,
                o = _.options,
                $docs = $(o.docContainer, $e).html('loading...'),
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
                    $docs.html('No documents found. Please try broadening your search.');
                    return;
                }

                // show the first page, and initialize pager if possible
                if (o.perPage && $pager.length) {
                    $pager.pager({
                        count: data.total,
                        perPage: o.perPage,
                        trigger: o.pagerTrigger,
                        template: o.pagerTemplate,
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

            function addFilterEvent(key, container, isSelect, trigger) {
                if (isSelect) {
                    // add handler for changing a filter selectbox
                    handlers['change ' + container] = function (e) {
                        values = {};
                        values[key] = $(e.target).val();
                        this.updateFilter(values);
                    }
                } else {
                    // add handler for clicking a filter trigger
                    handlers['click ' + container + ' ' + trigger] = function (e) {
                        $(container + ' ' + trigger, $e).removeClass('active');
                        $(e.target).addClass('active');

                        values = {};
                        values[key] = $(e.target).data(key);
                        this.updateFilter(values);
                    }
                }
            }
            addFilterEvent('cat', o.catContainer, o.catIsSelect, o.catTrigger);
            addFilterEvent('tag', o.tagContainer, o.tagIsSelect, o.tagTrigger);
            addFilterEvent('year', o.yearContainer, o.yearIsSelect, o.yearTrigger);

            // add handler for clicking an accordion trigger
            handlers['click ' + o.docContainer + ' ' + o.accordionContainer + ' ' + o.accordionTrigger] = function (e) {
                $(e.currentTarget).closest(o.accordionContainer).find(o.accordionDocContainer).slideToggle(200);
            };

            this._on(handlers);
        },

        _drawLibrary: function () {
            var _ = this,
                $e = _.element,
                o = _.options;

            var $cats = $(o.catContainer, $e).empty();
            $.each(o.categories, function (i, cat) {
                // categories can be passed as either strings or objects
                if (typeof cat == 'string' && cat in _.contentTypes) {
                    $(Mustache.render(o.catTemplate, {title: _.contentTypes[cat].title})).data('cat', cat).appendTo($cats);
                }
                else if (typeof cat == 'object' && cat.endpoint in _.contentTypes) {
                    var title = ('title' in cat ? cat.title : _.contentTypes[cat.endpoint].title);
                    $(Mustache.render(o.catTemplate, {title: title})).data('cat', cat.endpoint).appendTo($cats);
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
