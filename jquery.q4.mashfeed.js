(function ($) {
    $.widget('q4.mashfeed', {
        options: {
            /* The global maximum number of items. 0 for unlimited (default). */
            limit: 0,
            /* A Moment.js format for dates. */
            dateFormat: 'MMM D, YYYY h:mm A',
            /* The number of characters to truncate summaries to. */
            summaryLength: 500,
            /* Feeds to fetch. Should be a list of objects containing options
             * for each feed. Valid options are:
             *   name: The name of the feed.
             *   type: The type, as listed in feedTypes (example: rss, youtube).
             *   template: A Mustache template for a single feed item (optional).
             * See feedTypes for type-specific options. */
            feeds: [],
            /* A list of feed names. If this list is not empty,
             * only the feeds named in the list will be parsed.
             */
            filter: [],
            /* A default Mustache template for each feed item.
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
            complete: null
        },

        /* A hash of feed types, indexed by id.
         * Each is an object with the following properties:
         *   fetch: A function that takes a feed object and widget options,
         *     and returns an AJAX call to the feed.
         *   parse: A function that takes raw feed data, a feed object, and
         *     widget options, and returns a list of items for the template.
         */
        feedTypes: {
            /* Options for rss:
             *   url: The url of the feed.
             */
            rss: {
                fetch: function (feed, o) {
                    return $.ajax({
                        url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=' + encodeURIComponent(feed.url),
                        dataType: 'jsonp'
                    });
                },
                parse: function (data, feed, o) {
                    var items = [];

                    $.each(data[0].responseData.feed.entries, function (i, item) {
                        if (o.limit > 0 && i == o.limit) return false;

                        items.push({
                            feedName: feed.name,
                            feedUrl: feed.url,
                            title: item.title,
                            url: item.link,
                            date: moment(item.publishedDate, 'DD MMM YYYY hh:mm:ss'),
                            content: item.content
                        });
                    });

                    return items;
                }
            },

            /* Options for youtube:
             *   username: The username of the YouTube account to fetch from.
             */
            youtube: {
                fetch: function (feed, o) {
                    return $.ajax({
                        url: '//gdata.youtube.com/feeds/users/' + feed.username + '/uploads?alt=json-in-script&callback=?',
                        dataType: 'jsonp'
                    });
                },
                parse: function (data, feed, o) {
                    var items = [];
                    $.each(data[0].feed.entry, function (i, item) {
                        if (o.limit > 0 && i == o.limit) return false;

                        items.push({
                            feedName: feed.name,
                            feedUrl: feed.url,
                            title: item.title.$t,
                            url: item.link[0].href,
                            id: item.id.$t.split('/').pop(),
                            date: moment(item.updated.$t),
                            content: item.content.$t,
                            thumb: $(item.content.$t).find('img').eq(0).attr('src')
                        });
                    });
                    return items;
                }
            }
        },

        items: [],

        _create: function () {
            this._fetchFeeds()
        },

        updateFilter: function (filter) {
            this.options.filter = filter || [];
            this._renderFeeds();
        },

        _fetchFeeds: function () {
            var _ = this,
                o = this.options;

            // get promise objects for the ajax call to each feed
            var fetches = [];
            $.each(o.feeds, function (i, feed) {
                fetches.push(_.feedTypes[feed.type].fetch(feed, o));
            });

            // when all feeds have been fetched, parse the results
            $.when.apply($, fetches).done(function () {
                var items = [];
                $.each(arguments, function (i, data) {
                    var feed = o.feeds[i];
                    $.each(_.feedTypes[feed.type].parse(data, feed, o), function (i, item) {
                        item.feed = feed;
                        items.push(item);
                    });
                });

                // sort them chronologically
                items.sort(function (a, b) {
                    return b.date.diff(a.date);
                });

                _.items = items;

                _._renderFeeds();
            });
        },

        _renderFeeds: function () {
            var o = this.options,
                $e = this.element.empty(),
                count = 0;

            if (!$.isArray(o.filter)) o.filter = [o.filter];

            $.each(this.items, function (i, item) {
                if (o.filter.length && $.inArray(item.feed.name, o.filter) == -1) return true;

                if (o.limit > 0 && count == o.limit) return false;
                count++;
                
                // formatting
                var text = $.trim($('<div>').html(item.content).text());
                
                $e.append(Mustache.render(item.feed.template || o.template, $.extend({}, item, {
                    date: item.date.format(o.dateFormat),
                    summary: text.slice(0, item.feed.summaryLength || o.summaryLength),
                    firstLine: text.split('\n')[0]
                })));
            });

            if (typeof o.complete === 'function') {
                o.complete.call(this);
            }
        }
    });
})(jQuery);
