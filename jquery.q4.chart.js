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
            symbols: [
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

        _create: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            // strip trailing slash from domain
            o.url = o.url.replace(/\/$/, '');

            Highcharts.setOptions(o.highchartsOpts);

            // build the series objects for stock price, volume, news, events
            var series = this._buildSeries();

            // Request stock data for the first series before chart is initialized
            this._stockRequest(o.symbols[0], function (data) {
                // this should be a 2-tuple of stock price and volume data
                stockSeries = _._buildStockArr(data);

                if (!stockSeries.length) {
                    $e.html('There is currently no stock data, please check back later.');
                    return;
                }

                // add the data to the first stock's series objects
                series[0].data = stockSeries[0].reverse();
                if (o.volume) {
                    series[1].data = stockSeries[1].reverse();
                }

                _.initHighstock(series);
            });
        },

        _buildSeries: function () {
            var _ = this,
                o = _.options,
                series = [];

            // build stock series without data
            $.each(o.symbols, function (i, exsymbol) {
                var exchange = exsymbol[0].replace('TSE', 'TSX'), // correct exchange for Toronto Stock Exchange
                    symbol = exsymbol[1].split('.').shift(), // correct symbol name (Example: ABX.CA > ABX)
                    name = exsymbol.length > 2 && exsymbol[2] ? exsymbol[2] : exchange + ':' + symbol;

                // Stock Price Series
                series.push($.extend({
                    type: 'areaspline',
                    name: name,
                    id: 'Price',
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
                        id: 'Volume',
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
                    id: 'News',
                    onSeries: 'Price',
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
                    id: 'Events',
                    onSeries: 'Price',
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

        _stockRequest: function (symbol, success, error) {
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
                contentType: 'application/json; charset=utf-8',
                success: success,
                error: error || function () {
                    console.log('Historical stock quotes failed to load.');
                }
            });
        },

        _buildStockArr: function (data) {
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

                // build data for stock & volume
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

            // var i = series === undefined ? 0 : series._i;

            // // Add data for first series before initalizing highstock
            // if (!series) {
            //     o.highstock.series[i].data = stockData.reverse();
            //     if (o.volume) {
            //         o.highstock.series[i + 1].data = volumeData.reverse();
            //     }
            //     this.initHighstock();
            // }
            // // Add additional series to highstock
            // else {
            //     series.setData(stockData.reverse());
            //     if (o.volume) {
            //         $e.highcharts().series[i + 1].setData(volumeData.reverse());
            //     }
            //     //hide loading icon
            //     //$e.highcharts().hideLoading();
            // }

            return [stockData, volumeData];
        },

        initHighstock: function (series) {
            var _ = this,
                o = this.options,
                $e = this.element;

            o.highstock.series = series;

            if (o.volume) {
                o.highstock.yAxis = [{}, {}];
            }

            // initalize highstock
            var chart = $e.highcharts('StockChart', o.highstock).highcharts();

            if (o.volume) {
                // rescale the volume chart according to volumeHeight
                var minmax = chart.yAxis[1].getExtremes();
                chart.yAxis[1].setExtremes(0, minmax.max * 100 / o.volumeHeight, true, false);
            }

            // if enabled, request news/events data after the chart loads
            // FIXME: these request functions still need to actually populate the chart with the data
            if (o.news && o.newsOnLoad) {
                this.newsRequest(chart.series.slice(o.events ? -3 : -2)[0]);
            }
            if (o.events && o.eventsOnLoad) {
                this.eventsRequest(chart.series.slice(-2)[0]);
            }

            // callback after chart loads
            this._trigger('onChartComplete');
        },

        newsRequest: function (series) {
            var _ = this,
                o = this.options;

            $.ajax({
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
                dataType: 'jsonp',
                success: function (data) {
                    _.buildNewsArr(data, series);
                },
                error: function () {
                    console.log('News failed to load.');
                }
            });
        },

        buildNewsArr: function (data, series) {
            var o = this.options,
                $highcharts = this.element.highcharts(),
                start = (new Date(this.startDate)).getTime(),
                prData = [];

            //Build news array
            $.each(data.GetPressReleaseListResult, function (index, data) {
                var headline = data.Headline.length > (o.newsLength + 10) ? data.Headline.substring(0, o.newsLength) + '...' : data.Headline,
                    details = o.url + data.LinkToDetailPage,
                    date = (new Date(data.PressReleaseDate)).getTime();

                if (date > start) {
                    prData.push({
                        x: date,
                        title: ' ',
                        text: headline,
                        url: details
                    });
                }
            });
            
            // add news to chart
            series.setData(prData.reverse());

            // hide loading icon
            $highcharts.hideLoading();
        },

        eventsRequest: function (series) {
            var _ = this,
                o = this.options;

            $.ajax({
                type: 'GET',
                url: o.url + '/feed/Event.svc/GetEventList',
                data: {
                    apiKey: o.apiKey,
                    includeTags: true,
                    pageSize: o.eventSize,
                    eventDateFilter: 3
                },
                dataType: 'jsonp',
                success: function (data) {
                    _.buildEventArr(data, series);
                },
                error: function () {
                    console.log('Events failed to load.');
                }
            });
        },

        buildEventArr: function(data, series) {
            var o = this.options,
                $highcharts = this.element.highcharts(),
                start = (new Date(this.startDate)).getTime(),
                eventData = [];

            //Build news array
            $.each(data.GetEventListResult, function (index, data) {
                var details = o.url + data.LinkToDetailPage,
                    date = (new Date(data.StartDate)).getTime();

                if (date > start) {
                    eventData.push({
                        x: date,
                        title: ' ',
                        text: data.Title,
                        url: details
                    });
                }
            });

            // add news to chart
            series.setData(eventData.sort(function (a, b) {
                if (a.x < b.x) return -1;
                if (a.x > b.x) return 1;
                return 0;
            }));
            
            // hide loading icon
            $highcharts.hideLoading();
        },

        _toggleStock: function (series) {
            var _ = this,
                o = this.options,
                $e = this.element,
                i = o.volume ? series._i : series._i / 2;

            if (o.lockStock) return false;

            // Load the stock price/volume data if it hasn't been already
            if (series.options.data === undefined) {
                $e.highcharts().showLoading();
                // FIXME: we still need to actually populate the chart with the data
                _._stockRequest(o.symbols[i]);

            } else {
                // Toggle the volume chart along with the stock price chart
                if (o.volume) {
                    var volSeries = $e.highcharts().series[i + 1];
                    if (volSeries.visible) {
                        volSeries.hide();
                    } else {
                        volSeries.show();
                    }
                }
            }
        },

        _toggleFlags: function (series) {
            // Load the news/event data if it hasn't been already
            // FIXME: these request functions still need to actually populate the chart with the data
            if (!series.data.length) {
                $e.highcharts().showLoading();
                if (series.name == 'News') {   
                    _.newsRequest(series);
                } else {
                    _.eventsRequest(series);
                }
            }
        },

        destroy: function () {
            this.element.html('The chart has failed to load, please double check the configuration.');
        },

        _setOption: function (option, value) {
            this._superApply(arguments);
        }
    });
})(jQuery);
