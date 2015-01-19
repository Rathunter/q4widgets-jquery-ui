(function ($) {
    /**
     * Base widget for accessing Q4 private API data.
     * @class q4.api
     * @version 1.0.2
     * @abstract
     * @author marcusk@q4websystems.com
     * @requires Mustache.js
     */
    $.widget('q4.api', /** @lends q4.api */ {
        options: {
            /**
             * The base URL to use for API calls.
             * @type {string}
             */
            url: '',
            /**
             * The maximum number of results to fetch from the server.
             * @type {number}
             * @default
             */
            limit: 0,
            /**
             * The number of results to skip. Used for pagination.
             * @type {number}
             * @default
             */
            skip: 0,
            /**
             * Whether to fetch data from all years, or just the most recent.
             * If `showAllYears` is true, this is assumed to be true also.
             * @type {boolean}
             * @default
             */
            fetchAllYears: false,
            /**
             * Whether to include an "all years" option in template data
             * and year selectors. If true, the widget will display
             * all year data by default on first load; otherwise it will
             * start with data from the most recent year.
             * @type {boolean}
             * @default
             */
            showAllYears: false,
            /**
             * The text to use for the "all years" option.
             * @type {string}
             * @default
             */
            allYearsText: 'All',
            /**
             * The year to display first. Default is to display all years if
             * that option is enabled, otherwise the most recent year.
             * A useful value to pass is `(new Date()).getFullYear()`.
             * @type {?number}
             */
            startYear: null,
            /**
             * Whether to fetch items dated in the future.
             * @type {boolean}
             * @default
             */
            showFuture: true,
            /**
             * Whether to fetch items dated in the past.
             * @type {boolean}
             * @default
             */
            showPast: true,
            /**
             * A list of tags to filter by.
             * @type {Array<string>}
             */
            tags: [],
            /**
             * The maximum length of an item's title. Zero for no limit.
             * @type {number}
             * @default
             */
            titleLength: 0,
            /**
             * A datepicker format string, which can be used in the template
             * as `{{date}}`. Can alternately be an object of format strings,
             * which can be accessed with `{{date.key}}` (where key is the
             * object key corresponding to the string you want to use).
             * @type {string}
             * @default
             */
            dateFormat: 'mm/dd/yy',
            /**
             * An array of years to filter by. If passed, no items will
             * be displayed unless they are dated to a year in this list.
             * @type {Array<number>}
             */
            years: [],
            /**
             * The latest year to display items from.
             * @type {?number}
             */
            maxYear: null,
            /**
             * The earliest year to display items from.
             * @type {?number}
             */
            minYear: null,
            /**
             * A URL to a default thumbnail, in case an item has none.
             * @type {string}
             */
            defaultThumb: '',
            /**
             * Whether to append the widget to the container, or replace its
             * contents entirely.
             * @type {boolean}
             * @default
             */
            append: true,
            /**
             * A Mustache.js template for the overall widget.
             * @type {string}
             * @example
             * '<ul class="years">' +
             *     '{{#years}}<li>{{year}}</li>{{/years}}' +
             * '</ul>' +
             * '<h1>{{title}}</h1>' +
             * '<ul class="items">' +
             *     '{{#items}}<li><a target="_blank" href="{{url}}">{{title}}</a></li>{{/items}}' +
             *     '{{^items}}No items found.{{/items}}' +
             * '</ul>'
             */
            template: '',
            /**
             * A message or HTML string to display while loading the widget.
             * Set to `false` to disable this feature.
             * @type {(string|boolean)}
             * @default
             */
            loadingMessage: 'Loading...',
            /**
             * An optional selector for year trigger links in the main template.
             * If passed, click events will be bound here.
             * @type {?string}
             */
            yearTrigger: null,
            /**
             * An optional selector for a year selectbox in the main template.
             * If passed, change events will be bound here.
             * @type {?string}
             */
            yearSelect: null,
            /**
             * The CSS class to use for a selected year trigger.
             * @type {string}
             * @default
             */
            activeClass: 'active',
            /**
             * An optional selector for the items container. You must also
             * pass `itemTemplate` for this to have any effect.
             * @type {?string}
             */
            itemContainer: null,
            /**
             * An optional template for the items container. If `itemContainer`
             * is also passed, this will be used to render the items list.
             * Also, when the year is changed, only the items list will be
             * rerendered, instead of the entire widget.
             * @type {string}
             * @example
             * <li>' +
             *     '<img class="thumb" src="{{thumb}}">' +
             *     '<span class="date">{{date}}</span>' +
             *     '<a href="{{url}}" class="title">{{title}}</a>' +
             * '</li>'
             */
            itemTemplate: '',
            /**
             * A message or HTML string to display while loading items.
             * By default it is the same as `loadingMessage`.
             * Set to `false` to disable this feature.
             * @type {?string}
             */
            itemLoadingMessage: null,
            /**
             * A message or HTML string to display in the items container
             * if no items are found.
             * @type {string}
             * @default
             */
            itemNotFoundMessage: 'No items found.',
            /**
             * A callback that fires when a year trigger or selectbox changes.
             * @type {function}
             * @param {Event} [event] The triggering event object.
             */
            onYearChange: function (e) {},
            /**
             * A callback that fires before the full widget is rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             * @param {Object} [templateData] The complete template data.
             */
            beforeRender: function (e, tplData) {},
            /**
             * A callback that fires before the items are rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             * @param {Object} [templateData] Template data for the items list.
             */
            beforeRenderItems: function (e, tplData) {},
            /**
             * A callback that fires after the item list is rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             */
            itemsComplete: function (e) {},
            /**
             * A callback that fires after the entire widget is rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             */
            complete: function (e) {}
        },

        years: null,
        $widget: null,

        dataUrl: '',
        yearsUrl: '',
        dataResultField: '',
        yearsResultField: '',
        dateField: '',

        _create: function () {
            this._normalizeOptions();
        },

        _init: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            if (!o.append) $e.empty();
            this.$widget = $(o.loadingMessage || '').appendTo($e);

            // if "all years" is enabled and it's the default, fetch all years
            if (o.showAllYears && !o.startYear) o.fetchAllYears = true;

            // if we're fetching all docs for all years, skip fetching the year list
            if (o.fetchAllYears && !o.limit) {
                // get data for all years and render widget
                this._getData(-1).done(function (data) {
                    var tplData = _._parseResultsWithYears(data[_.dataResultField]);
                    // get filtered year list from parsed results
                    _.years = $.map(tplData.years, function (tplYear) { return tplYear.value; });

                    _._renderWidget(tplData, o.showAllYears || !_.years.length ? -1 : _.years[0]);
                });
            }
            else {
                // get list of years
                this._getYears().done(function (data) {
                    // filter year list before parsing results
                    _.years = $.grep(data[_.yearsResultField], function (year) { return _._filterYear(year); });

                    if (_.years.length) {
                        // if startYear is specified and it exists, use it
                        var startYear = ($.inArray(o.startYear, _.years) > -1) ? o.startYear :
                            // otherwise use "all" if enabled, or the most recent
                            (o.showAllYears ? -1 : _.years[0]);

                        // get data for starting year (or all years) and render widget
                        _._getData(o.fetchAllYears ? -1 : startYear).done(function (data) {
                            _._renderWidget(_._parseResultsWithYears(data[_.dataResultField], _.years), startYear);
                        });

                    } else {
                        _._renderWidget(_._parseResultsWithYears([], _.years), -1);
                    }
                });
            }
        },

        _setOption: function (key, value) {
            this._super(key, value);
            this._normalizeOptions();
        },

        _normalizeOptions: function () {
            var o = this.options;

            // strip trailing slash from domain
            o.url = o.url.replace(/\/$/, '');

            // convert strings to arrays
            o.years = o.years ? [].concat(o.years).sort(function (a, b) { return b - a; }) : [];
            o.tags = o.tags ? [].concat(o.tags) : [];

            // convert strings to ints
            if (typeof o.startYear == 'string' && o.startYear.length) o.startYear = parseInt(o.startYear);

            // if item loading message is unset, set to match loading message
            if (o.itemLoadingMessage === null) o.itemLoadingMessage = o.loadingMessage;

            // if appending, make sure template and loading message are HTML
            // so they can be stored properly in $widget
            if (o.append) {
                if (!/<|>/.test(o.template)) o.template = '<div>' + o.template + '</div>';
                if (!/<|>/.test(o.loadingMessage)) o.loadingMessage = '<div>' + o.loadingMessage + '</div>';
            }
        },

        _buildParams: function () {
            return {
                serviceDto: {
                    ViewType: GetViewType(),
                    ViewDate: GetViewDate(),
                    RevisionNumber: GetRevisionNumber(),
                    LanguageId: GetLanguageId(),
                    Signature: GetSignature()
                }
            };
        },

        _callApi: function (url, params) {
            var o = this.options;

            return $.ajax({
                type: 'POST',
                url: o.url + url,
                data: JSON.stringify(params),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            });
        },

        _getYears: function () {
            var o = this.options;

            return this._callApi(this.yearsUrl, $.extend(true, this._buildParams(), {
                serviceDto: {
                    TagList: !o.tags.length ? null : o.tags
                }
            }));
        },

        _getData: function (year) {
            var o = this.options;

            return this._callApi(this.dataUrl, $.extend(true, this._buildParams(), {
                serviceDto: {
                    ItemCount: o.limit || -1,
                    StartIndex: o.skip,
                    TagList: !o.tags.length ? null : o.tags,
                    IncludeTags: true
                },
                year: year
            }));
        },

        _filterYear: function (year) {
            var o = this.options;

            return (
                (!o.maxYear || year <= o.maxYear) &&
                (!o.minYear || year >= o.minYear) &&
                (!o.years.length || $.inArray(year, o.years) > -1)
            );
        },

        _truncate: function (text, length) {
            if (!text) return '';
            return !length || text.length <= length ? text : text.substring(0, length) + '...';
        },

        _formatDate: function (dateString) {
            var o = this.options,
                date = new Date(dateString);

            if (typeof o.dateFormat == 'string') {
                // if o.dateFormat is a format string, return a formatted date string
                return $.datepicker.formatDate(o.dateFormat, date);
            }
            else if (typeof o.dateFormat == 'object') {
                // if o.dateFormat is an object of names to format strings,
                // return an object of names to formatted date strings
                var dates = {};
                for (name in o.dateFormat) {
                    dates[name] = $.datepicker.formatDate(o.dateFormat[name], date);
                }
                return dates;
            }
        },

        _parseResult: function (result) {
            return {};
        },

        _parseResults: function (results) {
            var _ = this;

            return $.map(results, function (result) {
                return _._parseResult(result);
            });
        },

        _parseResultsWithYears: function (results, years) {
            var _ = this,
                o = this.options,
                itemsByYear = {},
                tplData = {
                    years: [],
                    items: []
                };

            if (!$.isArray(years)) years = [];

            // parse items
            $.each(results, function (i, result) {
                var date = new Date(result[_.dateField]),
                    year = date.getFullYear();

                if ($.inArray(year, years) == -1) {
                    if (!_._filterYear(year)) return true;
                    years.push(year);
                }
                if (!(year in itemsByYear)) {
                    itemsByYear[year] = [];
                }

                var item = _._parseResult(result);

                tplData.items.push(item);
                itemsByYear[year].push(item);
            });

            // sort the years in descending order
            years.sort(function (a, b) { return b - a });

            // build by-year data for template
            $.each(years, function (i, year) {
                tplData.years.push({
                    year: year,
                    value: year,
                    items: itemsByYear[year] || []
                });
            });

            // add "all years" option, if there are years to show
            if (o.showAllYears && tplData.years.length) {
                tplData.years.unshift({
                    year: o.allYearsText,
                    value: -1,
                    items: tplData.items
                });
            }

            return tplData;
        },

        _renderItems: function (items) {
            var o = this.options,
                $e = this.element;

            this._trigger('beforeRenderItems', null, {items: items});

            if (items.length) {
                $(o.itemContainer, $e).empty();
                $.each(items, function (i, item) {
                    $(o.itemContainer, $e).append(Mustache.render(o.itemTemplate, item));
                });
            } else {
                $(o.itemContainer, $e).html(o.itemNotFoundMessage);
            }

            this._trigger('itemsComplete');
        },

        _renderWidget: function (tplData, activeYear) {
            var _ = this,
                o = this.options,
                $e = this.element;

            var yearItems = [];
            $.each(tplData.years, function (i, tplYear) {
                if (tplYear.value == activeYear) {
                    // set the active year in the template data
                    tplYear.active = true;
                    // save this year's items for separate item rendering
                    yearItems = tplYear.items;
                }
            });

            this._trigger('beforeRender', null, tplData);

            // clear previous contents and render entire widget
            this.$widget.remove();
            this.$widget = $(Mustache.render(o.template, tplData)).appendTo($e);

            // render items separately if applicable
            if (o.itemContainer && o.itemTemplate) {
                this._renderItems(yearItems);
            }

            // bind events to year triggers/selectbox
            if (o.yearTrigger) {
                // add year data to each trigger and bind click event
                $(o.yearTrigger, $e).each(function (i) {
                    var year = tplData.years[i].value;
                    $(this).data('year', year);

                    $(this).click(function (e) {
                        e.preventDefault();
                        if (!$(this).hasClass(o.activeClass)) _.setYear(year, e);
                    });
                });
            }
            if (o.yearSelect) {
                // bind change event to selectbox
                $(o.yearSelect, $e).change(function (e) {
                    _.setYear($(this).val(), e);
                });
            }

            // set triggers/selectbox to show active year
            this._updateYearControls(activeYear);

            // fire callback
            this._trigger('complete');
        },

        _updateYearControls: function (year) {
            var o = this.options,
                $e = this.element;

            if (o.yearTrigger) {
                $(o.yearTrigger, $e).each(function () {
                    $(this).toggleClass(o.activeClass, $(this).data('year') == year);
                });
            }
            if (o.yearSelect) {
                $(o.yearSelect, $e).val(year);
            }
        },

        setYear: function (year, e) {
            var _ = this,
                o = this.options,
                $e = this.element;

            // fire callback, cancel event if default action is prevented
            if (!this._trigger('onYearChange', e)) return;

            // default value if year is invalid
            if (!$.inArray(year, this.years)) year = o.showAllYears ? -1 : this.years[0];

            this._updateYearControls(year);

            // display loading message
            if (o.itemContainer && o.itemTemplate) {
                if (o.itemLoadingMessage !== false) $(o.itemContainer, $e).html(o.itemLoadingMessage);
            }
            else if (o.loadingMessage !== false) {
                this.$widget.remove();
                this.$widget = $(o.loadingMessage).appendTo($e);
            }

            // get data for selected year
            this._getData(year).done(function (data) {
                if (o.itemContainer && o.itemTemplate) {
                    // rerender item section
                    _._renderItems(_._parseResults(data[_.dataResultField]));
                }
                else {
                    // rerender entire widget
                    _._renderWidget(_._parseResultsWithYears(data[_.dataResultField], _.years), year);
                }
            });
        }
    });


    /* Event Widget */

    /**
     * Fetches and displays events from the Q4 private API.
     * @class q4.events
     * @extends q4.api
     */
    $.widget('q4.events', $.q4.api, /** @lends q4.events */ {
        options: {
            /**
             * Whether to sort the events in ascending chronological order.
             * @type {boolean}
             * @default
             */
            sortAscending: false
        },

        dataUrl: '/Services/EventService.svc/GetEventList',
        yearsUrl: '/Services/EventService.svc/GetEventYearList',
        dataResultField: 'GetEventListResult',
        yearsResultField: 'GetEventYearListResult',
        dateField: 'StartDate',

        _normalizeOptions: function () {
            var o = this.options;

            // GetEventYearList doesn't accept EventSelection for some reason
            // so we need this as a workaround
            var thisYear = new Date().getFullYear();
            if (o.showPast && !o.showFuture) {
                o.maxYear = Math.min(thisYear, o.maxYear || thisYear);
            }
            else if (o.showFuture && !o.showPast) {
                o.minYear = Math.max(thisYear, o.minYear || thisYear);
            }

            this._super();
        },

        _buildParams: function () {
            var o = this.options;

            return $.extend(this._super(), {
                eventSelection: o.showFuture && !o.showPast ? 1 : (o.showPast && !o.showFuture ? 0 : 3),
                includePresentations: true,
                includePressReleases: true,
                sortOperator: o.sortAscending ? 0 : 1
            });
        },

        _parseResult: function (result) {
            var o = this.options;

            var item = {
                title: this._truncate(result.Title, o.titleLength),
                url: result.LinkToDetailPage,
                date: this._formatDate(result.StartDate),
                endDate: this._formatDate(result.EndDate),
                location: result.Location,
                body: this._truncate(result.Body, o.bodyLength),
                docs: $.map(result.Attachments, function (doc) {
                    return {
                        title: doc.Title,
                        url: doc.Url,
                        type: doc.Type,
                        extension: doc.Extension,
                        size: doc.Size
                    }
                })
            };
            if (result.EventPressRelease.length) {
                item.pressRelease = {
                    url: result.EventPressRelease[0].LinkToDetailPage
                };
            }
            if (result.EventPresentation.length) {
                item.presentation = {
                    url: result.EventPresentation[0].LinkToDetailPage
                };
            }
            if (result.WebCastLink) {
                item.webcast = {
                    url: result.WebCastLink
                };
            }
            return item;
        }
    });


    /* Financial Report Widget */

    /**
     * Fetches and displays financial reports from the Q4 private API.
     * @class q4.financials
     * @extends q4.api
     */
    $.widget('q4.financials', $.q4.api, /** @lends q4.financials */ {
        options: {
            /**
             * A list of report subtypes to display.
             * Valid values are:
             * - `Annual Report`
             * - `Supplemental Report`
             * - `First Quarter`
             * - `Second Quarter`
             * - `Third Quarter`
             * - `Fourth Quarter`
             * Use an empty list to display all.
             * @type {Array<string>}
             * @default
             */
            reportTypes: [],
            /**
             * A list of document categories to display.
             * Use an empty list to display all.
             * @type {Array<string>}
             * @example ["Financial Report", "MD&A", "Earnings Press Release"]
             * @default
             */
            docCategories: [],
            /**
             * A map of short names for each report subtype,
             * for use in the template.
             * @type {Object}
             */
            shortTypes: {
                'Annual Report': 'Annual',
                'Supplemental Report': 'Supplemental',
                'First Quarter': 'Q1',
                'Second Quarter': 'Q2',
                'Third Quarter': 'Q3',
                'Fourth Quarter': 'Q4'
            },
        },

        dataUrl: '/Services/FinancialReportService.svc/GetFinancialReportList',
        yearsUrl: '/Services/FinancialReportService.svc/GetFinancialReportYearList',
        dataResultField: 'GetFinancialReportListResult',
        yearsResultField: 'GetFinancialReportYearListResult',
        dateField: 'ReportDate',

        _buildParams: function () {
            var o = this.options;

            return $.extend(this._super(), {
                reportSubTypeList: o.reportTypes
            });
        },

        _parseResult: function (result) {
            var _ = this,
                o = this.options;

            return {
                coverUrl: result.CoverImagePath,
                date: $.datepicker.formatDate(o.dateFormat, new Date(result.ReportDate)),
                title: result.ReportTitle,
                year: result.ReportYear,
                type: result.ReportSubType,
                shortType: o.shortTypes[result.ReportSubType],
                docs: $.map(result.Documents, function (doc) {
                    return {
                        docCategory: doc.DocumentCategory,
                        docSize: doc.DocumentFileSize,
                        docThumb: doc.DocumentThumbnailPath,
                        docTitle: _._truncate(doc.DocumentTitle, o.titleLength),
                        docType: doc.DocumentFileType,
                        docUrl: doc.DocumentPath
                    };
                })
            };
        },

        _parseResultsWithYears: function (results, years) {
            var o = this.options,
                tplData = this._super(results, years);

            // also sort each year's documents by subtype
            $.each(tplData.years, function (i, tplYear) {
                var types = [],
                    docsByType = {};

                $.each(tplYear.items, function (i, item) {
                    if ($.inArray(item.type, types) == -1) {
                        // keep an array of types to preserve order
                        types.push(item.type);
                        docsByType[item.type] = [];
                    }
                    $.each(item.docs, function (i, doc) {
                        docsByType[item.type].push(doc);
                    });
                });

                // insert a types array into each year
                tplYear.types = $.map(types, function (type, i) {
                    return {
                        type: type,
                        shortType: o.shortTypes[type],
                        docs: docsByType[type]
                    };
                });
            });

            return tplData;
        }
    });


    /* Presentation Widget */

    /**
     * Fetches and displays presentations from the Q4 private API.
     * @class q4.presentations
     * @extends q4.api
     */
    $.widget('q4.presentations', $.q4.api, /** @lends q4.presentations */ {
        options: {
        },

        dataUrl: '/Services/PresentationService.svc/GetPresentationList',
        yearsUrl: '/Services/PresentationService.svc/GetPresentationYearList',
        dataResultField: 'GetPresentationListResult',
        yearsResultField: 'GetPresentationYearListResult',
        dateField: 'PresentationDate',

        _buildParams: function () {
            var o = this.options;

            return $.extend(this._super(), {
                presentationSelection: o.showFuture && !o.showPast ? 0 : (o.showPast && !o.showFuture ? 1 : 3),
            });
        },

        _parseResult: function (result) {
            var o = this.options;

            return {
                title: this._truncate(result.Title, o.titleLength),
                url: result.LinkToDetailPage,
                date: this._formatDate(result.PresentationDate),
                tags: result.TagsList,
                body: this._truncate(result.Body, o.bodyLength),
                docUrl: result.DocumentPath
            };
        }
    });


    /* Press Release Widget */

    /**
     * Fetches and displays press releases from the Q4 private API.
     * @class q4.news
     * @extends q4.api
     */
    $.widget('q4.news', $.q4.api, /** @lends q4.news */ {
        options: {
            /**
             * The ID of the PR category to fetch. Defaults to all.
             * @type {string}
             */
            category: '00000000-0000-0000-0000-000000000000',
            /**
             * Whether to fetch the body of the press releases.
             * @type {boolean}
             * @default
             */
            loadBody: true,
            /**
             * Whether to fetch the shortened body of the press releases.
             * @type {boolean}
             * @default
             */
            loadShortBody: true,
            /**
             * The maximum length for the body, or zero for unlimited.
             * @type {number}
             * @default
             */
            bodyLength: 0,
            /**
             * The maximum length for the short body, or zero for unlimited.
             * @type {number}
             * @default
             */
            shortBodyLength: 0
        },

        dataUrl: '/Services/PressReleaseService.svc/GetPressReleaseList',
        yearsUrl: '/Services/PressReleaseService.svc/GetPressReleaseYearList',
        dataResultField: 'GetPressReleaseListResult',
        yearsResultField: 'GetPressReleaseYearListResult',
        dateField: 'PressReleaseDate',

        _buildParams: function () {
            var o = this.options;

            return $.extend(this._super(), {
                pressReleaseSelection: o.showFuture && !o.showPast ? 0 : (o.showPast && !o.showFuture ? 1 : 3),
                pressReleaseBodyType: o.loadShortBody ? (o.loadBody ? 1 : 3) : (o.loadBody ? 2 : 0),
                pressReleaseCategoryWorkflowId: o.category
            });
        },

        _parseResult: function (result) {
            var o = this.options;

            return {
                title: this._truncate(result.Headline, o.titleLength),
                url: result.LinkToDetailPage,
                date: this._formatDate(result.PressReleaseDate),
                tags: result.TagsList,
                body: this._truncate(result.Body, o.bodyLength),
                shortBody: this._truncate(result.ShortBody, o.shortBodyLength),
                docUrl: result.DocumentPath,
                docSize: result.DocumentFileSize,
                docType: result.DocumentFileType,
                thumb: result.ThumbnailPath || o.defaultThumb
            };
        }
    });

})(jQuery);
