(function ($) {
    /**
     * Fetch, format and display an RSS feed.
     * @class q4.rssfeed
     * @version 1.0.1
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

        _renderFeed: function (url) {
            var _ = this,
                o = this.options,
                $e = this.element;

            $.get(o.url, function (xml) {
                var $channel = $(xml).find('channel'),
                    feed = {
                        title: $channel.children('title').text(),
                        url: $channel.children('link').text(),
                        date: moment($channel.children('lastBuildDate').text(), 'DD MMM YYYY hh:mm:ss').format(o.dateFormat),
                        items: []
                    };

                $.each($channel.children('item'), function (i, item) {
                    if (o.limit > 0 && i == o.limit) return false;

                    var $item = $(item),
                        // body may be HTML or text, depending on the feed
                        body = $.trim($item.children('description').text()),
                        // wrap body in a div to force it to HTML, then take the text
                        text = $.trim($('<div>').html(body).text().replace(/\/*<!\[CDATA\[[\s\S]*?\]\]>\/*/g, ''));

                    feed.items.push({
                        title: $item.children('title').text(),
                        url: $item.children('link').text(),
                        date: moment($item.children('pubDate').text(), 'DD MMM YYYY hh:mm:ss').format(o.dateFormat),
                        body: body,
                        summary: text.slice(0, o.summaryLength),
                        firstLine: text.split('\n')[0]
                    });
                });

                $e.append(Mustache.render(o.template, feed));

                _._trigger('complete');
            });
        },

        _create: function () {
            this._renderFeed();
        }
    });
})(jQuery);
