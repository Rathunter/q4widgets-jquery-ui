(function ($) {
    $.widget('q4.rssfeed', {
        options: {
            url: '',
            dateFormat: 'MMM D, YYYY h:mm A',
            summaryLength: 500,
            template: (
                '<header>' +
                    '<h1><a href="{{link}}" target="_blank">{{title}}</a></h1>' +
                    '<p>Last updated: {{date}}</p>' +
                '</header>' +
                '{{#items}}' +
                '<article>' +
                    '<header>' +
                        '<h2><a href="{{link}}" target="_blank">{{{title}}}</a></h2>' +
                        '<p>{{date}}</p>' +
                    '</header>' +
                    '{{{body}}}' +
                '</article>' +
                '{{/items}}'
            )
        },

        _renderFeed: function (url) {
            var o = this.options,
                $e = this.element;

            $.get(o.url, function (xml) {
                var $channel = $(xml).find('channel'),
                    feed = {
                        title: $channel.children('title').text(),
                        link: $channel.children('link').text(),
                        date: moment($channel.children('lastBuildDate').text(), 'DD MMM YYYY hh:mm:ss').format(o.dateFormat),
                        items: []
                    };

                $.each($channel.children('item'), function (i, item) {
                    var $item = $(item),
                        body = $item.children('description').text(),
                        text = $(body).text().replace(/\/*<!\[CDATA\[[\s\S]*?\]\]>\/*/, '').trim();

                    feed.items.push({
                        title: $item.children('title').text(),
                        link: $item.children('link').text(),
                        date: moment($item.children('pubDate').text(), 'DD MMM YYYY hh:mm:ss').format(o.dateFormat),
                        body: body,
                        summary: text.slice(0, o.summaryLength),
                        firstLine: text.split('\n')[0]
                    });
                });

                $e.html(Mustache.render(o.template, feed));
            });
        },

        _create: function () {
            this._renderFeed();
        }
    });
})(jQuery);
