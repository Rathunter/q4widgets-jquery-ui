(function ($) {
    /**
     * Widget for aggregating multiple types of Q4 private API data.
     * @class q4.apiMashup
     * @version 1.5.1
     * @author marcusk@q4websystems.com
     * @requires [Mustache.js](lib/mustache.min.js)
     * @requires [Moment.js_(optional)](lib/moment.min.js)
     * </script>
     */
    $.widget('q4.apiMashup', /** @lends q4.apiMashup */ {
        options: {
            /**
             * An object containing content source objects, indexed by an ID string.
             * Each content source object consists of the following options,
             * plus any additional options made available by the specific content type.
             * These are listed at the end of the file.
             * @prop type    {string} The content type of this source (required).
             *    Can be "downloads", "events", "presentations", or "news".
             * @prop limit   {number} The maximum number of items to fetch for this source.
             */
            contentSources: {},
            /**
             * The ID of the content source to display when the widget is initialized.
             * If this value is false or unset, display all sources.
             * @type {string}
             */
            startSource: null,
            /**
             * The base URL to use for API calls.
             * By default, calls go to the current domain, so this option is usually unnecessary.
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
             * Note that setting this to true doesn't necessarily display all the items,
             * but will fetch them all from the server in case you want to do something with them.
             * If `showAllYears` is true, this is assumed to be true also.
             * @type {boolean}
             * @default
             */
            fetchAllYears: false,
            /**
             * Whether to include an "all years" option in template data and year selectors.
             * If true, the widget will display all year data by default on first load;
             * otherwise it will start with data from the most recent year.
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
             * The year to display when the widget first loads.
             * Default is to display items from all years if that option is enabled,
             * otherwise the most recent year.
             * A useful value you might want to pass is `(new Date()).getFullYear()`,
             * which will display items from the current calendar year.
             * @type {?number}
             */
            startYear: null,
            /**
             * Whether to start with `startYear` even if there are no documents for that year.
             * @type {boolean}
             * @default
             */
            forceStartYear: false,
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
             * A date format string, which can be used in the template as `{{date}}`.
             * Can alternately be an object of format strings,
             * which can be accessed with `{{date.key}}` (where key is the
             * object key corresponding to the string you want to use).
             * By default, dates are formatted using jQuery UI's datepicker.
             * @example 'MM d, yy'
             * @example
             * {
             *     full: 'MM d, yy',
             *     short: 'mm/dd/y',
             *     month: 'MM',
             *     day: 'd'
             * }
             * @type {string|Object}
             * @default
             */
            dateFormat: 'mm/dd/yy',
            /**
             * Whether to use Moment.js to format dates instead of datepicker.
             * Only takes effect if the Moment.js library has been included.
             * @type {boolean}
             * @default
             */
            useMoment: false,
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
             * A Mustache.js template for the overall widget.
             * This option is not required; you can also use `yearTemplate` and item templates
             * to build the widget on top of existing layout.
             *
             * The following tags are available:
             *
             * - `{{#contentSources}}` An array of content source IDs.
             * - `{{#years}}` An array of years for the navigation. Each year has these subtags:
             *
             *   - `{{year}}`   The display label of the year (e.g. `"2015"`, `"All Years"`)
             *   - `{{value}}`  The internal value of the year (e.g. `2015`, `-1`)
             *   - `{{#items}}` An array of items for this year, with the same format as the
             *       "all items" array.
             * - `{{#items}}` An array of all items. Each item has a number of available subtags,
             *   which vary depending which content type you are using.
             *   Content types and their subtags are documented later in this file.
             *   If you are mixing different content types, it is recommended to use
             *   the `itemContainer` option and set templates separately for each content source.
             *
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
             * Whether to append the main template to the widget container,
             * or replace the widget's contents entirely.
             * @type {boolean}
             * @default
             */
            append: true,
            /**
             * A message or HTML string to display while first loading the widget.
             * Set to `false` to disable this feature. See also `itemLoadingMessage`.
             * @type {?(string|boolean)}
             * @default
             */
            loadingMessage: 'Loading...',
            /**
             * A selector for the year navigation container.
             * Use this if you don't want to use the `template` option to draw the widget,
             * but you still want to generate a list of years.
             * You must also pass `yearTemplate` for this to have any effect.
             * @type {?string}
             */
            yearContainer: null,
            /**
             * A Mustache.js template for a single year.
             * If this and `yearContainer` are passed, this will be used to render each option in
             * the year navigation, which will be attached to the widget at `yearContainer`.
             * See the `template` option for available tags.
             * @type {?string}
             * @example '<li>{{year}}</li>'
             * @example '<option value="{{value}}">{{year}}</option>'
             */
            yearTemplate: null,
            /**
             * A CSS selector for year trigger links.
             * If passed, any elements in the widget matching this selector will
             * become clickable links that filter the displayed items by year.
             * Usually you'll want to point this to an element in the template's `{{years}}` loop.
             *
             * Note that this doesn't automatically generate the year links;
             * you can do that in the template.
             * @example 'a.yearLink'
             * @type {?string}
             */
            yearTrigger: null,
            /**
             * A CSS selector for a year selectbox.
             * This behaves like the `yearTrigger` option, except instead of pointing to
             * individual links, it should point to a `<select>` or similar form element.
             *
             * Note that this doesn't automatically fill the box with `<option>`s;
             * you can do that in the template.
             * @example 'select.yearsDropdown'
             * @type {?string}
             */
            yearSelect: null,
            /**
             * The CSS class to add to a selected year trigger.
             * @type {string}
             * @default
             */
            activeClass: 'active',
            /**
             * A selector for the items container.
             * Use this if you want to redraw only the item list at initialization
             * and when the year is updated, instead of redrawing the entire widget.
             * This is recommended if using a set of different content types,
             * so that each content type can use its own item template.
             * @type {?string}
             */
            itemContainer: null,
            /**
             * A Mustache.js template for a single item.
             * This can be overridden by the `template` option on individual content sources.
             * If this and `itemContainer` are passed, this will be used to render the items list,
             * and it will be attached to the widget at `itemContainer`.
             * When the year changes, only this part of the widget will be redrawn,
             * instead of the entire thing.
             * See the `template` option for available tags.
             * @type {string}
             * @example
             * '<li>' +
             *     '<img class="thumb" src="{{thumb}}">' +
             *     '<span class="date">{{date}}</span>' +
             *     '<a href="{{url}}" class="title">{{title}}</a>' +
             * '</li>'
             */
            itemTemplate: '',
            /**
             * A message or HTML string to display while loading items.
             * By default it is the same as `loadingMessage`.
             * You must also pass `itemContainer` for this to have any effect.
             * Set to `false` to disable this feature.
             * @type {?string}
             */
            itemLoadingMessage: null,
            /**
             * A message or HTML string to display in the items container if no items are found.
             * @type {string}
             * @default
             */
            itemNotFoundMessage: 'No items found.',
            /**
             * A callback that fires when the active year changes.
             * @type {function}
             * @param {Event} [event] The triggering event object.
             */
            onYearChange: function (e) {},
            /**
             * A callback that fires when the active content source changes.
             * @type {function}
             * @param {Event} [event] The triggering event object.
             */
            onContentSourceChange: function (e) {},
            /**
             * A callback that fires before the full widget is rendered.
             * @type {function}
             * @param {Event} [event] The event object.
             * @param {Object} [templateData] The complete template data.
             */
            beforeRender: function (e, tplData) {},
            /**
             * A callback that fires before the items list is rendered.
             * This only fires if `itemContainer` is set.
             * @type {function}
             * @param {Event} [event] The event object.
             * @param {Object} [templateData] Template data for the items list.
             */
            beforeRenderItems: function (e, tplData) {},
            /**
             * A callback that fires after the item list is rendered.
             * This only fires if `itemContainer` is set.
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
        activeSource: null,

        _init: function () {
            var o = this.options,
                $e = this.element;

            this._normalizeOptions();

            // clear the element if applicable
            if (!o.append) $e.empty();
            // save a reference to the widget and append the loading message
            this.$widget = $(o.loadingMessage || '').appendTo($e);

            this._initWidget(o.startSource);
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

            // ensure starting content source ID is in the list of content sources
            if (o.startSource && !(o.startSource in o.contentSources)) o.startSource = null;

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

            // if "all years" is enabled and it's the default, fetch all years
            if (o.showAllYears && !o.startYear) o.fetchAllYears = true;
        },

        _initWidget: function (contentSourceID) {
            var _ = this,
                o = this.options;

            // store this for later re-renders when year is changed
            this.activeSource = contentSourceID;

            var sourceList = [],
                yearPromises = [];
            // get years (and possibly items at the same time) for each content source
            $.each(o.contentSources, function (id) {
                // if a source ID was passed, filter sources
                if (contentSourceID && contentSourceID != id) return true;

                // save an ordered list of sources for reference as promises are resolved
                sourceList.push(id);

                yearPromises.push(_._getYears(id));
            });

            $.when.apply(null, yearPromises).done(function () {
                // if multiple promises were passed, each argument will be a set of results
                // first argument is a list of years, second is an optional list of items
                var results = (yearPromises.length > 1 ? arguments : [arguments]);

                // aggregate years from each content source
                var years = [];
                $.each(results, function (i, result) {
                    $.each(result[0], function (j, year) {
                        if ($.inArray(year, years) == -1) years.push(year);
                    });
                });
                _.years = _._filterYears(years);
                var activeYear = _._getActiveYear(_.years);

                // fetch items for each content source
                var itemPromises = [];
                $.each(results, function (i, result) {
                    // if items were returned, add them as a resolved promise
                    // otherwise add a promise from fetchItems
                    itemPromises.push(result[1] !== null ? result[1] :
                        _._fetchItems(sourceList[i], o.fetchAllYears ? -1 : activeYear));
                });

                $.when.apply(null, itemPromises).done(function () {
                    // merge item arrays, sort by date and slice to global limit
                    var items = Array.prototype.concat.apply([], arguments);
                    items.sort(function (a, b) {
                        return a.dateObj - b.dateObj;
                    });
                    if (o.limit) items = items.slice(0, o.limit);

                    _._renderWidget(items, activeYear);
                });
            });
        },

        _getYears: function (contentSourceID) {
            var o = this.options,
                gotYears = $.Deferred();

            // if we're fetching all docs for all years, skip fetching the year list
            // also skip the year list if this source has a limit on item count
            if ((o.fetchAllYears && !o.limit) || o.contentSources[contentSourceID].limit) {
                // get items for all years
                this._fetchItems(contentSourceID, -1).done(function (items) {
                    // get list of years from items
                    var years = [];
                    $.each(items, function (i, item) {
                        if ($.inArray(item.year, years) == -1) years.push(item.year);
                    });

                    // return years and items
                    gotYears.resolve(years, items);
                });
            }
            else {
                this._fetchYears(contentSourceID).done(function (years) {
                    gotYears.resolve(years, null);
                });
            }

            return gotYears;
        },

        _filterYears: function (years) {
            var o = this.options;

            // filter years
            years = $.grep(years, function (year) {
                return (
                    (!o.maxYear || year <= o.maxYear) &&
                    (!o.minYear || year >= o.minYear) &&
                    (!o.years.length || $.inArray(year, o.years) > -1)
                );
            });

            // force startYear onto the years array if requested
            if (o.forceStartYear && $.inArray(o.startYear, years) == -1)
                years.push(o.startYear);

            // sort the years in descending order
            years.sort(function (a, b) { return b - a });

            return years;
        },

        _getActiveYear: function (years) {
            var o = this.options;

            if (years.length) {
                // if o.startYear is specified and it exists, use it
                if ($.inArray(o.startYear, years) > -1) return o.startYear;
                // otherwise if "all" is not enabled, use the most recent
                else if (!o.showAllYears) return years[0];
            }
            return -1;
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

        _fetchYears: function (contentSourceID) {
            var _ = this,
                o = this.options,
                contentSource = o.contentSources[contentSourceID],
                contentType = this.contentTypes[contentSource.type],
                options = $.extend({}, this.options, contentType.options, contentSource),
                gotYears = $.Deferred();

            this._callApi(contentType.yearsUrl, $.extend(true,
                this._buildParams(),
                contentType.buildParams.call(this, options),
                {
                    serviceDto: {
                        TagList: !o.tags.length ? null : o.tags
                    }
                }
            )).done(function (data) {
                gotYears.resolve(data[contentType.yearsResultField]);
            });

            return gotYears;
        },

        _fetchAllItems: function (year, contentSourceID) {
            var _ = this,
                o = this.options,
                gotItems = $.Deferred();

            // fetch items for each content source
            var itemPromises = [];
            $.each(o.contentSources, function (id) {
                // if a source ID was passed, filter sources
                if (contentSourceID && contentSourceID != id) return true;

                itemPromises.push(_._fetchItems(id, year));
            });

            $.when.apply(null, itemPromises).done(function (results) {
                // merge item arrays, sort by date and slice to global limit
                var items = Array.prototype.concat.apply([], results);
                items.sort(function (a, b) {
                    return a.dateObj - b.dateObj;
                });
                if (o.limit) items = items.slice(0, o.limit);
                gotItems.resolve(items);
            });

            return gotItems;
        },

        _fetchItems: function (contentSourceID, year) {
            var _ = this,
                o = this.options,
                contentSource = o.contentSources[contentSourceID],
                contentType = this.contentTypes[contentSource.type],
                options = $.extend({}, this.options, contentType.options, contentSource),
                gotItems = $.Deferred();

            this._callApi(contentType.itemsUrl, $.extend(true,
                this._buildParams(),
                contentType.buildParams.call(this, options),
                {
                    serviceDto: {
                        ItemCount: contentSource.limit || -1,
                        StartIndex: o.skip,
                        TagList: !o.tags.length ? null : o.tags,
                        IncludeTags: true
                    },
                    year: year
                }
            )).done(function (data) {
                gotItems.resolve($.map(data[contentType.itemsResultField], function (rawItem) {
                    var item = contentType.parseItem.call(_, options, rawItem);
                    item.contentSourceID = contentSourceID;
                    return item;
                }));
            });

            return gotItems;
        },

        _truncate: function (text, length) {
            if (!text) return '';
            return !length || text.length <= length ? text : text.substring(0, length) + '...';
        },

        _formatDate: function (dateString) {
            var o = this.options,
                date = new Date(dateString),
                useMoment = o.useMoment && typeof moment != 'undefined';

            if (typeof o.dateFormat == 'string') {
                // if o.dateFormat is a format string, return a formatted date string
                return useMoment ? moment(date).format(o.dateFormat) :
                    $.datepicker.formatDate(o.dateFormat, date);
            }
            else if (typeof o.dateFormat == 'object') {
                // if o.dateFormat is an object of names to format strings,
                // return an object of names to formatted date strings
                var dates = {};
                for (name in o.dateFormat) {
                    dates[name] = useMoment ? moment(date).format(o.dateFormat[name]) :
                        $.datepicker.formatDate(o.dateFormat[name], date);
                }
                return dates;
            }
        },

        _buildTemplateData: function (items) {
            var _ = this,
                o = this.options,
                itemsByYear = {},
                tplData = {
                    items: [],
                    years: [],
                    contentSources: $.map(o.contentSources, function (source, id) {
                        return id;
                    })
                };

            $.each(items, function (i, item) {
                // only save items that are in the years array
                if ($.inArray(item.year, _.years) == -1) return true;
                if (!(item.year in itemsByYear)) itemsByYear[item.year] = [];

                // add item to template data
                tplData.items.push(item);
                itemsByYear[item.year].push(item);
            });

            // build per-year data for template
            $.each(this.years, function (i, year) {
                tplData.years.push({
                    year: year,
                    value: year,
                    items: itemsByYear[year] || []
                });
            });

            // add "all years" option, if there are years to show
            if (o.showAllYears && this.years.length) {
                tplData.years.unshift({
                    year: o.allYearsText,
                    value: -1,
                    items: tplData.items
                });
            }

            return tplData;
        },

        _renderItems: function (items) {
            var _ = this,
                o = this.options,
                $e = this.element;

            this._trigger('beforeRenderItems', null, {items: items});

            if (items.length) {
                $(o.itemContainer, $e).empty();
                $.each(items, function (i, item) {
                    var template = o.contentSources[item.contentSourceID].template || o.itemTemplate;
                    $(o.itemContainer, $e).append(Mustache.render(template, item));
                });
            } else {
                $(o.itemContainer, $e).html(o.itemNotFoundMessage);
            }

            this._trigger('itemsComplete');
        },

        _renderWidget: function (items, activeYear) {
            var _ = this,
                o = this.options,
                $e = this.element;

            // get template data
            var tplData = this._buildTemplateData(items);

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

            // render years separately if applicable
            if (o.yearContainer && o.yearTemplate) {
                $(o.yearContainer, $e).empty();
                $.each(tplData.years, function (i, tplYear) {
                    $(o.yearContainer, $e).append(Mustache.render(o.yearTemplate, tplYear));
                });
            }

            // render items separately
            if (o.itemContainer) {
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

        /**
         * Display items from a particular year. This will refetch the list of items if necessary.
         * @param {number} year    The year to display, or -1 for all years.
         * @param {Event}  [event] The triggering event, if any.
         */
        setYear: function (year, e) {
            var _ = this,
                o = this.options,
                $e = this.element;

            // fire callback, cancel event if default action is prevented
            if (!this._trigger('onYearChange', e)) return;

            // default value if year is invalid
            if ($.inArray(year, this.years) == -1) year = o.showAllYears ? -1 : this.years[0];

            this._updateYearControls(year);

            // display loading message
            if (o.itemContainer) {
                if (o.itemLoadingMessage !== false) $(o.itemContainer, $e).html(o.itemLoadingMessage);
            }
            else if (o.loadingMessage !== false) {
                this.$widget.remove();
                this.$widget = $(o.loadingMessage).appendTo($e);
            }

            var contentType = this.contentTypes[this.contentType];

            // get items for selected year
            this._fetchAllItems(year, this.activeSource).done(function (items) {
                if (o.itemContainer) {
                    // rerender item section
                    _._renderItems(items);
                }
                else {
                    // rerender entire widget
                    _._renderWidget(items, year);
                }
            });
        },

        setContentSource: function (contentSourceID, e) {
            var _ = this,
                o = this.options,
                $e = this.element;

            // fire callback, cancel event if default action is prevented
            if (!this._trigger('onContentSourceChange', e)) return;

            this.activeSource = contentSourceID;
            this._initWidget(contentSourceID);
        },

        contentTypes: {
            downloads: {
                options: {
                    /**
                     * The download type.
                     * @type {string}
                     */
                    downloadType: '',
                    /**
                     * A Mustache.js template for a single download, with these tags:
                     *
                     * - `{{title}}`       The title of the download.
                     * - `{{description}}` The download description.
                     * - `{{url}}`         The URL of the document.
                     * - `{{date}}`        The date of the download.
                     * - `{{type}}`        The download type.
                     * - `{{fileType}}`    The file type.
                     * - `{{size}}`        The file size.
                     * - `{{icon}}`        The URL of the document's icon.
                     * - `{{thumb}}`       The URL of the document's thumbnail image.
                     * - `{{#tags}}`       An array of tags for this download.
                     */
                    template: ''
                },

                itemsUrl: '/Services/ContentAssetService.svc/GetContentAssetList',
                yearsUrl: '/Services/ContentAssetService.svc/GetContentAssetYearList',
                itemsResultField: 'GetContentAssetListResult',
                yearsResultField: 'GetContentAssetYearListResult',

                buildParams: function (o) {
                    return {
                        assetType: o.downloadType,
                    };
                },

                parseItem: function (o, result) {
                    return {
                        title: this._truncate(result.Title, o.titleLength),
                        url: result.FilePath,
                        dateObj: new Date(result.ContentAssetDate),
                        year: new Date(result.ContentAssetDate).getFullYear(),
                        date: this._formatDate(result.ContentAssetDate),
                        type: result.Type,
                        fileType: result.FileType,
                        size: result.FileSize,
                        icon: result.IconPath,
                        thumb: result.ThumbnailPath,
                        tags: result.TagsList,
                        description: this._truncate(result.Description, o.bodyLength)
                    };
                }
            },

            events: {
                options: {
                    /**
                     * A Mustache.js template for a single event, with these tags:
                     *
                     * - `{{title}}`    The title of the event.
                     * - `{{url}}`      The URL of the details page.
                     * - `{{date}}`     The starting date of the event.
                     * - `{{endDate}}`  The ending date of the event.
                     * - `{{timeZone}}` The timezone of the start/end dates.
                     * - `{{location}}` The location of the event.
                     * - `{{#tags}}`    An array of tags for this event.
                     * - `{{body}}`     The body of the event details.
                     * - `{{#docs}}`    An array of attached documents, with the following tags:
                     *
                     *   - `{{title}}`     The title of the document.
                     *   - `{{url}}`       The URL of the document.
                     *   - `{{type}}`      The type of document as specified in the CMS.
                     *   - `{{extension}}` The extension of the document file name.
                     *   - `{{size}}`      The size of the document file.
                     * @type {string}
                     */
                    template: ''
                },

                itemsUrl: '/Services/EventService.svc/GetEventList',
                yearsUrl: '/Services/EventService.svc/GetEventYearList',
                itemsResultField: 'GetEventListResult',
                yearsResultField: 'GetEventYearListResult',

                buildParams: function (o) {
                    return {
                        eventSelection: o.showFuture && !o.showPast ? 1 : (o.showPast && !o.showFuture ? 0 : 3),
                        includePresentations: true,
                        includePressReleases: true,
                        sortOperator: o.sortAscending ? 0 : 1
                    };
                },

                parseItem: function (o, result) {
                    var item = {
                        title: this._truncate(result.Title, o.titleLength),
                        url: result.LinkToDetailPage,
                        dateObj: new Date(result.StartDate),
                        year: new Date(result.StartDate).getFullYear(),
                        date: this._formatDate(result.StartDate),
                        endDate: this._formatDate(result.EndDate),
                        timeZone: result.TimeZone,
                        location: result.Location,
                        tags: result.TagsList,
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
            },

            financials: {
                options: {
                    /**
                     * A list of report subtypes to display, or an empty list to display all.
                     * Valid values are:
                     *
                     * - `Annual Report`
                     * - `Supplemental Report`
                     * - `First Quarter`
                     * - `Second Quarter`
                     * - `Third Quarter`
                     * - `Fourth Quarter`
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
                    /**
                     * A Mustache.js template for the overall widget.
                     * All the tags documented in the [q4.api](q4.api.html#option-template)
                     * parent widget are available here.
                     * In addition, the `{{#items}}` array contains these tags:
                     *
                     * - `{{title}}` The title (i.e. subtype and year) of the financial report.
                     * - `{{year}}`  The fiscal year of the financial report.
                     * - `{{date}}`  The filing date of the financial report.
                     * - `{{type}}`  The subtype of the report (e.g. `First Quarter`, `Annual Report`).
                     * - `{{shortType}}` A shortened name for the financial report's subtype
                     *   (e.g. `Q1`, `Annual`). These can be customized with the `shortTypes` option.
                     * - `{{coverUrl}}`  The URL of the cover image, if any.
                     * - `{{#docs}}` An array of documents for this report, with these tags:
                     *
                     *   - `{{docTitle}}`    The title of the document.
                     *   - `{{docUrl}}`      The URL of the document file.
                     *   - `{{docCategory}}` The category of the document.
                     *   - `{{docSize}}`     The file size of the document.
                     *   - `{{docThumb}}`    The URL of the thumbnail image, if any.
                     *   - `{{docType}}`     The file type of the document.
                     * @type {string}
                     */
                    template: ''
                },

                itemsUrl: '/Services/FinancialReportService.svc/GetFinancialReportList',
                yearsUrl: '/Services/FinancialReportService.svc/GetFinancialReportYearList',
                itemsResultField: 'GetFinancialReportListResult',
                yearsResultField: 'GetFinancialReportYearListResult',

                buildParams: function (o) {
                    return {
                        reportSubTypeList: o.reportTypes
                    };
                },

                parseItem: function (o, result) {
                    return {
                        coverUrl: result.CoverImagePath,
                        title: result.ReportTitle,
                        fiscalYear: result.ReportYear,
                        year: new Date(result.ReportDate).getFullYear(),
                        date: this._formatDate(result.ReportDate),
                        type: result.ReportSubType,
                        shortType: o.shortTypes[result.ReportSubType],
                        docs: $.map(result.Documents, function (doc) {
                            return {
                                docCategory: doc.DocumentCategory,
                                docSize: doc.DocumentFileSize,
                                docThumb: doc.ThumbnailPath,
                                docTitle: _._truncate(doc.DocumentTitle, o.titleLength),
                                docType: doc.DocumentFileType,
                                docUrl: doc.DocumentPath
                            };
                        })
                    };
                }
            },

            presentations: {
                options: {
                    /**
                     * A Mustache.js template for a single presentation, with these tags:
                     *
                     * - `{{title}}`   The title of the presentation.
                     * - `{{url}}`     The URL of the details page.
                     * - `{{date}}`    The date of the presentation.
                     * - `{{#tags}}`   An array of tags for this presentation.
                     * - `{{body}}`    The body of the presentation details.
                     * - `{{docUrl}}`  The URL of the presentation document.
                     * - `{{docSize}}` The size of the presentation document.
                     * - `{{docType}}` The file type of the presentation document.
                     * @type {string}
                     */
                    template: ''
                },

                itemsUrl: '/Services/PresentationService.svc/GetPresentationList',
                yearsUrl: '/Services/PresentationService.svc/GetPresentationYearList',
                itemsResultField: 'GetPresentationListResult',
                yearsResultField: 'GetPresentationYearListResult',

                buildParams: function (o) {
                    return {
                        presentationSelection: o.showFuture && !o.showPast ? 0 : (o.showPast && !o.showFuture ? 1 : 3),
                    };
                },

                parseItem: function (o, result) {
                    return {
                        title: this._truncate(result.Title, o.titleLength),
                        url: result.LinkToDetailPage,
                        dateObj: new Date(result.PresentationDate),
                        year: new Date(result.PresentationDate).getFullYear(),
                        date: this._formatDate(result.PresentationDate),
                        tags: result.TagsList,
                        body: this._truncate(result.Body, o.bodyLength),
                        docUrl: result.DocumentPath,
                        docSize: result.DocumentFileSize,
                        docType: result.DocumentFileType
                    };
                }
            },

            news: {
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
                    shortBodyLength: 0,
                    /**
                     * A Mustache.js template for a single press release, with these tags:
                     *
                     * - `{{title}}`   The title of the press release.
                     * - `{{url}}`     The URL of the details page.
                     * - `{{date}}`    The date of the press release.
                     * - `{{#tags}}`   An array of tags for this press release.
                     * - `{{body}}`    The body of the press release (truncated to `bodyLength`).
                     * - `{{shortBody}}` The short body of the release (truncated to `shortBodyLength`).
                     * - `{{docUrl}}`  The URL of the related document, if any.
                     * - `{{docSize}}` The size of the related document, if any.
                     * - `{{docType}}` The file type of the related document, if any.
                     * - `{{thumb}}`   The URL of the thumbnail image, if any.
                     * @type {string}
                     */
                    template: ''
                },

                itemsUrl: '/Services/PressReleaseService.svc/GetPressReleaseList',
                yearsUrl: '/Services/PressReleaseService.svc/GetPressReleaseYearList',
                itemsResultField: 'GetPressReleaseListResult',
                yearsResultField: 'GetPressReleaseYearListResult',

                buildParams: function (o) {
                    return {
                        pressReleaseSelection: o.showFuture && !o.showPast ? 0 : (o.showPast && !o.showFuture ? 1 : 3),
                        pressReleaseBodyType: o.loadShortBody ? (o.loadBody ? 1 : 3) : (o.loadBody ? 2 : 0),
                        pressReleaseCategoryWorkflowId: o.category
                    };
                },

                parseItem: function (o, result) {
                    return {
                        title: this._truncate(result.Headline, o.titleLength),
                        url: result.LinkToDetailPage,
                        dateObj: new Date(result.PressReleaseDate),
                        year: new Date(result.PressReleaseDate).getFullYear(),
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
            }
        }
    });
})(jQuery);
