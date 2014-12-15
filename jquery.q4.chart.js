(function ($) {
    /* requires: highstock 2.0 */
    $.widget('q4.chart', {
        options: {
            lockStock: false,
            url: '//feeds.q4websystems.com',
            apiKey: 'FCAFF3C994E84D8EAA7D5DEA093D48FD',
            exchange: ['NYSE'],
            symbol: ['ABX'],
            customNames: {
                use: false,
                names: []
            },
            usePublic: true,
            startDate: 946702800000,
            showLegendSymbol: true,
            categoryId: '1cb807d2-208f-4bc3-9133-6a9ad45ac3b0',
            volume: false,
            threshold: 1500,
            yAxisOffset: 0,
            yHeight1: 250,
            yHeight2: 50,
            offsetTop: 300,
            labels: true,
            vType: 'column',
            news: false,
            newsOnLoad: false,
            newsSize: 200,
            newsLength: 75,
            tags: [],
            events: false,
            eventsOnLoad: false,
            eventSize: 100,
            onChartComplete: null,
            highstock: {
                credits: {
                    enabled: true,
                    text: "Q4 Web Systems",
                    href: "http://www.q4websystems.com"
                },
                series: []
            },
            highChartsConfig: {
                global: {
                    useUTC: false
                }
            }
        },

        _create: function () {
            var o = this.options;

            // strip trailing slash from domain
            o.url = o.url.replace(/\/$/, '');

            Highcharts.setOptions(o.highChartsConfig);

            this.buildSeries();
        },

        buildSeries: function () {
            var _ = this,
                o = _.options;

            // check to make sure indices match
            if (!o.symbol.length || o.symbol.length != o.exchange.length) {
                this.destroy();
                return;
            }

            // build stock series without data
            $.each(o.symbol, function (i) {
                var show = i === 0 ? true : false, // have only the first symbol visible
                    exchange = o.exchange[i].replace('TSE', 'TSX'), // correct exchange for Toronto Stock Exchange
                    symbol = o.symbol[i].split('.').shift(), // correct symbol name (Example: ABX.CA > ABX)
                    name = o.customNames.use ? o.customNames.names[i] : exchange + ':' + symbol;

                // Stock Price Series
                o.highstock.series.push({
                    name: name,
                    visible: show,
                    id: 'Price',
                    showInLegend: o.showLegendSymbol,
                    turboThreshold: o.threshold,
                    tooltip: {
                        valueDecimals: 2
                    }
                });

                // Volume Series
                if (o.volume) {
                    o.highstock.series.push({
                        type: o.vType,
                        name: exchange + ':Volume',
                        id: 'Volume',
                        turboThreshold: o.threshold,
                        showInLegend: false,
                        yAxis: 1
                    });
                }
            });

            // News Series
            if (o.news) {
                o.highstock.series.push({
                    name: 'News',
                    id: 'News',
                    onSeries: 'Price',
                    shape: 'circlepin',
                    type: 'flags',
                    fillColor: o.highstock.colors[6],
                    width: 3,
                    height: 3,
                    y: -10,
                    turboThreshold: o.threshold,
                    visible: o.newsOnLoad,
                    point: {
                        events: {
                            click: function () { // link news dots to news details
                                window.location = o.url;
                            }
                        }
                    }
                });
            }

            // Events Series
            if (o.events) {
                o.highstock.series.push({
                    name: 'Events',
                    id: 'Events',
                    onSeries: 'Price',
                    shape: 'circlepin',
                    type: 'flags',
                    fillColor: o.highstock.colors[7],
                    width: 3,
                    height: 3,
                    y: -25,
                    visible: o.eventsOnLoad,
                    point: {
                        events: {
                            click: function () { // link news dots to news details
                                window.location = o.url;
                            }
                        }
                    }
                });
            }

            // Request stock data for the first series before chart highcharts is initialized
            this.stockRequest();
        },

        stockRequest: function (series) {
            var _ = this,
                o = this.options,
                i = series === undefined ? 0 : (o.volume ? series._i / 2 : series._i);

            var type, url, data, contentType, dataType;

            if (o.usePublic) {
                type = 'GET';
                url = o.url + '/feed/StockQuote.svc/GetStockQuoteHistoricalList';
                data = {
                    apiKey: o.apiKey,
                    exchange: o.exchange[i],
                    symbol: o.symbol[i],
                    pageSize: o.threshold - 200
                };
                dataType = 'jsonp';

            } else {
                type = 'POST',
                url = '/services/StockQuoteService.svc/GetStockQuoteHistoricalList';
                data = JSON.stringify({
                    serviceDto: {
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        RevisionNumber: GetRevisionNumber(),
                        LanguageId: GetLanguageId(),
                        StartIndex: 0,
                        ItemCount: o.threshold - 200,
                        Signature: GetSignature()
                    },
                    exchange: o.exchange[i],
                    symbol: o.symbol[i]
                });
                dataType: 'json';
            }

            $.ajax({
                type: type,
                url: url,
                data: data,
                dataType: dataType,
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    _.buildStockArr(data, series);
                },
                error: function () {
                    console.log('Historical stock quotes failed to load.');
                }
            });
        },

        buildStockArr: function (data, series) {
            var o = this.options,
                $e = this.element,
                $highcharts = $e.highcharts(),
                stockData = [],
                volumeData = [];

            if (!data.GetStockQuoteHistoricalListResult.length) {
                $e.html('There is currently no stock data, please check back later.');
                return;
            }

            if (series === undefined) {
                // Store the start date for the first stock series.
                // This will be used later for news so dots don't fall off the chart
                var item = data.GetStockQuoteHistoricalListResult;
                this.startDate = item[item.length - 1].HistoricalDate;
            }

            var startDate = (new Date(this.startDate)).getTime();

            $.each(data.GetStockQuoteHistoricalListResult, function (index, data) {
                var price = data.Last;

                // build data for stock & volume
                if (price > 0) {
                    var time = (new Date(data.HistoricalDate)).getTime();

                    if (time >= startDate) {
                        stockData.push({
                            x: time,
                            y: price,
                            high: data.High,
                            low: data.Low,
                            open: data.Open
                        });
                        volumeData.push({
                            x: time,
                            y: data.Volume,
                            high: data.High,
                            low: data.Low,
                            open: data.Open
                        });
                    }
                }
            });

            var i = series === undefined ? 0 : series._i;

            // Add data for first series before initalizing highstock
            if (!series) {
                o.highstock.series[i].data = stockData.reverse();
                if (o.volume) {
                    o.highstock.series[i + 1].data = volumeData.reverse();
                }
                this.initHighstock();
            }
            // Add additional series to highstock
            else {
                series.setData(stockData.reverse());
                if (o.volume) {
                    $highcharts.series[i + 1].setData(volumeData.reverse());
                }
                //hide loading icon
                $highcharts.hideLoading();
            }
        },

        initHighstock: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            function clickEvent() {
                if (o.lockStock) return false;

                // Check if the series has data
                if (this.options.data === undefined) {
                    $e.highcharts().showLoading();
                    _.stockRequest(this);

                } else {
                    // Control both Stock Price / Volume from same legend item
                    if (o.volume) {
                        var nextSeries = $e.highcharts().series[this._i + 1];
                        if (nextSeries.visible) {
                            nextSeries.hide();
                        } else {
                            nextSeries.show();
                        }
                    }
                }
            }

            // click handlers for loading series data
            var clickHandlers = {
                plotOptions: {
                    line: {
                        events: {
                            legendItemClick: clickEvent
                        }
                    },
                    areaspline: {
                        events: {
                            legendItemClick: clickEvent
                        }
                    },
                    candlestick: {
                        events: {
                            legendItemClick: clickEvent
                        }
                    },
                    column: {
                        events: {
                            legendItemClick: clickEvent
                        }
                    },
                    flags: {
                        events: {
                            legendItemClick: function () {
                                if (!this.data.length) {
                                    $e.highcharts().showLoading();
                                    if (this.name == 'News') {   
                                        _.newsRequest(this);
                                    } else {
                                        _.eventsRequest(this);
                                    }
                                }
                            }
                        }
                    }
                }
            };

            // Build a second yAxis if volume is enabled
            if (o.volume) {
                o.highstock.yAxis = [{
                    /*title: {
                        text: 'Price'
                    },*/
                    offset: o.yAxisOffset,
                    height: o.yHeight1,
                    lineWidth: 2
                }, {
                    /*title: {
                        text: 'Volume'
                    },*/
                    offset: o.yAxisOffset,
                    top: o.offsetTop,
                    height: o.yHeight2,
                    offset: 0,
                    lineWidth: 2
                }];
            }

            // initalize highstock
            $e.highcharts('StockChart', $.extend(o.highstock, clickHandlers));

            // populate news/events series with data after the chart loads if enabled
            var series = $e.highcharts().series;
            if (o.newsOnLoad) {
                this.newsRequest(series[series.length - (o.events ? 3 : 2)]);
            }
            if (o.eventsOnLoad) {
                this.eventsRequest(series[series.length - 2]);
            }

            // callback after chart loads
            if (typeof o.onChartComplete === 'function') {
                o.onChartComplete();
            }
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

        destroy: function () {
            this.element.html('The chart has failed to load, please double check the configuration.');
        },

        _setOption: function (option, value) {
            this._superApply(arguments);
        }
    });
})(jQuery);
