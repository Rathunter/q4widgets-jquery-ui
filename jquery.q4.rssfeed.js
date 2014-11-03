(function ($) {
    $.widget('q4.rssfeed', {
        options: {
            url: '',
            limit: 0,
            dateFormat: 'MMM D, YYYY h:mm A',
            summaryLength: 500,
            template: (
                '<header>' +
                    '<h1><a href="{{url}}" target="_blank">{{title}}</a></h1>' +
                    '<p>Last updated: {{date}}</p>' +
                '</header>' +
                '{{#items}}' +
                '<article>' +
                    '<header>' +
                        '<h2><a href="{{url}}" target="_blank">{{{title}}}</a></h2>' +
                        '<p>{{date}}</p>' +
                    '</header>' +
                    '{{{body}}}' +
                '</article>' +
                '{{/items}}'
            ),
            complete: null
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

                if (typeof o.complete === 'function') {
                    console.log('done');
                    o.complete.call(_);
                }
            });
        },

        _create: function () {
            this._renderFeed();
        }
    });
})(jQuery);
