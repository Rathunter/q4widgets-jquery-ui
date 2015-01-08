(function ($) {
    $.widget('q4.mashfeed', {
        options: {
            /* The global maximum number of items. 0 for unlimited (default). */
            limit: 0,
            /* A Moment.js format for dates. */
            dateFormat: 'MMM D, YYYY h:mm A',
            /* Whether to display dates using Moment's fromNow function. */
            fromNow: false,
            /* The number of characters to truncate summaries to. */
            summaryLength: 500,
            /* Feeds to fetch. Should be a list of objects containing options
             * for each feed. Valid options are:
             *   name: The name of the feed.
             *   type: The type, as listed in feedTypes (example: rss, youtube).
             *   template: A Mustache template for a single feed item
             *     (overrides the default template).
             * See feedTypes for type-specific options. */
            feeds: [],
            /* A list of feed names. If this list is not empty,
             * only the feeds named in the list will be parsed.
             */
            filter: [],
            /* A default Mustache template for a single feed item.
             * Can be overridden for individual feed types.
             */
            template: (
                '<li>' + 
                    '<h2><a href="{{url}}">{{title}}</a></h2>' + 
                    '<p>{{date}}</p>' + 
                    '{{summary}}' +
                '</li>'
            ),
            /* A callback that fires after rendering is finished. */
            complete: function () {}
        },

        /* A hash of feed types, indexed by id.
         * Each is an object with the following properties:
         *   fetch: A function that takes a feed object and returns
         *     an AJAX call to the feed.
         *   getItems: A function that takes raw feed data and returns the
         *     array of raw items found in that feed.
         *   parseItem: A function that takes a raw feed item and returns
         *     a formatted item object for the template.
         */
        feedTypes: {
            /* Options for rss:
             *   url: The url of the feed.
             */
            rss: {
                fetch: function (feed) {
                    return $.ajax({
                        url: '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=' + encodeURIComponent(feed.url),
                        dataType: 'jsonp'
                    });
                },
                getItems: function (data) {
                    return data.responseData.feed.entries;
                },
                parseItem: function (item) {
                    return {
                        title: item.title,
                        url: item.link,
                        date: moment(item.publishedDate, 'DD MMM YYYY hh:mm:ss'),
                        content: item.content
                    };
                }
            },

            /* Options for twitter:
             *   url: The url of the JSON feed.
             */
            twitter: {
                fetch: function (feed) {
                    return $.ajax({
                        url: feed.url,
                        dataType: 'jsonp'
                    });
                },
                getItems: function (data) {
                    return data;
                },
                parseItem: function (item) {
                    return {
                        user: item.user.screen_name,
                        username: item.user.name,
                        content: item.text,
                        date: moment(item.created_at, 'ddd MMM DD hh:mm:ss ZZ YYYY'),
                        id: item.id
                    };
                }
            },

            /* Options for youtube:
             *   username: The username of the YouTube account to fetch from.
             */
            youtube: {
                fetch: function (feed) {
                    return $.ajax({
                        url: '//gdata.youtube.com/feeds/users/' + feed.username + '/uploads?alt=json-in-script&callback=?',
                        dataType: 'jsonp'
                    });
                },
                getItems: function (data) {
                    return data.feed.entry;
                },
                parseItem: function (item) {
                    return {
                        title: item.title.$t,
                        url: item.link[0].href,
                        id: item.id.$t.split('/').pop(),
                        date: moment(item.updated.$t),
                        content: item.content.$t,
                        thumb: $(item.content.$t).find('img').eq(0).attr('src')
                    };
                }
            }
        },

        items: [],

        updateFilter: function (filter) {
            this.options.filter = filter || [];
            this._renderFeeds();
        },

        _init: function () {
            var _ = this;

            this._fetchFeeds().done(function () {
                _._renderFeeds();
            });
        },

        _fetchFeeds: function () {
            var _ = this,
                o = this.options;
                
            this.items = [];

            // get promise objects for the ajax call to each feed
            var fetches = $.map(o.feeds, function (feed) {
                return _.feedTypes[feed.type].fetch.call(_, feed);
            });

            // when all feeds have been fetched, parse the results
            return $.when.apply($, fetches).done(function () {
                // iterate through the ajax calls
                $.each(arguments, function (i, arg) {
                    var data = arg[0],
                        feed = o.feeds[i],
                        feedType = _.feedTypes[feed.type],
                        feedItems = feedType.getItems(data);

                    // limit the array to the maximum number of entries
                    if (o.limit > 0) feedItems = feedItems.slice(0, o.limit);

                    // get the formatted item, and add a reference to the feed
                    $.each(feedItems, function (i, feedItem) {
                        _.items.push($.extend({
                            feed: feed
                        }, feedType.parseItem.call(_, feedItem)));
                    });
                });

                // sort aggregated items chronologically
                _.items.sort(function (a, b) {
                    return b.date.diff(a.date);
                });
            });
        },

        _renderFeeds: function () {
            var o = this.options,
                $e = this.element.empty(),
                count = 0;

            // normalize the filter list
            if (!$.isArray(o.filter)) o.filter = [o.filter];

            $.each(this.items, function (i, item) {
                // skip this item if the filter list isn't empty and this feed isn't in it
                if (o.filter.length && $.inArray(item.feed.name, o.filter) == -1) return true;

                // check if we've hit the maximum number of items
                if (o.limit > 0 && count == o.limit) return false;
                count++;
                
                // some final formatting, then render
                var text = $.trim($('<div>').html(item.content).text());
                $e.append(Mustache.render(item.feed.template || o.template, $.extend({}, item, {
                    date: o.fromNow ? item.date.fromNow() : item.date.format(o.dateFormat),
                    summary: text.slice(0, item.feed.summaryLength || o.summaryLength),
                    firstLine: text.split('\n')[0]
                })));
            });

            this._trigger('complete');
        }
    });
})(jQuery);
