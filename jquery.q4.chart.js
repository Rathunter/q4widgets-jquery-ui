(function ($) {
    /* requires: highstock 2.0 */
    $.widget('q4.chart', {
        options: {
            /* The base URL to use for the API. */
            url: '//feeds.q4websystems.com',
            /* Whether to use the public feed API or the private API. */
            usePublic: true,
            /* The API key to use for public feeds. */
            apiKey: '',
            /* The stock symbols that will appear on the stock price chart.
             * This is an array of tuples, where each tuple contains
             * the exchange, the symbol, and an optional custom name to use
             * instead of "EXCHANGE:SYMBOL".
             */
            stocks: [
                ['NYSE', 'XXX', 'NYSE:XXX']
            ],
            /* Whether to prevent stock price charts from being toggled off. */
            lockStock: false,
            /* Whether to show the stock quote in the chart legend. */
            showLegendSymbol: true,
            /* The turboThreshold value for each series. This may need to be
             * raised if there are too many data points. */
            threshold: 1500,
            /* Whether to include a volume chart below the stock price chart. */
            volume: false,
            /* The height of the volume chart, as a percentage. */
            volumeHeight: 40,
            /* Whether to include a series of flags for press releases. */
            news: false,
            /* Whether to show news flags on initial load. */
            newsOnLoad: false,
            /* The maximum number of news items to display on the chart. */
            newsSize: 200,
            /* The maximum length of each news item's title. */
            newsLength: 75,
            /* The news category ID to use (defaults to all). */
            categoryId: '00000000-0000-0000-0000-000000000000',
            /* An array of tags to filter news releases by. */
            tags: [],
            /* Whether to include a series of flags for events. */
            events: false,
            /* Whether to show event flags on initial load. */
            eventsOnLoad: false,
            /* The maximum number of events to display on the chart. */
            eventSize: 100,
            /* A set of Highcharts options for the stock price series. */
            stockOpts: {},
            /* A set of Highcharts options for the volume series. */
            volumeOpts: {},
            /* A set of Highcharts options for the press release series. */
            newsOpts: {},
            /* A set of Highcharts options for the event series. */
            eventsOpts: {},
            /* A set of general Highcharts options to use for the chart. */
            highstock: {
                chart: {
                    height: 400,
                    marginTop: 60
                },
                legend: {
                    enabled: true,
                    align: 'left',
                    verticalAlign: 'top',
                    floating: true
                },
                rangeSelector: {
                    enabled: true,
                    selected: 1
                },
                navigator: {
                    height: 40
                },
                credits: {
                    enabled: true,
                    text: "Q4 Web Systems",
                    href: "http://www.q4websystems.com"
                }
            },
            /* A set of Highcharts configuration options. */
            highchartsOpts: {
                global: {
                    useUTC: false
                }
            },
            /* A callback that is fired after the chart is rendered. */
            onComplete: function () {}
        },

        startDate: null,
        chart: null,

        _create: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            // strip trailing slash from domain
            o.url = o.url.replace(/\/$/, '');

            Highcharts.setOptions(o.highchartsOpts);

            // Request stock data for the first series before chart is initialized
            this._getStockData(o.stocks[0]).done(function (data) {
                if (!data.GetStockQuoteHistoricalListResult.length) {
                    $e.html('There is currently no stock data, please check back later.');
                    return;
                }

                _._initChart(data);
            });
        },

        _initChart: function (data) {
            var _ = this,
                o = this.options,
                $e = this.element;

            // this should be a 2-tuple of stock price and volume data
            var stockData = this._parseStockData(data);

            // build the series objects for stock price, volume, news, events
            o.highstock.series = this._buildSeries();

            // add the first symbol's stock price data as the first series
            o.highstock.series[0].data = stockData[0];
            if (o.volume) {
                // add the first symbol's volume data as the second series
                o.highstock.series[1].data = stockData[1];
                // add a second y-axis
                o.highstock.yAxis = [{}, {}];
            }

            // initialize Highstock
            this.chart = $e.highcharts('StockChart', o.highstock).highcharts();

            if (o.volume) {
                // rescale the volume y-axis according to volumeHeight
                var minmax = this.chart.yAxis[1].getExtremes();
                this.chart.yAxis[1].setExtremes(0, minmax.max * 100 / o.volumeHeight, true, false);
            }

            // if enabled, request news/events data after the chart loads
            if (o.news && o.newsOnLoad) {
                this._getNewsData().done(function (data) {
                    _.chart.get('news').setData(_._parseNewsData(data));
                });
            }
            if (o.events && o.eventsOnLoad) {
                this._getEventsData().done(function (data) {
                    _.chart.get('events').setData(_._parseEventsData(data));
                });
            }

            // callback after chart loads
            this._trigger('onChartComplete');
        },

        _toggleStock: function (series) {
            var _ = this,
                o = this.options,
                i = o.volume ? series._i / 2 : series._i;

            if (o.lockStock) return false;

            // Load the stock price/volume data if it hasn't been already
            if (!series.data.length) {
                this.chart.showLoading();
                this._getStockData(o.stocks[i]).done(function (data) {
                    // this should be a 2-tuple of stock price and volume data
                    var stockData = _._parseStockData(data);

                    // load data into this symbol's price/volume series
                    series.setData(stockData[0]);
                    if (o.volume) {
                        _.chart.get('volume' + i).setData(stockData[1]);
                    }

                    _.chart.hideLoading();
                });

            } else {
                // Toggle the volume chart along with the stock price chart
                if (o.volume) {
                    var volSeries = this.chart.get('volume' + i);
                    if (volSeries.visible) {
                        volSeries.hide();
                    } else {
                        volSeries.show();
                    }
                }
            }
        },

        _toggleFlags: function (series) {
            var _ = this,
                o = this.options;

            // Load the news/event data if it hasn't been already
            if (!series.data.length) {
                this.chart.showLoading();

                if (series.options.id == 'news') {
                    this._getNewsData().done(function (data) {
                        _.chart.get('news').setData(_._parseNewsData(data));
                        _.chart.hideLoading();
                    });

                } else {
                    this._getEventsData().done(function (data) {
                        _.chart.get('events').setData(_._parseEventsData(data));
                        _.chart.hideLoading();
                    });
                }
            }
        },

        _buildSeries: function () {
            var _ = this,
                o = _.options,
                series = [];

            // build stock series without data
            $.each(o.stocks, function (i, stock) {
                var exchange = stock[0],
                    symbol = stock[1],
                    name = stock.length > 2 && stock[2] ? stock[2] : exchange + ':' + symbol;

                // Stock Price Series
                series.push($.extend({
                    type: 'areaspline',
                    name: name,
                    id: 'price' + i,
                    visible: i === 0,
                    showInLegend: o.showLegendSymbol,
                    turboThreshold: o.threshold,
                    tooltip: {
                        valueDecimals: 2
                    },
                    events: {
                        legendItemClick: function () {
                            _._toggleStock(this);
                        }
                    }
                }, o.stockOpts));

                // Volume Series
                if (o.volume) {
                    series.push($.extend({
                        type: 'column',
                        name: exchange + ':Volume',
                        id: 'volume' + i,
                        turboThreshold: o.threshold,
                        showInLegend: false,
                        yAxis: 1
                    }, o.volumeOpts));
                }
            });

            // News Series
            if (o.news) {
                series.push($.extend({
                    type: 'flags',
                    name: 'News',
                    id: 'news',
                    onSeries: 'price0',
                    shape: 'circlepin',
                    width: 3,
                    height: 3,
                    y: -10,
                    turboThreshold: o.threshold,
                    visible: o.newsOnLoad,
                    point: {
                        events: {
                            click: function () {
                                // open news url on click
                                window.location = this.url;
                            }
                        }
                    },
                    events: {
                        legendItemClick: function () {
                            _._toggleFlags(this);
                        }
                    }
                }, o.newsOpts));
            }

            // Events Series
            if (o.events) {
                series.push($.extend({
                    type: 'flags',
                    name: 'Events',
                    id: 'events',
                    onSeries: 'price0',
                    shape: 'circlepin',
                    width: 3,
                    height: 3,
                    y: -25,
                    visible: o.eventsOnLoad,
                    point: {
                        events: {
                            click: function () {
                                // open event url on click
                                window.location = this.url;
                            }
                        }
                    },
                    events: {
                        legendItemClick: function () {
                            _._toggleFlags(this);
                        }
                    }
                }, o.eventsOpts));
            }

            return series;
        },

        _getStockData: function (symbol) {
            var _ = this,
                o = this.options;

            var type, url, data, contentType, dataType;

            if (o.usePublic) {
                type = 'GET';
                url = o.url + '/feed/StockQuote.svc/GetStockQuoteHistoricalList';
                data = {
                    apiKey: o.apiKey,
                    exchange: symbol[0],
                    symbol: symbol[1],
                    pageSize: o.threshold - 200
                };
                dataType = 'jsonp';

            } else {
                type = 'POST',
                url = o.url + '/services/StockQuoteService.svc/GetStockQuoteHistoricalList';
                data = JSON.stringify({
                    serviceDto: {
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        RevisionNumber: GetRevisionNumber(),
                        LanguageId: GetLanguageId(),
                        Signature: GetSignature(),
                        StartIndex: 0,
                        ItemCount: o.threshold - 200
                    },
                    exchange: symbol[0],
                    symbol: symbol[1],
                });
                dataType: 'json';
            }

            return $.ajax({
                type: type,
                url: url,
                data: data,
                dataType: dataType,
                contentType: 'application/json; charset=utf-8'
            });
        },

        _parseStockData: function (data) {
            var _ = this,
                o = this.options,
                $e = this.element,
                stockData = [],
                volumeData = [];

            if (data.GetStockQuoteHistoricalListResult.length && this.startDate === null) {
                // Store the earliest date from the first stock series.
                // This will be used later for news so dots don't fall off the chart
                this.startDate = (new Date(data.GetStockQuoteHistoricalListResult.slice(-1)[0].HistoricalDate)).getTime();
            }
            
            $.each(data.GetStockQuoteHistoricalListResult, function (i, quote) {
                var price = quote.Last;

                if (price > 0) {
                    var time = (new Date(quote.HistoricalDate)).getTime();

                    if (time >= _.startDate) {
                        stockData.push({
                            x: time,
                            y: price,
                            high: quote.High,
                            low: quote.Low,
                            open: quote.Open
                        });
                        volumeData.push({
                            x: time,
                            y: quote.Volume,
                            high: quote.High,
                            low: quote.Low,
                            open: quote.Open
                        });
                    }
                }
            });

            return [stockData.reverse(), volumeData.reverse()];
        },

        _getNewsData: function () {
            var _ = this,
                o = this.options;

            return $.ajax({
                type: 'GET',
                url: o.url + '/feed/PressRelease.svc/GetPressReleaseList',
                data: {
                    apiKey: o.apiKey,
                    includeTags: true,
                    pageSize: o.newsSize,
                    pressReleaseDateFilter: 3,
                    categoryId: o.categoryId,
                    tagList: o.tags.join('|')
                },
                dataType: 'jsonp'
            });
        },

        _parseNewsData: function (data) {
            var _ = this,
                o = this.options,
                prData = [];

            $.each(data.GetPressReleaseListResult, function (i, item) {
                var headline = item.Headline.length > (o.newsLength + 10) ? item.Headline.substring(0, o.newsLength) + '...' : item.Headline,
                    details = o.url + item.LinkToDetailPage,
                    time = (new Date(item.PressReleaseDate)).getTime();

                if (time >= _.startDate) {
                    prData.push({
                        x: time,
                        title: ' ',
                        text: headline,
                        url: details
                    });
                }
            });

            return prData.reverse();
        },

        _getEventsData: function () {
            var _ = this,
                o = this.options;

            return $.ajax({
                type: 'GET',
                url: o.url + '/feed/Event.svc/GetEventList',
                data: {
                    apiKey: o.apiKey,
                    includeTags: true,
                    pageSize: o.eventSize,
                    eventDateFilter: 3
                },
                dataType: 'jsonp'
            });
        },

        _parseEventsData: function(data) {
            var _ = this,
                o = this.options,
                eventData = [];

            $.each(data.GetEventListResult, function (i, item) {
                var details = o.url + item.LinkToDetailPage,
                    time = (new Date(item.StartDate)).getTime();

                if (time >= _.startDate) {
                    eventData.push({
                        x: time,
                        title: ' ',
                        text: item.Title,
                        url: details
                    });
                }
            });

            return eventData.sort(function (a, b) {
                if (a.x < b.x) return -1;
                if (a.x > b.x) return 1;
                return 0;
            });
        }
    });
})(jQuery);
