(function($) {
    /**
     * @class q4.historical
     * @version 1.0.0
     * @author jasonm@q4websystems.com
     */
    $.widget("q4.historical", /** @lends q4.historical */ {
        options: {
            /**
             * The client's symbol
             * If this is left blank it will call an additional service and load this from the indices
             */
            symbol: '',
            /**
             * The exchange the client trades on
             * If this is left blank it will call an additional service and load this from the indices
             */
            exchange: '',
            /**
             * markup to use between ajax calls
             */
            loading: '<img src="//q4widgets.q4web.com/historicalQuote/img/ajax-loader.gif" alt="loading..." />',
            /**
             * message to show if the date range was incorrect
             */
            invalidText: '<span>Invalid date range</span>',
            /**
             * message to show if no data is returned
             */
            noDataText: '<span>There is no data for the selected date.</span>',
            /**
             * If set to true a date range will be used (start date - end date)
             */
            range: false,
            /**
             * The max number of items you want to load when a range is used. -1 will load 3000 items (12.5 years)
             */
            maxItems: -1,
            /**
             * Using jQuery UI's datepicker, this will configure the date format
             */
            dateFormat: 'mm/dd/yy',
            selects: {
                /**
                 * This will define how many years are in the selecct. default is 10 years from current year (example: 2015-10)
                 */
                startYear: new Date().getFullYear() - 10,
                /**
                 * A simple class name for the look up button. This is set here because it's used inside the plugin
                 */
                btnCLs: 'lookup',
                /**
                 * This is the data used for creating the selects
                 */
                data: [
                    {name: 'Jan', num: 1, days: 31},
                    {name: 'Feb', num: 2, days: function(year){
                        if ( new Date(year, 1, 29).getMonth() == 1 ){
                            return 29;
                        } else {
                            return 28;
                        }
                    }},
                    {name: 'Mar', num: 3, days: 31},
                    {name: 'Apr', num: 4, days: 30},
                    {name: 'May', num: 5, days: 31},
                    {name: 'Jun', num: 6, days: 30},
                    {name: 'Jul', num: 7, days: 31},
                    {name: 'Aug', num: 8, days: 31},
                    {name: 'Sep', num: 9, days: 30},
                    {name: 'Oct', num: 10, days: 31},
                    {name: 'Nov', num: 11, days: 30},
                    {name: 'Dec', num: 12, days: 31}
                ],
                /**
                 * Template for month select
                 * TODO: Test as a <ul/>
                 */
                monthTpl:
                '<select class="month">' +
                    '{{#data}}' +
                        '<option value="{{num}}">' +
                                '{{name}}' +
                        '</option>' +
                    '{{/data}}' +
                '</select>',
                /**
                 * fired when a user changes the month
                 * @param {Object} this
                 */
                onMonthChange: function(inst){
                    var o = inst.options,
                        $select = o.range ? [inst.element.find('.stock-start select'), inst.element.find('.stock-end select')] : [inst.element.find('.stock-selects select')];

                    $.each($select, function(i, selector){
                        selector.not('.day').on('change', function(){
                            var n = o.selects.data[ parseInt(selector.filter('.month').val()) - 1 ];

                            if (n.days !== undefined && typeof(n.days) === 'function') {
                                n = n.days( selector.filter('.year').val() );
                            } else {
                                n = n.days;
                            }

                            selector.filter('select.day').html(Mustache.render( o.selects.dayTpl, inst.buildArrayAdd( 1, n ) ));

                            // A callback fired each time to select updates.

                            if (inst.options.onSelectUpdate !== undefined && typeof(inst.options.onSelectUpdate) === 'function') {
                                inst.options.onSelectUpdate();
                            }
                        });
                    });
                },
                /**
                 * Template for day select
                 * TODO: Test as a <ul/>
                 */
                dayTpl:
                '<select class="day">' +
                    '{{#count}}' +
                        '<option value="{{.}}">' +
                                '{{.}}' +
                        '</option>' +
                    '{{/count}}' +
                '</select>',
                yearTpl:
                /**
                 * Template for year select
                 * TODO: Test as a <ul/>
                 */
                '<select class="year">' +
                    '{{#count}}' +
                        '<option value="{{.}}">' +
                                '{{.}}' +
                        '</option>' +
                    '{{/count}}' +
                '</select>'
            },
            /**
             * The parent class used for the returned data
             */
            stockTableClass: 'stock-table',
            /**
             * This template is used when range is set to true.
             * @param {string} markup for month, day, year
             */
            rangeTpl: function(month, day, year){
                return '<div class="stock-historical">' +
                    '<div class="stock-selects">' +
                        '<div class="stock-start">' +
                            '<span class="text">Start Date:</span>' +
                            month + day + year +
                        '</div>' +
                        '<div class="stock-end">' +
                            '<span class="text">End Date:</span>' +
                            month + day + year +
                        '</div>' +
                        '<button class="'+ this.selects.btnCLs +'">Look Up</button>' +
                    '</div>' +
                    '<div class="'+ this.stockTableClass +'">'+ this.loading +'</div>' +
                '</div>';
            },
            /**
             * This template is used when range is set to false.
             * @param {string} markup for month, day, year
             */
            moduleTpl: function(month, day, year){
                return '<div class="stock-historical">' +
                    '<div class="stock-selects">' +
                        '<span class="text">Lookup Date</span>' +
                        month + day + year +
                        '<button class="'+ this.selects.btnCLs +'">Look Up</button>' +
                    '</div>' +
                    '<div class="'+ this.stockTableClass +'">'+ this.loading +'</div>' +
                '</div>';
            },
            /**
             * If you wish to add a non repeating header with your stockTpl. Example: could be used in a table layout with <tr><th>
             */
            stockHeader: '',
            /**
             * Template to use for returned stock data
             */
            stockTpl:
            '<ul class="list-group">' +
                '<li class="list-group-item"><span class="text">Date</span><span class="badge">{{Day}}</span></li>' +
                '<li class="list-group-item"><span class="text">Day\'s High</span><span class="badge">{{High}}</span></li>' +
                '<li class="list-group-item alt"><span class="text">Day\'s Low</span><span class="badge">{{Low}}</span></li>' +
                '<li class="list-group-item"><span class="text">Volume</span><span class="badge">{{Volume}}</span></li>' +
                '<li class="list-group-item alt"><span class="text">Open</span><span class="badge">{{Open}}</span></li>' +
                '<li class="list-group-item"><span class="text">Closing Price</span><span class="badge">{{Last}}</span></li>' +
            '</ul>',
            /**
             * a callback fired each time the historical ajax call completes
             * @param {Object} data
             */
            onDataLoad: function(data){},
            /**
             * a callback fired after the html is generated
             * @param {Object} this
             */
            onFirstLoad: function(inst){},
            /**
             * a simple callback with no arguments.
             * fired anytime a select updates
             */
            onSelectUpdate: function(){},
            /**
             * @param {Object} this
             * fired before each ajax call happens
             */
            beforeAjaxCall: function(inst){}
        },

        _create: function(){
            this.buildHTML();
        },

        _init: function(){
            this.getHistoricalData();
        },

        _loaded: false,

        addCommas: function(nStr) {
            nStr += '';
            x = nStr.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },

        queryStringToObj: function(query){
            var qryStringArr = query.split('&');
            var obj = {}, paramvalue = '';
            for(i=0; i<qryStringArr.length; i++){
                paramvalue = qryStringArr[i].split('=');
                obj[paramvalue[0]] = paramvalue[1];
            }
            return obj;
        },

        onRangeRefresh: function(date){
            var _ = this, o = _.options,
                $select = o.range ? [_.element.find('.stock-start'), _.element.find('.stock-end')] : [_.element.find('.stock-selects')];

            _.element.find('button.' + o.selects.btnCLs).on('click', function(e){
                var dates = [];
                e.preventDefault();
                $('.'+ _.options.stockTableClass).html(_.options.loading);

                $.each($select, function(i, selector){
                    dates.push( new Date( $(this).find('.month').val() +'/'+ $(this).find('.day').val() +'/'+ $(this).find('.year').val() ) );
                });

                if (o.range) {
                    _.getHistoricalData('/Date('+ dates[0].setHours(0,0,0,0) +')/', '/Date('+ dates[1].setHours(1,0,0,0) +')/');
                } else {
                    _.getHistoricalData('/Date('+ dates[0].setHours(0,0,0,0) +')/', '/Date('+ dates[0].setHours(1,0,0,0) +')/');
                }

            });
        },

        setSelectDate: function(date){
            this.element.find('select.month').val(parseInt(date.split('/')[0]));
            this.element.find('select.day').val(parseInt(date.split('/')[1]));
        },

        buildArrayAdd: function(first, last){
            var num = [];

            for (i = first; i <= last; i++) {
                num.push(i);
            }

            return data = {
                count: num
            };
        },

        buildArraySub: function(first, last){
            var num = [];

            for (i = first; i >= last; i--) {
                num.push(i);
            }

            return data = {
                count: num
            };
        },

        dataDto: function(){
            return dataObj = {
                serviceDto: {
                    RevisionNumber: GetRevisionNumber(),
                    LanguageId: GetLanguageId(),
                    Signature: GetSignature(),
                    ViewType: GetViewType(),
                    ViewDate: GetViewDate(),
                    StartIndex: 0,
                    ItemCount: 1
                },
                exchange: this.options.exchange,
                symbol: this.options.symbol
            };
        },

        buildHTML: function(){
            var _ = this, o = _.options.selects,
                month = Mustache.render( o.monthTpl, o ),
                day = Mustache.render( o.dayTpl, _.buildArrayAdd( 1, o.data[ new Date().getMonth() ].days ) ),
                year = Mustache.render( o.yearTpl, _.buildArraySub( new Date().getFullYear(), o.startYear ) );

            if (_.options.range){
                _.element.html( this.options.rangeTpl(month, day, year) );
            } else {
                _.element.html( this.options.moduleTpl(month, day, year) );
            }

            o.onMonthChange(_);

            if (_.options.onFirstLoad !== undefined && typeof(_.options.onFirstLoad) === 'function') {
                _.options.onFirstLoad(_);
            }
        },

        getHistoricalData: function(startDate, endDate){
            var _ = this,
                stockData = _.dataDto(),
                query = _.queryStringToObj(location.href.toLowerCase().split('?').pop());

            // Overwrite the default indice if one is set through a query string ?Indice=EX:SYM

            if (query.indice !== undefined){
                stockData.exchange = query.indice.split(':').shift()
                stockData.symbol = query.indice.split(':').pop()
            }

            if (startDate !== undefined){
                stockData.startDate = startDate;
                stockData.endDate = endDate;
            }

            // Set a max amount of items after first load

            if (_.options.range && _._loaded) {
                stockData.serviceDto.ItemCount = _.options.maxItems;
            }

            if (_.options.beforeAjaxCall !== undefined && typeof(_.options.beforeAjaxCall) === 'function') {
                _.options.beforeAjaxCall(_);
            }

            $.ajax({
                type: "POST",
                url: "/services/StockQuoteService.svc/GetStockQuoteHistoricalList",
                data: JSON.stringify( stockData ),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(data){
                    data = data.GetStockQuoteHistoricalListResult;

                    _.buildStockTable(data);

                    if ( !_._loaded && data.length ){
                        _._loaded = true;
                        _.setSelectDate(data[0].HistoricalDate.split(' ').shift());
                        _.onRangeRefresh();
                    }

                    if (_.options.onDataLoad !== undefined && typeof(_.options.onDataLoad) === 'function') {
                        _.options.onDataLoad(_, data);
                    }
                },
                error: function (){
                    _.element.find('.' + _.options.stockTableClass).html(_.options.invalidText);
                }
            });
        },

        buildStockTable: function(data){
            var _ = this, table = _.options.stockHeader;

            if (data !== undefined && data.length){
                $.each(data, function(i, stock){
                    stock.Day = $.datepicker.formatDate(_.options.dateFormat, new Date(stock.HistoricalDate));
                    stock.High = stock.High.toFixed(2);
                    stock.Last = stock.Last.toFixed(2);
                    stock.Low  = stock.Low.toFixed(2);
                    stock.Open = stock.Open.toFixed(2);
                    stock.Volume = _.addCommas(stock.Volume);

                    table += Mustache.render(_.options.stockTpl, stock);
                });
            } else {
                table = _.options.noDataText;
            }

            _.element.find('.' + _.options.stockTableClass).html(table);
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
    });
})(jQuery);
