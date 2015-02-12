(function ($) {
    /**
     * Fetch, format and display a single RSS feed.
     * Note that you can also do this with the q4.mashfeed widget; this one is just simpler.
     * @class q4.rssfeed
     * @version 1.1.0
     * @author marcusk@q4websystems.com
     * @requires Moment.js
     * @requires Mustache.js
     */
    $.widget('q4.rssfeed', /** @lends q4.rssfeed */ {
        options: {
            /**
             * The URL of the RSS feed.
             * @type {string}
             */
            url: '',
            /**
             * The maximum number of items to display, or zero for unlimited.
             * @type {number}
             * @default
             */
            limit: 0,
            /**
             * A Moment.js date format string to use when rendering.
             * @type {string}
             * @default
             */
            dateFormat: 'MMM D, YYYY h:mm A',
            /**
             * The maximum length for each item's summary, or zero for unlimited.
             * @type {number}
             * @default
             */
            summaryLength: 500,
            /**
             * Whether to use a JSON proxy to fetch the RSS feed.
             * @type {boolean}
             * @default
             */
            proxy: false,
            /**
             * A Mustache template for the widget, with these tags:
             *
             * - `{{title}}` The title of the feed.
             * - `{{url}} `  The URL of the feed.
             * - `{{date}}`  The last updated date of the feed.
             * - `{{items}}` An array of items with these tags:
             *     - `{{title}}`     The item's title.
             *     - `{{url}}`       The item's URL.
             *     - `{{date}}`      The item's publication date.
             *     - `{{body}}`      The item's body content.
             *     - `{{summary}}`   The plaintext body content, truncated to `summaryLength`.
             *     - `{{firstLine}}` The plaintext body content, up to the first line break.
             * @type {string}
             * @example
             * '<header>' +
             *     '<h1><a href="{{url}}" target="_blank">{{title}}</a></h1>' +
             *     '<p>Last updated: {{date}}</p>' +
             * '</header>' +
             * '{{#items}}' +
             * '<article>' +
             *     '<header>' +
             *         '<h2><a href="{{url}}" target="_blank">{{{title}}}</a></h2>' +
             *         '<p>{{date}}</p>' +
             *     '</header>' +
             *     '{{{body}}}' +
             * '</article>' +
             * '{{/items}}'
             */
            template: '',
            /**
             * A callback fired after rendering is complete.
             * @type {function}
             * @param {Event} [event] The triggering event.
             */
            complete: function (e) {}
        },

        _create: function () {
            var _ = this,
                o = this.options;
                $e = this.element;

            this._fetchFeed().done(function (data) {
                var feed = o.proxy ? _._parseJSONFeed(data) : _._parseXMLFeed(data);

                $e.append(Mustache.render(o.template, feed));

                _._trigger('complete');
            });
        },

        _fetchFeed: function () {
            var o = this.options;

            return !o.proxy ? $.get(o.url) : $.ajax({
                url: '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&q=' + encodeURIComponent(o.url),
                dataType: 'jsonp'
            });
        },

        _sliceItems: function (items) {
            return this.options.limit ? items.slice(0, this.options.limit) : items;
        },

        _sliceSummary: function (text) {
            var limit = this.options.summaryLength;
            return limit && text.length > limit ? text.slice(0, limit) + '...' : text;
        },

        _parseXMLFeed: function (data) {
            var _ = this,
                o = this.options,
                $channel = $(data).find('channel');

            return {
                title: $channel.children('title').text(),
                url: $channel.children('link').text(),
                date: moment($channel.children('lastBuildDate').text(), 'DD MMM YYYY hh:mm:ss').format(o.dateFormat),
                items: $.map(this.sliceItems($channel.children('item')), function (item, i) {
                    var $item = $(item),
                        // body may be HTML or text, depending on the feed
                        body = $.trim($item.children('description').text()),
                        // wrap body in a div to force it to HTML, then take the text
                        text = $.trim($('<div>').html(body).text().replace(/\/*<!\[CDATA\[[\s\S]*?\]\]>\/*/g, ''));

                    return {
                        title: $item.children('title').text(),
                        url: $item.children('link').text(),
                        date: moment($item.children('pubDate').text(), 'DD MMM YYYY hh:mm:ss').format(o.dateFormat),
                        body: body,
                        summary: _._sliceSummary(text),
                        firstLine: text.split('\n')[0]
                    };
                })
            };
        },

        _parseJSONFeed: function (data) {
            var _ = this,
                o = this.options,
                data = data.responseData.feed;

            return {
                title: data.title,
                url: data.link,
                date: moment(data.lastBuildDate || '', 'DD MMM YYYY hh:mm:ss').format(o.dateFormat),
                items: $.map(this._sliceItems(data.entries), function (item, i) {
                    return {
                        title: item.title,
                        url: item.link,
                        date: moment(item.publishedDate, 'DD MMM YYYY hh:mm:ss').format(o.dateFormat),
                        body: item.content,
                        summary: _._sliceSummary(item.content),
                        firstLine: item.content.split('\n')[0]
                    }
                })
            };
        }
    });
})(jQuery);
