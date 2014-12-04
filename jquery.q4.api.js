(function ($) {
    $.widget('q4.api', {
        options: {
            /* The maximum number of results to fetch from the server. */
            limit: 0,
            /* The number of results to skip. Used for pagination. */
            skip: 0,
            /* Whether to include an "all years" option in template data
             * and year selectors. If true, the widget will display
             * all year data by default on first load; otherwise it will
             * start with data from the most recent year. */
            showAllYears: false,
            /* Whether to fetch items dated in the future. */
            showFuture: true,
            /* Whether to fetch items dated in the past. */
            showPast: true,
            /* A list of tags to filter by. */
            tags: [],
            /* The maximum length of an item's title. Zero for no limit (default). */
            titleLength: 0,
            /* A datepicker format string, which can be used in the template
             * as {{date}}. Can alternately be an object of format strings,
             * which can be accessed with {{date.key}} (where key is the
             * object key corresponding to the string you want to use). */
            dateFormat: 'mm/dd/yy',
            /* An array of years to filter by. If passed, no items will
             * be displayed unless they are dated to a year in this list. */
            years: [],
            /* The latest year to display items from. */
            maxYear: null,
            /* The earliest year to display items from. */
            minYear: null,
            /* A URL to a default thumbnail, in case an item has none. */
            defaultThumb: '',
            /* Whether to append the widget to the container, or
             * replace its contents entirely. */
            append: true,
            /* A Mustache.js template for the overall widget. */
            template: (
                '<ul class="years">' +
                    '{{#years}}<li>{{year}}</li>{{/years}}' +
                '</ul>' +
                '<h1>{{title}}</h1>' +
                '<ul class="items">' +
                    '{{#items}}<li><a target="_blank" href="{{url}}">{{title}}</a></li>{{/items}}' +
                    '{{^items}}No items found.{{/items}}' +
                '</ul>'
            ),
            /* An optional selector for year trigger links.
             * If passed, click events will be bound here. */
            yearTrigger: null,
            /* An optional selector for a year selectbox.
             * If passed, change events will be bound here. */
            yearSelect: null,
            /* The text to use for the "all years" option. */
            allYearsText: 'All',
            /* The CSS class to use for a selected year trigger. */
            activeClass: 'active',
            /* An optional selector for the items container. */
            itemContainer: null,
            /* An optional template for the items container. If itemContainer
             * is also passed, this will be used to render the items list.
             * Also, when the year is changed, only the items list will be
             * rerendered, instead of the entire widget. */
            itemTemplate: (
                '<li>' +
                    '<img class="thumb" src="{{thumb}}">' +
                    '<span class="date">{{date}}</span>' +
                    '<a href="{{url}}" class="title">{{title}}</a>' +
                '</li>'
            ),
            /* A callback that fires when a year trigger or selectbox changes. */
            onYearChange: function () {},
            /* A callback that fires after the item list is rendered. */
            itemsComplete: function () {},
            /* A callback that fires after the entire widget is rendered. */
            complete: function () {}
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
                o = this.options;

            if (o.showAllYears) {
                // get data for all years and render widget
                this._getData(this.dataUrl, -1, function (data) {
                    var tplData = _._parseResultsWithYears(data[_.dataResultField]);
                    // get filtered year list from parsed results
                    _.years = $.map(tplData.years, function (tplYear) { return tplYear.value; });

                    _._renderWidget(tplData, -1);
                });
            }
            else {
                // get list of years
                this._getData(this.yearsUrl, -1, function (data) {
                    // filter year list before parsing results
                    _.years = $.grep(data[_.yearsResultField], function (year) { return _._filterYear(year); });

                    if (_.years.length) {
                        // get data for latest year (or all years) and render widget
                        _._getData(_.dataUrl, _.years[0], function (data) {
                            _._renderWidget(_._parseResultsWithYears(data[_.dataResultField], _.years), _.years[0]);
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

            // convert strings to arrays
            o.years = o.years ? [].concat(o.years).sort(function (a, b) { return b - a; }) : [];
            o.tags = o.tags ? [].concat(o.tags) : [];
        },

        _buildParams: function () {
            var o = this.options;

            return {
                serviceDto: {
                    ViewType: GetViewType(),
                    ViewDate: GetViewDate(),
                    RevisionNumber: GetRevisionNumber(),
                    LanguageId: GetLanguageId(),
                    Signature: GetSignature(),
                    ItemCount: o.limit || -1,
                    StartIndex: o.skip,
                    IncludeTags: true,
                    TagList: !o.tags.length ? null : o.tags
                }
            };
        },

        _getData: function (url, year, success, error) {
            var o = this.options,
                params = $.extend(this._buildParams(), {
                    year: year
                });

            $.ajax({
                type: 'POST',
                url: url,
                data: JSON.stringify(params),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: success || function (data) {},
                error: error || function (data) {
                    console.log('Error fetching API data: ' + data);
                }
            });
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
            years.sort(function(a, b) { return b - a });

            // build by-year data for template
            $.each(years, function (i, year) {
                tplData.years.push({
                    year: year,
                    value: year,
                    items: itemsByYear[year]
                });
            });

            return tplData;
        },

        _renderItems: function (items) {
            var o = this.options,
                $e = this.element;

            $(o.itemContainer, $e).empty();
            $.each(items, function (i, item) {
                $(o.itemContainer, $e).append(Mustache.render(o.itemTemplate, item));
            });

            this._trigger('itemsComplete');
        },

        _renderWidget: function (tplData, activeYear) {
            var _ = this,
                o = this.options,
                $e = this.element;

            // add "all years" option, if there are years to show
            if (o.showAllYears && tplData.years.length) {
                tplData.years.unshift({
                    year: o.allYearsText,
                    value: -1,
                    items: tplData.items
                });
            }

            // set the active year in the template data
            $.each(tplData.years, function (i, tplYear) {
                tplYear.active = tplYear.year == activeYear;
            });

            // render entire widget and store a reference
            if (!o.append) $e.empty();
            this.$widget = $(Mustache.render(o.template, tplData)).appendTo($e);

            // render items separately if applicable
            if (o.itemContainer && o.itemTemplate) {
                this._renderItems(tplData.items);
            }

            // bind events to year triggers/selectbox
            if (o.yearTrigger) {
                // add year data to each trigger and bind click event
                $(o.yearTrigger, $e).each(function (i) {
                    var year = tplData.years[i].value;
                    $(this).data('year', year);

                    $(this).click(function (e) {
                        e.preventDefault();
                        if (!$(this).hasClass(o.activeClass)) _.setYear(year);
                    });
                });
            }
            if (o.yearSelect) {
                // bind change event to selectbox
                $(o.yearSelect, $e).change(function (e) {
                    _.setYear($(this).val());
                });
            }

            // set triggers/selectbox to show active year
            this._updateYearControls(activeYear);

            // fire callback
            this._trigger('complete');
        },

        _updateYearControls: function (year) {
            var o = this.options;

            if (o.yearTrigger) {
                $(o.yearTrigger, $e).each(function () {
                    $(this).toggleClass(o.activeClass, $(this).data('year') == year);
                });
            }
            if (o.yearSelect) {
                $(o.yearSelect, $e).val(year);
            }
        },

        setYear: function (year) {
            var _ = this,
                o = this.options;

            this._trigger('onYearChange');

            this._updateYearControls(year);

            // default value if year is invalid
            if (!$.inArray(year, this.years)) year = o.showAllYears ? -1 : this.years[0];

            // get data for selected year
            this._getData(this.dataUrl, year, function (data) {
                if (o.itemContainer && o.itemTemplate) {
                    // rerender item section
                    _._renderItems(_._parseResults(data[_.dataResultField]));
                }
                else {
                    // rerender entire widget
                    _.$widget.remove();
                    _._renderWidget(_._parseResultsWithYears(data[_.dataResultField], _.years), year);
                }
            });
        }
    });


    /* Event Widget */

    $.widget('q4.events', $.q4.api, {
        options: {
            sortAscending: false
        },

        dataUrl: '/Services/EventService.svc/GetEventList',
        yearsUrl: '/Services/EventService.svc/GetEventYearList',
        dataResultField: 'GetEventListResult',
        yearsResultField: 'GetEventYearListResult',
        dateField: 'StartDate',

        _create: function () {
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


    /* Presentation Widget */

    $.widget('q4.presentations', $.q4.api, {
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

    $.widget('q4.news', $.q4.api, {
        options: {
            category: '00000000-0000-0000-0000-000000000000',
            loadBody: true,
            loadShortBody: true,
            bodyLength: 0,
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
                thumb: result.ThumbnailPath || o.defaultThumb
            };
        }
    });

})(jQuery);
