(function($) {
    $.widget("q4.news", {
        options: {
            tags: [],
            category: '00000000-0000-0000-0000-000000000000',
            limit: 0,
            skip: 0,
            titleLength: 0,
            dateFormat: 'mm/dd/yy',
            loadBody: true,
            loadShortBody: true,
            bodyLength: 0,
            shortBodyLength: 0,
            defaultThumb: '',
            template: (
                '{{#items}}' +
                '<div class="news-item">' +
                    '<div class="news-thumb"><img src="{{thumb}}"></div>' +
                    '<span class="news-date">{{date}}</span>' +
                    '<a href="{{url}}" class="news-title">{{title}}</a>' +
                '</div>' +
                '{{/items}}'
            ),
            complete: null
        },

        _create: function () {
            this._getNewsList();
        },

        _getNewsList: function () {
            var _ = this,
                o = this.options;

            var data = {
                serviceDto:{
                    ViewType: GetViewType(),
                    ViewDate: GetViewDate(),
                    RevisionNumber: GetRevisionNumber(),
                    LanguageId: GetLanguageId(),
                    Signature: GetSignature(),
                    ItemCount: o.limit || -1,
                    StartIndex: o.skip,
                    TagList: o.tags
                },
                pressReleaseSelection: 3,
                pressReleaseBodyType: o.loadShortBody ? (o.loadBody ? 1 : 3) : (o.loadBody ? 2 : 0),
                pressReleaseCategoryWorkflowId: o.category,
                year: -1
            };

            $.ajax({
                type: 'POST',
                url: '/Services/PressReleaseService.svc/GetPressReleaseList',
                data: JSON.stringify(data),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (data) {
                    _._renderNewsList(data.GetPressReleaseListResult);
                },
                error: function (data) {
                    console.log('Error fetching press releases: ' + data);
                }
            });
        },

        _renderNewsList: function (data) {
            var inst = this,
                o = this.options,
                $e = this.element,
                news = '',
                itemsByYear = {},
                tplData = {
                    years: [],
                    items: []
                };

            function truncate(text, length) {
                if (!text) return '';
                return !length || text.length <= length ? text : text.substring(0, length) + '...';
            }

            $.each(data, function(i, value) {
                var date = new Date(value.PressReleaseDate),
                    year = date.getFullYear();

                if (!(year in itemsByYear)) {
                    itemsByYear[year] = [];
                }

                var item = {
                    title: truncate(value.Headline, o.titleLength),
                    thumb: value.ThumbnailPath || o.defaultThumb,
                    date: $.datepicker.formatDate(o.dateFormat, date),
                    url: value.LinkToDetailPage,
                    body: truncate(value.Body, o.bodyLength),
                    shortBody: truncate(value.ShortBody, o.shortBodyLength)
                };

                itemsByYear[year].push(item);
                tplData.items.push(item);
            });

            $.each(itemsByYear, function (year, items) {
                tplData.years.push({
                    year: year,
                    items: items
                });
            });

            $e.append(Mustache.render(o.template, tplData));

            if (typeof o.complete === 'function') {
                o.complete.call(this);
            }
        }
    });
})(jQuery);
