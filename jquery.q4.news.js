(function($) {
    /* callbacks:
     *   itemsComplete
     *   widgetComplete
     */
    $.widget("q4.news", {
        options: {
            tags: [],
            category: '00000000-0000-0000-0000-000000000000',
            limit: 0,
            skip: 0,
            getAllYears: true,
            year: 0,
            titleLength: 0,
            dateFormat: 'mm/dd/yy',
            loadBody: true,
            loadShortBody: true,
            bodyLength: 0,
            shortBodyLength: 0,
            defaultThumb: '',
            template: (
                '<ul class="news-years">' +
                    '{{#years}}<li>{{year}}</li>{{/years}}' +
                '</ul>' +
                '<ul class="news-items">' +
                    '{{#items}}' +
                    '<li>' +
                        '<img class="news-thumb" src="{{thumb}}">' +
                        '<span class="news-date">{{date}}</span>' +
                        '<a href="{{url}}" class="news-title">{{title}}</a>' +
                    '</li>' +
                    '{{/items}}' +
                '</ul>'
            ),
            notFoundContainer: '.news-items',
            notFoundMessage: 'No items found.',
            yearContainer: null,
            yearTemplate: '<li>{{year}}</li>',
            itemContainer: null,
            itemTemplate: (
                '<li>' +
                    '<img class="news-thumb" src="{{thumb}}">' +
                    '<span class="news-date">{{date}}</span>' +
                    '<a href="{{url}}" class="news-title">{{title}}</a>' +
                '</li>'
            )
        },

        _create: function () {
            var _ = this,
                o = this.options;

            if (o.getAllYears) {
                // fetch data for all years, and render the widget
                this._getNewsData(-1, function (data) {
                    _._renderNewsWidget(_._parseNewsData(data));
                });

            } else {
                // fetch years
                this._getNewsYears(function (data) {
                    var years = data.GetPressReleaseYearListResult;
                    if (years.length) {
                        // fetch data for the first year, and render the widget
                        _._getNewsData(years[0], function (data) {
                            _._renderNewsWidget(_._parseNewsData(data, years));
                        });
                    } else {
                        _._renderNewsWidget({years: [], items: []});
                    }
                });
            }
        },

        setYear: function (year) {
            var _ = this;

            // fetch data for a single year, and render only the items
            this._getNewsData(year, function (data) {
                _._renderNewsItems(_._parseNewsData(data));
            });
        },

        _getNewsYears: function (success, error) {
            var _ = this,
                o = this.options;

            $.ajax({
                type: 'POST',
                url: '/Services/PressReleaseService.svc/GetPressReleaseYearList',
                data: JSON.stringify({
                    serviceDto:{
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        RevisionNumber: GetRevisionNumber(),
                        LanguageId: GetLanguageId(),
                        Signature: GetSignature(),
                        ItemCount: o.limit || -1,
                        StartIndex: o.skip,
                        TagList: o.tags
                    },
                    pressReleaseCategoryWorkflowId: o.category,
                    year: -1
                }),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: success,
                error: error || function (data) {
                    console.log('Error fetching press release years: ' + data);
                }
            });
        },

        _getNewsData: function (year, success, error) {
            var _ = this,
                o = this.options;

            $.ajax({
                type: 'POST',
                url: '/Services/PressReleaseService.svc/GetPressReleaseList',
                data: JSON.stringify({
                    serviceDto:{
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        RevisionNumber: GetRevisionNumber(),
                        LanguageId: GetLanguageId(),
                        Signature: GetSignature(),
                        ItemCount: o.limit || -1,
                        StartIndex: o.skip,
                        TagList: o.tags
                    },
                    pressReleaseSelection: 3,
                    pressReleaseBodyType: o.loadShortBody ? (o.loadBody ? 1 : 3) : (o.loadBody ? 2 : 0),
                    pressReleaseCategoryWorkflowId: o.category,
                    year: year
                }),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: success,
                error: error || function (data) {
                    console.log('Error fetching press releases: ' + data);
                }
            });
        },

        _parseNewsData: function (data, years) {
            var o = this.options,
                itemsByYear = {},
                tplData = {
                    years: [],
                    items: []
                };

            // if a starting list of years isn't passed, create it
            if (!$.isArray(years)) {
                years = [];
            }

            function truncate(text, length) {
                if (!text) return '';
                return !length || text.length <= length ? text : text.substring(0, length) + '...';
            }

            $.each(data.GetPressReleaseListResult, function(i, value) {
                var date = new Date(value.PressReleaseDate),
                    year = date.getFullYear();

                // if year isn't in the array, add it
                if ($.inArray(year, years) == -1) {
                    years.push(year);
                }
                if (!(year in itemsByYear)) {
                    itemsByYear[year] = [];
                }

                var item = {
                    title: truncate(value.Headline, o.titleLength),
                    thumb: value.ThumbnailPath || o.defaultThumb,
                    date: $.datepicker.formatDate(o.dateFormat, date),
                    url: value.LinkToDetailPage,
                    body: truncate(value.Body, o.bodyLength),
                    shortBody: truncate(value.ShortBody, o.shortBodyLength)
                };

                tplData.items.push(item);
                itemsByYear[year].push(item);
            });

            // sort the years in descending order
            years.sort(function(a, b) { return b - a });
            $.each(years, function (i, year) {
                tplData.years.push({
                    year: year,
                    items: itemsByYear[year]
                });
            });

            return tplData;
        },

        _renderNewsWidget: function (tplData) {
            var o = this.options,
                $e = this.element;

            // render the overall template
            // this may or may not contain individual years/items
            $e.append(Mustache.render(o.template, tplData));

            // if optional year container and template are specified,
            // render individual years using these
            if (o.yearContainer && o.yearTemplate) {
                $(o.yearContainer, $e).empty();
                $.each(tplData.years, function (i, year) {
                    $(o.yearContainer, $e).append(Mustache.render(o.yearTemplate, year));
                });
                this._trigger('yearsComplete');
            }

            // render individual items if applicable
            this._renderNewsItems(tplData);

            // add not found message if specified
            if (o.notFoundContainer && o.notFoundMessage && !tplData.items.length) {
                $(o.notFoundContainer, $e).html(o.notFoundMessage);
            }

            // fire final callback
            this._trigger('complete');
        },

        _renderNewsItems: function (tplData) {
            var o = this.options,
                $e = this.element;

            // if optional item container and template are specified,
            // render individual items using those
            if (o.itemContainer && o.itemTemplate) {
                $(o.itemContainer, $e).empty();
                $.each(tplData.items, function (i, item) {
                    $(o.itemContainer, $e).append(Mustache.render(o.itemTemplate, item));
                });
                // fire this callback only if we are doing individual rendering
                this._trigger('itemsComplete');
            }
        },
    });
})(jQuery);
