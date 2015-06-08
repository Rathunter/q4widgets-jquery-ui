(function ($) {
    /**
     * Grab a number of content feeds and mix them together into a single chronological list.
     * @class q4.mashfeed
     * @version 1.2.1
     * @author marcusk@q4websystems.com
     * @requires [Moment.js](lib/moment.min.js)
     * @requires [Mustache.js](lib/mustache.min.js)
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
             *
             * - `name`          The name of the feed.
             * - `type`          The type, as listed in `feedTypes` (e.g. `rss`, `youtube`).
             * - `template`      A Mustache template for a single feed item
             *     (overrides the default template).
             * - `limit`         The maximum number of items from this feed.
             * - `titleLength`   The maximum character length of a title.
             * - `summaryLength` The maximum character length of a summary.
             * - `fetch`         A function overriding the feed type's `fetch` method.
             * - `getItems`      A function overriding the feed type's `getItems` method.
             * - `parseItem`     A function overriding the feed type's `parseItem` method.
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
         *
         * - `fetch`     A function that takes a feed object and returns an AJAX call to the feed.
         * - `getItems`  A function that takes raw feed data and returns an array of raw items.
         * - `parseItem` A function that takes a raw feed item and formats it for the template.
         *
         * The Twitter and Facebook feed types are designed to parse a JSON feed
         * proxied from those sites' APIs. YouTube and StockTwits call the APIs directly.
         * The RSS and custom_jsonp feed types are more generic,
         * and useful when one or more of their functions are overridden.
         */
        feedTypes: {
            /* Options for rss:
             *   url: The url of the feed.
             * The default limit for Google's AJAX feeds API is 4 entries.
             * We have increased the default to 25.
             */
            rss: {
                fetch: function (feed) {
                    return $.ajax({
                        url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=' + (feed.limit || 25) + '&q=' + encodeURIComponent(feed.url),
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
                        content: (item.text
                            .replace(/https?:\/\/[\S]+/gi, '<a href="$&" target="_blank">$&</a>')
                            .replace(/#(\w+)/g, '<a href="https://twitter.com/hashtag/$1" target="_blank">#$1</a>')
                            .replace(/@(\w+)/g, '<a href="https://twitter.com/$1" target="_blank">@$1</a>')
                            ),
                        text: item.text,
                        date: moment(item.created_at, 'ddd MMM DD hh:mm:ss ZZ YYYY'),
                        id: item.id_str,
                        url: 'https://twitter.com/' + item.user.name + '/status/' + item.id_str
                    };
                }
            },

            /**
             * Options for StockTwits:
             * - symbol: Stock symbol / "cashtag" to look up.
             */
            stocktwits: {
                fetch: function (feed) {
                    return $.ajax({
                        url: 'https://api.stocktwits.com/api/2/streams/symbol/' + feed.symbol + '.json',
                        dataType: 'jsonp'
                    });
                },
                getItems: function (data) {
                    return data.messages;
                },
                parseItem: function (item) {
                    return {
                        user: item.user.username,
                        username: item.user.name,
                        content: item.body,
                        date: moment(item.created_at),
                        id: item.id
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
                    return data;
                },
                parseItem: function (item) {
                    return {
                        url: item.link,
                        id: item.id,
                        date: moment(item.created_time),
                        type: item.type,
                        content: item.message,
                        thumb: item.picture
                    };
                }
            },

            /**
             * Options for youtube:
             * - channelId: the ID of the user's channel.
             * - apiKey: the API key for Youtube Data API v3.
             */
            youtube: {
                fetch: function (feed) {
                    return $.ajax({
                        url: 'https://www.googleapis.com/youtube/v3/search?part=id,snippet&channelId=' + feed.channelId + '&key=' + feed.apiKey,
                        dataType: 'jsonp'
                    });
                },
                getItems: function (data) {
                    return data.items;
                },
                parseItem: function (item) {
                    return {
                        title: item.snippet.title,
                        url: 'https://www.youtube.com/watch?v=' + item.id.videoId,
                        id: item.id.videoId,
                        date: moment(item.snippet.publishedAt),
                        content: item.snippet.description,
                        thumb: item.snippet.thumbnails.medium.url
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
                if (typeof feed.limit === 'undefined') feed.limit = o.limit;

                // call the custom fetch method if available
                return (typeof feed.fetch === 'function' ?
                    feed.fetch.call(_, feed) :
                    _.feedTypes[feed.type].fetch.call(_, feed)
                );
            });

            // when all feeds have been fetched, parse the results
            return $.when.apply($, fetches).done(function () {
                // jquery returns an array of responses only if multiple promises were passed
                var responses = fetches.length > 1 ? arguments : [arguments];

                // iterate through the ajax calls
                $.each(responses, function (i, jqxhr) {
                    var data = jqxhr[0],
                        feed = o.feeds[i],
                        feedType = _.feedTypes[feed.type],
                        // call the custom getItems method if available
                        feedItems = (typeof feed.getItems === 'function' ?
                            feed.getItems.call(_, data) :
                            feedType.getItems.call(_, data)
                        );

                    // limit the array to the maximum number of entries
                    if (o.limit) feedItems = feedItems.slice(0, o.limit);
                    if (feed.limit) feedItems = feedItems.slice(0, feed.limit);

                    // add this feed's items to the aggregated list
                    $.each(feedItems, function (i, feedItem) {
                        // add a reference to the feed
                        var item = $.extend({
                            _feed: feed
                        },
                        // call the custom parseItem method if available
                        (typeof feed.parseItem === 'function' ?
                            feed.parseItem.call(_, feedItem) :
                            feedType.parseItem.call(_, feedItem))
                        );

                        // we can't use items with no date field
                        if (!item.date) {
                            console.log('No "date" field found in parsed', feed.name, 'item.');
                            return true;
                        }

                        // convert any string dates to moment dates
                        if (typeof item.date == 'string') item.date = moment(item.date);

                        _.items.push(item);
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
                $e = this.element.empty();

            // normalize the filter list
            if (!$.isArray(o.filter)) o.filter = [o.filter];

            // if filter list isn't empty, filter the items
            var items = $.grep(this.items, function (item) {
                return !o.filter.length || $.inArray(item._feed.name, o.filter) > -1;
            });

            function truncate(text, limit) {
                if (!limit || text.length < limit) return text;
                // truncate and return up to the last space to ensure whole words
                return text.slice(0, limit).split(/\s+/).slice(0, -1).join(' ') + '...';
            }

            $.each(o.limit ? items.slice(0, o.limit) : items, function (i, item) {
                // some final formatting - use a new object so we don't overwrite the original
                var formatted = {};
                if ('title' in item) {
                    formatted.title = truncate(item.title, item._feed.titleLength || o.titleLength);
                }
                if ('date' in item) {
                    formatted.date = o.fromNow ? item.date.fromNow() : item.date.format(o.dateFormat);
                }
                if ('content' in item) {
                    var text = $.trim($('<div>').html(item.content).text());
                    formatted.summary = truncate(text, item._feed.summaryLength || o.summaryLength);
                    formatted.firstLine = text.split('\n')[0];
                }

                // render item
                $e.append(Mustache.render(item._feed.template || o.template, $.extend({}, item, formatted)));
            });

            this._trigger('complete');
        }
    });
})(jQuery);
