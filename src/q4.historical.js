(function($) {
    /**
     * Retrieves price and volume information for a stock on a specific date.
     * @class q4.historical
     * @version 2.0.0
     * @author marcusk@q4websystems.com
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget('q4.historical', /** @lends q4.historical */ {
        options: {
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
            startDate: null,
            /**
             * The latest date that will be available as an option. Default is the current day.
             * @type {Date}
             * @type {string}
             */
            endDate: null,
            /**
             * A selector for the element to use as a datepicker. Usually an `<input>`.
             * @type {string}
             * @default
             */
            datepicker: 'input:first',
            /**
             * A set of options to pass directly to the datepicker constructor.
             * @type {Object}
             */
            datepickerOpts: {},
            /**
             * A selector for a trigger element that will perform the lookup when clicked.
             * If this is not specified, the lookup will occur when the `datepicker` element's
             * value changes.
             * @type {string}
             */
            trigger: '',
            /**
             * A selector for the container that will be filled with the lookup results.
             * @type {string}
             * @default
             */
            quoteContainer: '.quote',
            /**
             * A Mustache template used to render the lookup results in the quote container.
             * The following tags are available:
             *
             * - `{{date}}`   The date of the historical stock quote.
             * - `{{volume}}` The trading volume of the stock on that date.
             * - `{{open}}`   The opening stock price on that date.
             * - `{{close}}`  The closing stock price on that date.
             * - `{{high}}`   The stock's highest trading price on that date.
             * - `{{low}}`    The stock's lowest trading price on that date.
             * @type {string}
             * @example
             * 'Date: {{date}}<br>' +
             * 'Volume: {{volume}}<br>' +
             * 'Open: {{open}}<br>' +
             * 'Close: {{close}}<br>' +
             * 'High: {{high}}<br>' +
             * 'Low: {{low}}'
             */
            quoteTemplate: '',
            /**
             * A message to display in the quote container in case no results were found.
             * @type {string}
             * @default
             */
            notFoundMessage: 'No stock data is available for this date.'
        },

        _init: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            // get exchange and symbol from query string if not in options
            if (!o.exchange || !o.symbol) {
                var m = document.location.search.match(/(?:^|&)Indice=([a-z]+):([a-z]+)(?:$|&)/i);
                if (!m) {
                    console.log('Error initializing stock historical chart: no exchange/symbol found.');
                    return;
                }
                o.exchange = o.exchange || m[1];
                o.symbol = o.symbol || m[2];
            }

            // set up the date picker
            var $picker = $(o.datepicker, $e).val('').datepicker($.extend({}, {
                minDate: o.startDate === null ? null : new Date(o.startDate),
                maxDate: o.endDate === null ? 0 : new Date(o.endDate),
                dateFormat: o.dateFormat,
                changeMonth: true,
                changeYear: true
            }, o.datepickerOpts));

            // event handler
            function getQuote(e) {
                e.preventDefault();
                var date = $picker.datepicker('getDate');
                if (date === null) return;
                _._fetchQuote(date).done(function (data) {
                    _._renderQuote(data);
                });
            }

            // assign a click event if a trigger has been specified; otherwise use a change event
            var $trigger = $(o.trigger, $e);
            if (o.trigger && $trigger.length) $trigger.click(getQuote);
            else $picker.change(getQuote);

            // fetch and render today's quote
            _._fetchQuote(new Date()).done(function (data) {
                _._renderQuote(data);
            });
        },

        _fetchQuote: function (date) {
            var o = this.options;

            return $.ajax({
                type: 'POST',
                url: '/services/StockQuoteService.svc/GetStockQuoteHistoricalList',
                data: JSON.stringify({
                    serviceDto: {
                        RevisionNumber: GetRevisionNumber(),
                        LanguageId: GetLanguageId(),
                        Signature: GetSignature(),
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        StartIndex: 0,
                        ItemCount: 1
                    },
                    exchange: o.exchange,
                    symbol: o.symbol,
                    endDate: '/Date(' + date.getTime() + ')/'
                }),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            });
        },

        _renderQuote: function (data) {
            var o = this.options,
                $e = this.element;

            if (!data.GetStockQuoteHistoricalListResult.length) {
                $(o.quoteContainer, $e).html(o.notFoundMessage);
                return;
            }

            data = data.GetStockQuoteHistoricalListResult[0];

            $(o.quoteContainer, $e).html(Mustache.render(o.quoteTemplate, {
                date: $.datepicker.formatDate(o.dateFormat, new Date(data.HistoricalDate)),
                high: data.High,
                low: data.Low,
                open: data.Open,
                close: data.Last,
                volume: this._addCommas(data.Volume)
            }));
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
        }
    });
})(jQuery);
