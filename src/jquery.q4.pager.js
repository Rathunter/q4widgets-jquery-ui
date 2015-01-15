(function ($) {
    /**
     * A navigator for any kind of paginated content.
     * @class q4.pager
     * @version 1.0.0
     * @author marcusk@q4websystems.com
     * @requires Mustache.js
     */
    $.widget('q4.pager', /** @lends q4.pager */ {
        options: {
            /**
             * The number of items to page through.
             * @type {number}
             */
            count: 95,
            /**
             * The number of items per page.
             * @type {number}
             */
            perPage: 1,
            /**
             * A list of page numbers or labels. If this is empty, page numbers
             * will be generated from `count` and `perPage`.
             * @type {(Array<string>|Array<number>)}
             */
            pages: [],
            /**
             * The active page on initialization.
             * @type {number}
             * @default
             */
            startPage: 1,
            /**
             * Whether to show first/last page triggers.
             * @type {boolean}
             * @default
             */
            showFirstLast: true,
            /**
             * Whether to show previous/next page triggers.
             * @type {boolean}
             * @default
             */
            showPrevNext: true,
            /**
             * A selector for each trigger.
             * @type {string}
             * @default
             */
            trigger: '> *',
            /**
             * A template for each trigger. Use {{page}} for the page number or label.
             * @type {string}
             * @default
             */
            template: '<span>{{page}}</span>',
            /**
             * The text to display for first/last/previous/next page triggers.
             * @type {Object}
             * @prop {string} first First page.
             * @prop {string} prev  Previous page.
             * @prop {string} next  Next page.
             * @prop {string} last  Last page.
             */
            labels: {
                first: '«',
                prev: '<',
                next: '>',
                last: '»'
            },
            /**
             * A callback fired after a trigger is clicked.
             * @type {function}
             * @param {Event}  [event] The triggering event.
             * @param {Object} [data]  A data object with these properties:
             * - `page`     The page we are changing to.
             * - `prevPage` The page we are changing from.
             */
            beforeChange: function (e, data) {},
            /**
             * A callback fired after updating the pager.
             * @type {function}
             * @param {Event}  [event] The triggering event.
             * @param {Object} [data]  A data object with these properties:
             * - `page`     The page we are changing to.
             * - `prevPage` The page we are changing from.
             */
            afterChange: function (e, data) {}
        },

        pages: [],
        currentPage: null,

        /**
         * Set the current page displayed on the pager.
         * @param {(number|string)} page    The page number or label to go to.
         * @param {Event}           [event] The event that triggered this change.
         */
        changePage: function (page, event) {
            var o = this.options,
                data = {
                    page: page,
                    prevPage: this.currentPage
                };

            // fire before callback
            this._trigger('beforeChange', e, data);

            // set the actual page
            this.setPage(page);

            // fire after callback
            this._trigger('afterChange', e, data);
        },

        _create: function () {
            this._bindEvents();
        },

        _init: function () {
            this._drawPager();
        },

        _bindEvents: function () {
            var handlers = {};

            handlers['click ' + this.options.trigger] = function (e) {
                if (!$(e.target).hasClass('pager-disabled') && !$(e.target).hasClass('pager-active')) {
                    this.changePage($(e.target).data('page'), e);
                }
            };

            this._on(handlers);
        },

        _drawPager: function () {
            var o = this.options,
                $e = this.element,
                pageCount,
                startPage = null;

            if ($.isArray(o.pages) && o.pages.length) {
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
            if (startPage !== null) this._setPage(startPage);
        },

        _setPage: function (page) {
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

            // store current page
            this.currentPage = page;
        }
    });
})(jQuery);
