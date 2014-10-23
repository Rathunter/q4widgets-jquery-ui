(function ($) {
    $.widget('q4.mashfeed', {
        options: {
            limit: 10,
            dateFormat: 'MMM D, YYYY h:mm A',
            summaryLength: 500,
            feeds: [
                {
                    name: 'Blog',
                    type: 'rss',
                    url: '[blog rss url]',
                    template: (
                        ''
                    )
                },
                {
                    name: 'Videos',
                    type: 'youtube',
                    username: '[youtube username]',
                    template: (
                        ''
                    )
                }
            ],
            template: (
                '<h2><a href="{{url}}">{{title}}</a></h2>' + 
                '<p>{{date}}</p>' + 
                '{{summary}}'
            )
        },

        feedTypes: {
            rss: {
                fetch: function (feed, o) {
                    return $.ajax({
                        url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=' + encodeURIComponent(feed.url),
                        dataType: 'jsonp'
                    });
                },
                parse: function (data, o) {
                    var items = [];

                    $.each(data[0].responseData.feed.entries, function (i, item) {
                        if (o.limit > 0 && i == o.limit) return false;

                        items.push({
                            title: item.title,
                            url: item.link,
                            date: moment(item.publishedDate, 'DD MMM YYYY hh:mm:ss'),
                            content: item.content
                        });
                    });

                    return items;
                }
            },

            youtube: {
                fetch: function (feed, o) {
                    return $.ajax({
                        url: '//gdata.youtube.com/feeds/users/' + feed.username + '/uploads?alt=json-in-script&callback=?',
                        dataType: 'jsonp'
                    });
                },
                parse: function (data, o) {
                    var items = [];
                    $.each(data[0].feed.entry, function (i, item) {
                        if (o.limit > 0 && i == o.limit) return false;

                        items.push({
                            title: item.title.$t,
                            url: item.link[0].href,
                            date: moment(item.updated.$t),
                            content: item.content.$t
                        });
                    });
                    return items;
                }
            }
        },

        _create: function () {
            this._renderFeeds();
        },

        _renderFeeds: function (url) {
            var _ = this,
                o = this.options,
                $e = this.element;

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
                    $.each(_.feedTypes[feed.type].parse(data, o), function (i, item) {
                        item.feed = feed;
                        items.push(item);
                    });
                });

                // sort them chronologically
                items.sort(function (a, b) {
                    return b.date.diff(a.date);
                });

                // render
                $.each(items, function (i, item) {
                    if (o.limit > 0 && i == o.limit) return false;

                    // final formatting
                    item.date = item.date.format(o.dateFormat);
                    var text = $('<div>').html(item.content).text().trim();
                    item.summary = text.slice(0, item.feed.summaryLength || o.summaryLength);
                    item.firstLine = text.split('\n')[0];

                    $e.append(Mustache.render(item.feed.template || o.template, item));
                });
            });
        }
    });
})(jQuery);
