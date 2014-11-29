(function ($) {
    $.widget('q4.api', {
        options: {
            limit: 0,
            skip: 0,
            showAllYears: false,
            showFuture: true,
            showPast: true,
            tags: [],
            titleLength: 0,
            dateFormat: 'mm/dd/yy',
            years: [],
            maxYear: null,
            minYear: null,
            defaultThumb: '',
            container: null,
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
            yearContainer: null,
            yearTemplate: '<li>{{year}}</li>',
            yearTrigger: null,
            activeClass: 'active',
            itemContainer: null,
            itemTemplate: (
                '<li>' +
                    '<img class="thumb" src="{{thumb}}">' +
                    '<span class="date">{{date}}</span>' +
                    '<a href="{{url}}" class="title">{{title}}</a>' +
                '</li>'
            ),
            onYearClick: function () {},
            yearsComplete: function () {},
            itemsComplete: function () {},
            complete: function () {}
        },

        results: null,
        years: null,

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

            // if results already fetched, don't fetch them again
            // but do parse them again as options may have changed
            if (this.results) this._renderWidget(this._parseResultsWithYears(this.results, this.years));
            else {
                if (o.showAllYears) {
                    // get data for all years and render entire widget
                    this._getData(this.dataUrl, -1, function (data) {
                        _.results = data[_.dataResultField];
                        _._renderWidget(_._parseResultsWithYears(_.results));
                    });
                }
                else {
                    // get list of years
                    this._getData(this.yearsUrl, -1, function (data) {
                        _.years = $.grep(data[_.yearsResultField], function (year) {
                            return _._filterYear(year);
                        });

                        if (_.years.length) {
                            // get data for latest year and render entire widget
                            _._getData(_.dataUrl, _.years[0], function (data) {
                                _.results = data[_.dataResultField];
                                _._renderWidget(_._parseResultsWithYears(_.results, _.years));
                            });
                        }
                    });
                }
            }

        },

        _setOption: function (key, value) {
            this._super(key, value);
            this._normalizeOptions();
        },

        _normalizeOptions: function () {
            var o = this.options;

            // convert strings to arrays
            o.years = [].concat(o.years).sort(function (a, b) { return b - a; });
            o.tags = [].concat(o.tags);
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

        _parseItem: function (result) {
            return {};
        },

        _parseResults: function (results) {
            var _ = this;

            return $.map(results, function (result) {
                return _._parseItem(result);
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

                var item = _._parseItem(result);

                tplData.items.push(item);
                itemsByYear[year].push(item);
            });

            // sort the years in descending order
            years.sort(function(a, b) { return b - a });
            $.each(years, function (i, year) {
                tplData.years.push({
                    year: year,
                    items: itemsByYear[year],
                    active: i == 0
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

        _renderWidget: function (tplData) {
            var _ = this,
                o = this.options,
                $e = this.element;

            // render entire widget
            var $widget = $(Mustache.render(o.template, tplData)).appendTo(o.container ? $(o.container, $e) : $e);

            // render years if applicable
            if (o.yearContainer && o.yearTemplate) {
                $(o.yearContainer, $e).empty();
                $.each(tplData.years, function (i, year) {
                    $(o.yearContainer, $e).append(Mustache.render(o.yearTemplate, year));
                });
            }

            // render items if applicable
            if (o.itemContainer && o.itemTemplate) {
                this._renderItems(tplData.items);
            }

            // bind click events to year triggers
            if (o.yearTrigger) {
                $(o.yearTrigger, $e).each(function (i) {
                    var year = tplData.years[i].year;
                    if (year.active) $(this).addClass(o.activeClass);

                    $(this).click(function (e) {
                        e.preventDefault();
                        if ($(this).hasClass(o.activeClass)) return;
                        $(o.yearTrigger, $e).removeClass(o.activeClass);
                        $(this).addClass(o.activeClass);
                        _._trigger('onYearClick');

                        // get data for selected year
                        _._getData(_.dataUrl, year, function (data) {
                            var items = _._parseResults(data[_.dataResultField]);
                            if (o.itemContainer && o.itemTemplate) {
                                // rerender item section
                                _._renderItems(items);
                            }
                            else {
                                // set the active year to this one
                                $.each(tplData.years, function (i, yr) {
                                    yr.active = yr.year == year;
                                });
                                // rerender entire widget
                                $widget.remove();
                                _._renderWidget({
                                    years: tplData.years,
                                    items: items
                                });
                            }
                        });
                    });
                });
            }

            // fire callback
            this._trigger('complete');
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

        _parseItem: function (result) {
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

        _parseItem: function (result) {
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

        _parseItem: function (result) {
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
