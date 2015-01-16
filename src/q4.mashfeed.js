(function ($) {
    /**
     * Grab a number of content feeds and mix them together into a single
     * chronological list.
     * @class q4.mashfeed
     * @version 1.0.0
     * @author marcusk@q4websystems.com
     * @requires Moment.js
     * @requires Mustache.js
     */
    $.widget('q4.mashfeed', /** @lends q4.mashfeed */ {
        options: {
            /**
             * The global maximum number of items, or zero for unlimited.
             * @type {number}
             * @default
             */
            limit: 0,
            /**
             * A Moment.js format for dates.
             * @type {string}
             * @default
             */
            dateFormat: 'MMM D, YYYY h:mm A',
            /**
             * Whether to display dates using Moment's fromNow function.
             * @type {boolean}
             * @default
             */
            fromNow: false,
            /**
             * The maximum character length of a title, or zero for unlimited.
             * @type {number}
             * @default
             */
            titleLength: 80,
            /**
             * The maximum character length of a summary, or zero for unlimited.
             * @type {number}
             * @default
             */
            summaryLength: 500,
            /**
             * An array of feeds to fetch. Each feed is an object of options
             * for that feed. Some feed options override global options.
             * Valid options for all feed types are:
             * - name: The name of the feed.
             * - type: The type, as listed in `feedTypes` (e.g. `rss`, `youtube`).
             * - template: A Mustache template for a single feed item
             *     (overrides the default template).
             * - limit: The maximum number of items from this feed.
             * - titleLength: The maximum character length of a title.
             * - summaryLength: The maximum character length of a summary.
             * - fetch: A function overriding the feed type's `fetch` method.
             * - getItems: A function overriding the feed type's `getItems` method.
             * - parseItem: A function overriding the feed type's `parseItem` method.
             * 
             * See `feedTypes` for type-specific options.
             * @type {Array<Object>}
             */
            feeds: [],
            /**
             * A list of feed names. If this list is not empty,
             * only the feeds named in the list will be parsed.
             * @type {Array<string>}
             */
            filter: [],
            /**
             * A default Mustache template for a single feed item.
             * Can be overridden for individual feed types.
             * @type {string}
             * @example
             * '<li>' + 
             *     '<h2><a href="{{url}}">{{title}}</a></h2>' + 
             *     '<p>{{date}}</p>' + 
             *     '{{summary}}' +
             * '</li>'
             */
            template: '',
            /**
             * A callback that fires after rendering is finished.
             * @type {function}
             * @param {Object} [event] The event object.
             */
            complete: function (e) {}
        },

        /**
         * A hash of feed types, indexed by id.
         * Each is an object with the following properties:
         * - fetch: A function that takes a feed object and returns
         *     an AJAX call to the feed.
         * - getItems: A function that takes raw feed data and returns the
         *     array of raw items found in that feed.
         * - parseItem: A function that takes a raw feed item and returns
         *     a formatted item object for the template.
         * Note that some of these (twitter, facebook, youtube) are pretty
         * tightly coupled to specific Q4 APIs, but others (rss, custom_jsonp)
         * are more generic and should be more generally useful.
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
                        id: item.id_str
                    };
                }
            },

            /* Options for facebook:
             *   url: The url of the JSON feed.
             */
            facebook: {
                fetch: function (feed) {
                    return $.ajax({
                        url: feed.url,
                        dataType: 'jsonp'
                    });
                },
                getItems: function (data) {
                    return data.entries;
                },
                parseItem: function (item) {
                    return {
                        title: item.title,
                        url: item.alternate,
                        id: item.id,
                        date: moment(item.published),
                        content: item.text
                    };
                }
            },

            /**
             * Options for youtube:
             * - username: The username of the YouTube account to fetch from.
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
            },

            /**
             * This is a very basic feed type; the methods are meant to be
             * overridden with custom functions.
             * Options for custom_jsonp:
             * - params: An object of parameters to pass to the URL.
             */
            custom_jsonp: {
                fetch: function (feed) {
                    return $.ajax({
                        url: feed.url,
                        data: feed.params,
                        dataType: 'jsonp'
                    });
                },
                getItems: function (data) {
                    return data;
                },
                parseItem: function (item) {
                    return item;
                }
            }
        },

        items: [],

        /**
         * Update the `filter` option.
         * @param {Array<string>} filter An array of feed names to display,
         *   or an empty array to display all feeds.
         */
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
                // call the custom fetch method if available
                return (typeof feed.fetch === 'function' ?
                    feed.fetch.call(_, feed) :
                    _.feedTypes[feed.type].fetch.call(_, feed)
                );
            });

            // when all feeds have been fetched, parse the results
            return $.when.apply($, fetches).done(function () {
                // iterate through the ajax calls
                $.each(arguments, function (i, arg) {
                    var data = arg[0],
                        feed = o.feeds[i],
                        feedType = _.feedTypes[feed.type],
                        // call the custom getItems method if available
                        feedItems = (typeof feed.getItems === 'function' ?
                            feed.getItems.call(_, data) :
                            feedType.getItems.call(_, data)
                        );

                    // limit the array to the maximum number of entries
                    if (o.limit > 0) feedItems = feedItems.slice(0, o.limit);
                    if (feed.limit > 0) feedItems = feedItems.slice(0, feed.limit);

                    // get the formatted item, and add a reference to the feed
                    $.each(feedItems, function (i, feedItem) {
                        _.items.push($.extend({
                            feed: feed
                        // call the custom parseItem method if available
                        }, (typeof feed.parseItem === 'function' ?
                            feed.parseItem.call(_, feedItem) :
                            feedType.parseItem.call(_, feedItem))
                        ));
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

            function truncate(text, length) {
                return length && text.length > length ? text.slice(0, length) + '...' : text;
            }

            $.each(this.items, function (i, item) {
                // skip this item if the filter list isn't empty and this feed isn't in it
                if (o.filter.length && $.inArray(item.feed.name, o.filter) == -1) return true;

                // check if we've hit the maximum number of items
                if (o.limit > 0 && count == o.limit) return false;
                count++;

                // some final formatting
                if ('title' in item) {
                    item.title = truncate(item.title, item.feed.titleLength || o.titleLength);
                }
                if ('date' in item) {
                    item.date = o.fromNow ? item.date.fromNow() : item.date.format(o.dateFormat);
                }
                if ('content' in item) {
                    var text = $.trim($('<div>').html(item.content).text());
                    item.summary = truncate(text, item.feed.summaryLength || o.summaryLength);
                    item.firstLine = text.split('\n')[0];
                }

                // render item
                $e.append(Mustache.render(item.feed.template || o.template, item));
            });

            this._trigger('complete');
        }
    });
})(jQuery);
