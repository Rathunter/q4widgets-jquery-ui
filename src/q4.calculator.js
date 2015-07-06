(function ($) {
    /**
     * Calculates the growth of an investment in a company's stock over a set time period.
     * @class q4.calculator
     * @version 1.0.0
     * @author marcusk@q4websystems.com
     * @requires [Highstock](lib/highstock.js)
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget('q4.calculator', /** @lends q4.calculator */ {
        options: {
            /**
             * The base URL of the Q4 website.
             * @type {string}
             * @example //feeds.q4websystems.com
             */
            url: '',
            /**
             * Whether to use public feeds for data. This requires the `apiKey` option.
             * @type {boolean}
             * @default
             */
            usePublic: false,
            /**
             * The Q4 API key. Required if `usePublic` is `true`, otherwise ignored.
             * @type {string}
             */
            apiKey: '',
            /**
             * The stock exchange to use.
             * If this is not specified, the widget will look for `?Indice=EXCH:SYM` in the URL.
             * @type {string}
             */
            exchange: '',
            /**
             * The stock symbol to use.
             * If this is not specified, the widget will look for `?Indice=EXCH:SYM` in the URL.
             * @type {string}
             */
            symbol: '',
            /**
             * A date format string to use with jQuery UI's Datepicker.
             * @type {string}
             * @default
             */
            dateFormat: 'M d, yy',
            /**
             * The earliest date that will be available as an option. Default is Jan 1, 1970.
             * @type {Date}
             * @type {string}
             */
            minDate: null,
            /**
             * The latest date that will be available as an option. Default is the current day.
             * @type {Date}
             * @type {string}
             */
            maxDate: null,
            /**
             * A selector for the element to use as the start date picker. Usually an `<input>`.
             * @type {string}
             * @default
             */
            startDatepicker: '.startDate',
            /**
             * A selector for the element to use as the end date picker. Usually an `<input>`.
             * @type {string}
             * @default
             */
            endDatepicker: '.endDate',
            /**
             * A set of options to pass directly to the datepicker constructor.
             * @type {Object}
             */
            datepickerOpts: {},
            /**
             * A selector for an input element for the investment amount.
             * @type {string}
             * @default
             */
            amountInput: '.amount',
            /**
             * The default amount to use in case no valid amount is submitted.
             * If set to a falsy value, prevent calculating without a valid amount.
             * @type {number}
             * @default
             */
            defaultAmount: 10000,
            /**
             * A selector for a trigger element that will perform the lookup when clicked.
             * @type {string}
             * @default
             */
            trigger: '.calculate',
            /**
             * A CSS class to add to the widget while data is loading.
             * This can be used to show and hide elements within the widget.
             * @type {string}
             */
            loadingClass: '',
            /**
             * A selector for the container that will be filled with the investment results.
             * @type {string}
             * @default
             */
            infoContainer: '.info',
            /**
             * A Mustache template used to render the investment results in the quote container.
             * The following tags are available:
             *
             * - `{{startDate}}`   The initial date of the investment.
             * - `{{endDate}}`     The final date of the investment.
             * - `{{startPrice}}`  The price per share at time of investment.
             * - `{{endPrice}}`    The final price per share.
             * - `{{totalReturn}}` The total gain as a percentage of the initial investment.
             * - `{{cagr}}`        The compounded annual growth rate.
             * - `{{startAmount}}` The initial amount of the investment.
             * - `{{endAmount}}`   The final amount of the investment.
             * - `{{shares}}`      The number of shares purchased.
             * - `{{years}}`       The number of years invested.
             * @type {string}
             * @example
             * 'Starting date: {{startDate}}<br>' +
             * 'Ending date: {{endDate}}<br>' +
             * 'Starting price/share: ${{startPrice}}<br>' +
             * 'Ending price/share: ${{endPrice}}<br>' +
             * 'Total return: {{totalReturn}}%<br>' +
             * 'Compound annual growth rate: {{cagr}}%<br>' +
             * 'Starting investment: ${{startAmount}}<br>' +
             * 'Ending investment: ${{endAmount}}<br>' +
             * 'Years: {{years}}<br>'
             */
            infoTemplate: '',
            /**
             * A selector for the stock chart.
             * @type {string}
             * @default
             */
            chartContainer: '.chart',
            /**
             * A set of options to pass directly to Highcharts.
             * @type {Object}
             */
            highstockOpts: {}
        },

        _init: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            // set up the date pickers
            var datepickerOpts = $.extend({}, {
                minDate: o.minDate === null ? null : new Date(o.minDate),
                maxDate: o.maxDate === null ? 0 : new Date(o.maxDate),
                dateFormat: o.dateFormat,
                changeMonth: true,
                changeYear: true
            }, o.datepickerOpts);
            var $startpicker = $(o.startDatepicker, $e).val('').datepicker(datepickerOpts);
            var $endpicker = $(o.endDatepicker, $e).val('').datepicker(datepickerOpts);

            // set up the calculate event
            $(o.trigger, $e).click(function (e) {
                e.preventDefault();

                var amount = Number($(o.amountInput, $e).val()) || o.defaultAmount;
                // abort if no amount and no default amount
                if (!amount) return;

                $e.addClass(o.loadingClass);
                $(o.infoContainer, $e).empty();
                $(o.chartContainer, $e).empty();

                var startDate = $startpicker.datepicker('getDate'),
                    endDate = $endpicker.datepicker('getDate');

                _._fetchStockData(startDate, endDate)
                .done(function (data) {
                    // sort in forward chronological order
                    _._calculate(amount, startDate, endDate, data.GetStockQuoteHistoricalListResult.reverse());
                    $e.removeClass(o.loadingClass);
                });
            });
        },

        _fetchStockData: function (startDate, endDate) {
            var o = this.options;

            if (o.usePublic) {
                return $.ajax({
                    type: 'GET',
                    url: o.url + '/feed/StockQuote.svc/GetStockQuoteHistoricalList',
                    data: {
                        apiKey: o.apiKey,
                        exchange: o.exchange,
                        symbol: o.symbol,
                        startDate: $.datepicker.formatDate('M-dd-yy', startDate),
                        endDate: $.datepicker.formatDate('M-dd-yy', endDate)
                    },
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'jsonp'
                });
            }
            else {
                return $.ajax({
                    type: 'POST',
                    url: o.url + '/Services/StockQuoteService.svc/GetStockQuoteHistoricalList',
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify({
                        exchange: o.exchange,
                        symbol: o.symbol,
                        startDate: '/Date(' + startDate.getTime() + ')/',
                        endDate: '/Date(' + endDate.getTime() + ')/',
                        serviceDto: {
                            ViewType: GetViewType(),
                            ViewDate: GetViewDate(),
                            RevisionNumber: GetRevisionNumber(),
                            LanguageId: GetLanguageId(),
                            Signature: GetSignature()
                        }
                    })
                });
            }
        },

        _addCommas: function (val) {
            var parts = ('' + val).split('.'),
                whole = parts[0],
                dec = parts[1],
                rgx = /(\d+)(\d{3})/;

            while (rgx.test(whole)) {
                whole = whole.replace(rgx, '$1,$2');
            }
            return whole + (dec ? '.' + dec : '');
        },

        _calculate: function (amount, startDate, endDate, data) {
            var o = this.options,
                $e = this.element;

            var startPrice = data[0].Last,
                endPrice = data.slice(-1)[0].Last,
                shares = amount / startPrice,
                endAmount = endPrice * shares,
                years = (endDate - startDate) / 1000 / 60 / 60 / 24 / 365.24,
                cagr = Math.pow(endAmount / amount, 1 / years) - 1;

            var returns = $.map(data, function (day) {
                // return an array in an array because jQuery.map flattens results
                return [[
                    new Date(day.HistoricalDate).getTime(),
                    day.Last * shares
                ]];
            });

            // render info area
            $(o.infoContainer, $e).html(Mustache.render(o.infoTemplate, {
                startDate: $.datepicker.formatDate(o.dateFormat, startDate),
                endDate: $.datepicker.formatDate(o.dateFormat, endDate),
                startPrice: startPrice.toFixed(2),
                endPrice: endPrice.toFixed(2),
                totalReturn: this._addCommas(((endPrice - startPrice) / startPrice * 100).toFixed(2)),
                cagr: (cagr * 100).toFixed(2),
                shares: this._addCommas(shares),
                startAmount: this._addCommas(amount.toFixed(2)),
                endAmount: this._addCommas(endAmount.toFixed(2)),
                years: Math.round(years * 10) / 10
            }));

            // render stock chart
            $(o.chartContainer, $e).highcharts('StockChart', $.extend(true, {
                navigator: {
                    enabled: false
                },
                rangeSelector: {
                    enabled: false,
                    selected: 5  // default to "All"
                },
                series: [{
                    name: o.symbol,
                    data: returns,
                    tooltip: {
                        valueDecimals: 2
                    }
                }]
            }, o.highstockOpts));
        }
    });
})(jQuery);
