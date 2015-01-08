(function ($) {
    $.widget('q4.pager', {
        options: {
            /* The number of items to page through. */
            count: 95,
            /* The number of items per page. */
            perPage: 1,
            /* A list of page labels to use, instead of count/perPage. */
            pages: [],
            /* The active page on initialization. */
            startPage: 1,
            /* Whether to fire the before/after callbacks on initialization. */
            callbackOnInit: true,
            /* Whether to show first/last page triggers. */
            showFirstLast: true,
            /* Whether to show previous/next page triggers. */
            showPrevNext: true,
            /* A selector for each trigger. */
            trigger: '> *',
            /* A template for each trigger. */
            template: '<span>{{page}}</span>',
            /* The text to display for first/last/previous/next page triggers. */
            labels: {
                first: '«',
                prev: '<',
                next: '>',
                last: '»'
            },
            /* A callback that is fired after a trigger is clicked. */
            beforeChange: null,
            /* A callback that is fired after updating the pager. */
            afterChange: null
        },

        pages: [],

        setPage: function (page) {
            var $e = this.element,
                o = this.options;

            // abort if page doesn't exist
            if ($.inArray(page, this.pages) == -1) return;

            var index = $.inArray(page, this.pages),
                last = this.pages.length - 1;

            // update first/last/prev/next triggers
            $('.pager-first, .pager-prev', $e).toggleClass('pager-disabled', index == 0);
            $('.pager-last, .pager-next', $e).toggleClass('pager-disabled', index == last);
            $('.pager-prev', $e).data('page', index > 0 ? this.pages[index - 1] : '');
            $('.pager-next', $e).data('page', index < last ? this.pages[index + 1] : '');

            // update active trigger
            $('.pager-page', $e).removeClass('pager-active').filter(function () {
                return $(this).data('page') == page;
            }).addClass('pager-active');
        },

        changePage: function (page) {
            var o = this.options;

            // fire before callback
            if (typeof o.beforeChange == 'function') o.beforeChange(this, page);

            // set the actual page
            this.setPage(page);

            // fire after callback
            if (typeof o.afterChange == 'function') o.afterChange(this, page);
        },

        _bindEvents: function () {
            var handlers = {};

            handlers['click ' + this.options.trigger] = function (e) {
                if (!$(e.target).hasClass('pager-disabled') && !$(e.target).hasClass('pager-active')) {
                    this.changePage($(e.target).data('page'));
                }
            };

            this._on(handlers);
        },

        _drawPager: function () {
            var o = this.options,
                $e = this.element,
                pageCount,
                startPage = null;

            if (o.pages.length) {
                // initialize pages from a fixed list
                this.pages = o.pages;
                pageCount = this.pages.length;
                if (o.startPage && $.inArray(o.startPage, this.pages) > -1) startPage = o.startPage;

            } else {
                // initialize pages by number of items
                pageCount = Math.ceil(o.count / (o.perPage ? o.perPage : 1));
                this.pages = [];
                for (var page = 1; page <= pageCount; page++) {
                    this.pages.push(page)
                };
                if (o.startPage) startPage = Math.max(1, Math.min(pageCount + 1, o.startPage));
            }

            // draw pager
            if (o.showFirstLast) $(Mustache.render(o.template, {page: o.labels.first})).addClass('pager-first').data('page', 1).appendTo($e);
            if (o.showPrevNext) $(Mustache.render(o.template, {page: o.labels.prev})).addClass('pager-prev pager-disabled').appendTo($e);
            $.each(this.pages, function (index, page) {
                $(Mustache.render(o.template, {page: page})).addClass('pager-page').data('page', page).appendTo($e);
            });
            if (o.showPrevNext) $(Mustache.render(o.template, {page: o.labels.next})).addClass('pager-next pager-disabled').appendTo($e);
            if (o.showFirstLast) $(Mustache.render(o.template, {page: o.labels.last})).addClass('pager-last').data('page', pageCount).appendTo($e);

            // disable page trigger if there is only one page
            if (pageCount == 1) $('.pager-page', $e).addClass('pager-disabled');

            // go to start page if possible
            if (startPage !== null) this.setPage(startPage);
        },

        _init: function () {
            this._drawPager();
        },

        _create: function () {
            this._bindEvents();
        }
    });
})(jQuery);
