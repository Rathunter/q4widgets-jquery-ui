/**
 * @class q4.calendar
 *
 * @example
 *      $("#clndr").calendar({
 *          news: true,
 *          presentations: true,
 *          eventSize: 50,
 *          slideshare: "Q4WebSystems"
 *      });
 *
 * @docauthor jasonm@q4websystems.com
 */
(function($) {
    $.widget("q4.calendar", {
        options: {
             /**
             * @cfg
             * This allows the widget to be placed on a site not hosted by Q4.
             * Requires url and apiKey to be set in the configuration.
             */
            publicFeed: false,
            /**
             * @cfg
             * A URL to a Q4 hosted website.
             * This is only requied if publicFeed is set to true.
             */
            url: '',
            /**
             * @cfg
             * The API Key can be found under System Admin > Site List > Public Site
             * in the admin of any Q4 Website.
             * This is only requied if publicFeed is set to true.
             */
            apiKey: '',
            /**
             * @cfg {Boolean}
             * Set to true to include all related Press Releases
             */
            news: false,
            /**
             * @cfg {Boolean}
             * Set to true to include all related presentations.
             */
            presentations: false,
            /**
             * @cfg
             * Can be set to a SlideShare username.
             * This will add a SlideShare presentations as an event.
             */
            slideshare: '',
            /**
             * @event
             * @param {Object} calendar DOM element, can be used with methods such as .addEvents()
             * @param {Array} events An array containing all events
             * Callback is fired after events are loaded
             */
            onEventsLoad: function(calendar, events){ },
            /**
             * @event
             * @param {Object} calendar DOM element, can be used with methods such as .addEvents()
             * @param {Array} events An array containing slideshare data
             * Callback is fired after SlideShare has loaded
             */
            onSlideShareLoad: function(calendar, events){ },
            /**
             * @cfg
             * The number of events to add to the calendar
             */
            eventSize: 25,
            /**
             * @cfg
             * Filter Events by Tag.
             */
            tags: [],
            /**
             * @class q4.calendar.options.calendar
             *
             * Example Config:
             *
             *      $("#clndr").eventCal({
             *          calendar: {
             *              adjacentDaysChangeMonth:true,
             *              daysOfTheWeek: ['Su','Mo','Tu','We','Th','Fi','Sa'],
             *              showAdjacentMonths: false,
             *              weekOffset: 1,
             *              doneRendering: function(){
             *                  console.log('done rendering')
             *              },
             *              ready: function(){
             *                  console.log('calendar is ready')
             *              }
             *          }
             *      });
             *
             */
            calendar: {
                multiDayEvents: {
                    startDate: 'startDate',
                    endDate: 'endDate'
                },
                /**
                 * Template to be used to generate markup for calendar.
                 * Uses underscore.js.
                 */
                template:
                '<div class="clndrContainer">' +
                    '<div class="controls">' +
                        '<div class="clndr-previous-button">&lsaquo;</div>' +
                        '<div class="month"><%= month %> <%= year %></div>' +
                        '<div class="clndr-next-button">&rsaquo;</div>' +
                    '</div>' +
                    '<div class="days-container">' +
                        '<div class="days">' +
                            '<div class="headers">' +
                                '<% _.each(daysOfTheWeek, function(day) { %>' +
                                        '<div class="day-header"> <%= day %> </div>' +
                                '<% }) %>' +
                            '</div>' +
                            '<% _.each(days, function(day) { %>' +
                                '<% if (day.events[0] !== undefined) {%>' +
                                    '<div class="<%= day.classes %> ' +
                                        '<%= day.events[0].tag %> "> <%= day.day %>' +
                                            '<% _.each(day.events, function(event) { %>' +
                                                '<% if (event.slideshare) %>' +
                                                    '<span class="slideshare"></span>' +
                                                '<% else %>' +
                                                    '<span></span>' +
                                            '<% }) %>' +
                                        '</div>' +
                                '<%} else %>' +
                                    '<div class="<%= day.classes %>"><%= day.day %></div>' +
                                '<% }); %>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
                /**
                 * Start the week off on Sunday (0), Monday (1), etc. Sunday is the default.
                 */
                weekOffset: 0,
                /**
                 * An array of day abbreviation labels. 
                 * The array MUST start with Sunday (use in conjunction with weekOffset to change the starting day to Monday)
                 */
                daysOfTheWeek: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
                /**
                 * Show the dates of days in months adjacent to the current month.
                 */
                showAdjacentMonths: true,
                /**
                 * When days from adjacent months are clicked, switch the current month.
                 * fires nextMonth/previousMonth/onMonthChange click callbacks. 
                 */
                adjacentDaysChangeMonth: false,
                /**
                 * this is called only once after clndr has been initialized and rendered.
                 * use this to bind custom event handlers that don't need to be re-attached
                 * every time the month changes (most event handlers fall in this category).
                 * hint: this.element refers to the parent element that holds the clndr,
                 * and is a great place to attach handlers that don't get tossed out every
                 * time the clndr is re-rendered.
                 */
                ready: function() { },
                /**
                 * a callback when the calendar is done rendering.
                 * This is a good place to bind custom event handlers
                 * (also see the 'ready' option above).
                 */
                doneRendering: function(){ },
                /**
                 * @class q4.calendar.clickEvents
                 * Example Config:
                 *
                 *      $("#clndr").eventCal({
                 *          calendar: {
                 *              clickEvents: {
                 *                  click: function(target){
                 *                      var events = target.events,
                 *                          length = events.length;
                 *                      if (length){
                 *                          console.log(length +' Event(s)')
                 *                      } else {
                 *                          console.log('No Events')
                 *                      }
                 *                  },
                 *                  onMonthChange: function(month){
                 *                      console.log(moment(month._d).format('MMMM'));
                 *                  },
                 *                  onYearChange: function(month) {
                 *                      console.log(moment(month._d).format('YYYY'));
                 *                  },
                 *                  today: function(month){
                 *                      console.log(month);
                 *                  }
                 *              }
                 *          }
                 *      });
                 *
                 */
                clickEvents: {
                    /**
                     * @event
                     * @param {Object} target
                     * fired whenever a calendar box is clicked.
                     * returns a 'target' object containing the DOM element, any events,
                     * and the date as a moment.js object.
                     */
                    click: function(target){ },
                    /**
                     * @event
                     * @param {Object} month
                     * fired when a user goes forward a month.
                     * returns a moment.js object set to the correct month.
                     */
                    nextMonth: function(month){ },
                    /**
                     * @event
                     * @param {Object} month
                     * fired when a user goes back a month.
                     * returns a moment.js object set to the correct month.
                     */
                    previousMonth: function(month){ },
                    /**
                     * @event
                     * @param {Object} month
                     * fired when the next year button is clicked.
                     * returns a moment.js object set to the correct month and year.
                     */
                    nextYear: function(month) { },
                    /**
                     * @event
                     * @param {Object} month
                     * fired when the previous year button is clicked.
                     * returns a moment.js object set to the correct month and year.
                     */
                    previousYear: function(month) { },
                    /**
                     * @event
                     * @param {Object} month
                     * fires any time the month changes as a result of a click action.
                     * returns a moment.js object set to the correct month.
                     */
                    onMonthChange: function(month) { },
                    /**
                     * @event
                     * @param {Object} month
                     * fires any time the year changes as a result of a click action.
                     * if onMonthChange is also set, it is fired BEFORE onYearChange.
                     * returns a moment.js object set to the correct month and year.
                     */
                    onYearChange: function(month) { },
                    /**
                     * @event
                     * @param {Object} month
                     * fired when a user goes to the current month & year.
                     * returns a moment.js object set to the correct month.
                     */
                    today: function(month){ }
                },
            }
        },
        /* TODO - add methods to documentation
        // Go to the next month
        myCalendar.forward();
        // Go to the previous month
        myCalendar.back();
        // Set the month using a number from 0-11 or a month name
        myCalendar.setMonth(0);
        myCalendar.setMonth('February');
        // Go to the next year
        myCalendar.nextYear();
        // Go to the previous year
        myCalendar.previousYear();
        // Set the year
        myCalendar.setYear(1997);
        // Change the events. Note that this triggers a re-render of the calendar.
        myCalendar.setEvents(newEventsArray);
        // Add events. Note that this triggers a re-render of the calendar.
        myCalendar.addEvents(additionalEventsArray);
        */
        _create: function() {
            var inst = this;

            $.ajaxSetup({ cache: true });

            $.when(
                $.getScript("//q4widgets.q4web.com/Calendar/js/underscore.js"),
                $.getScript("//q4widgets.q4web.com/Calendar/js/moment.js"),
                $.getScript("//q4widgets.q4web.com/Calendar/js/clndr.js"),
                $.Deferred(function(deferred){
                    $(deferred.resolve);
                })
            ).done(function(){
                inst.loaded = true;
                inst.callClndr();
            });
        },

        _init: function(){
            var inst = this;

            if (inst.loaded)
                inst.callClndr();
        },

        publicEventParams: function() {
            var o = this.options,
                data = {
                    apiKey : o.apiKey,
                    pageSize: o.eventSize,
                    includeTags: true,
                    eventSelection: 3,
                    test: null,
                    sortOperator: 1,
                    EventDateFilter: 3,
                    includePressReleases: o.news,
                    includePresentations: o.presentations,
                    includeFinancialReports: o.financials,
                    tagList : o.tags.join('|')
                };

            return data;
        },

        privateEventParams: function() {
            var o = this.options,
                data = {
                    serviceDto: {
                        ViewType: GetViewType(),
                        ViewDate: GetViewDate(),
                        Signature: GetSignature(),
                        LanguageId: GetLanguageId(),
                        RevisionNumber: GetRevisionNumber(),
                        TagList: o.tags,
                        StartIndex: 0,
                        ItemCount: o.eventSize,
                        IncludeTags: true
                    },
                    year: -1,
                    eventSelection: 3,
                    sortOperator: 1,
                    includePressReleases: o.news,
                    includePresentations: o.presentations,
                    includeFinancialReports: o.financials
                };

            return data;
        },

        getPrivateEventList: function() {
            var inst = this;
                url = location.href.toLowerCase();

            $.ajax({
                type: 'POST',
                url: '/services/EventService.svc/GetEventList',
                data: JSON.stringify(inst.privateEventParams()),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function(data){
                    inst.buildEventObj(data.GetEventListResult);
                },
                error: function(){
                    console.log('Events failed to load');
                }
            });
        },

        getPublicEventList: function() {
            var inst = this;

            $.ajax({
                type: 'GET',
                url: inst.options.url + '/feed/Event.svc/GetEventList',
                data: inst.publicEventParams(),
                dataType: 'jsonp',
                success: function(data) {
                    inst.buildEventObj(data.GetEventListResult);
                },
                error: function() {
                    console.log('Events failed to load');
                }
            });
        },

        buildEventObj: function(data) {
            var inst = this,
                events = [];

            $.each(data, function(i, item) {
                var list = {},
                    eventStartDate = moment(item.StartDate).format('YYYY-MM-DD'),
                    eventEndDate = moment(item.EndDate).format('YYYY-MM-DD');

                var itemObj = {
                    startDate: eventStartDate,
                    endDate: eventEndDate,
                    tag: item.TagsList.join(' '),
                    items: item
                };

                events.push(itemObj);
            });

            // Events added to calendar after load
            inst.calendar.addEvents(events);

            if (this.options.onEventsLoad !== undefined && typeof(this.options.onEventsLoad) === 'function') {
                this.options.onEventsLoad(inst.calendar, events);
            }
        },

        getSlideShare: function() {
            var inst = this;

            // Call SlideShare
            $.getJSON('//widgets.q4web.com/slideshare/rss/getRssByUser/' + inst.options.slideshare + '?callback=?', function(data) {
                inst.parseSlideShare(data);
            });
        },

        parseSlideShare: function(data) {
            var inst = this,
                events = [];

            $.each(data, function(i, ss){
                var date = moment(ss.published).format('YYYY-MM-DD');
                var itemObj = {
                    startDate: date,
                    endDate: date,
                    slideshare: true,
                    items: ss
                };
                events.push(itemObj);
            });

            //Add SlideShare as a calendar Event
            inst.calendar.addEvents(events);

            // Callback for slideshare
            if (this.options.onSlideShareLoad !== undefined && typeof(this.options.onSlideShareLoad) === 'function') {
                this.options.onSlideShareLoad(inst.calendar, events);
            }
        },

        callClndr: function(){
            var inst = this;

            inst.calendar = inst.element.clndr(inst.options.calendar);

            if (inst.options.publicFeed) {
                inst.getPublicEventList();
            } else {
                inst.getPrivateEventList();
            }

            if (inst.options.slideshare.length){
                inst.getSlideShare();
            }
        },

        destroy: function() {
            this.element.html('');
        },

        _setOption: function(option, value) {
            this._superApply(arguments);
        }
    });
})(jQuery);