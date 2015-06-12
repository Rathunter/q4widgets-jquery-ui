(function ($) {
    /**
     * A navigator for any kind of paginated content.
     * @class q4.pager
     * @version 1.2.0
     * @author marcusk@q4websystems.com
     * @requires [Mustache.js](lib/mustache.min.js)
     * @example
     * This example uses the pager in conjunction with the [q4.api](q4.api.html) widget.
     * It uses the `content` option to automatically show and hide each page of events.
     * ---
     * <div id='#events'></div>
     * <ul id='#pager'></ul>
     *
     * <script>
     * $('#events').events({
     *     template: (
     *         '<ul class="years">{{#years}}<li>{{year}}</li>{{/years}}</ul>' +
     *         '<ul class="items">' +
     *             '{{#items}}' +
     *             '<li>' +
     *                 '<span class="date">{{date}}</span>' +
     *                 '<a href="{{url}}">{{title}}</a>' +
     *             '</li>' +
     *             '{{/items}}' +
     *         '</ul>'
     *     ),
     *     yearTrigger: '.years li',
     *     complete: function () {
     *         $('#pager').pager({
     *             content: $('#events .items li'),
     *             perPage: 10,
     *             template: (
     *                 '<li>{{page}}</li>'
     *             ),
     *             append: false,
     *             trigger: 'li'
     *         });
     *     }
     * });
     * </script>
     */
    $.widget('q4.pager', /** @lends q4.pager */ {
        options: {
            /**
             * A jQuery object (or a selector for one) containing a number of elements.
             * If this is passed, then when the page changes, the pager will show the elements
             * on the current page and hide the others.
             *
             * Note: if the number of elements changes, you will need to reinitialize the pager.
             * @type {(string|jQuery)}
             */
            content: null,
            /**
             * The number of items to page through. If `items` is passed, this will be overridden
             * by the number of elements in that jQuery object.
             * @type {number}
             */
            count: 0,
            /**
             * The number of items per page.
             * @type {number}
             */
            perPage: 1,
            /**
             * A list of page numbers or labels. If this is empty, page numbers
             * will be generated using `perPage` and either `content` or `count`.
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
             * Whether to show page number triggers.
             * @type {boolean}
             * @default
             */
            showPages: true,
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
             * Whether to append the template to the widget container,
             * or replace the container's contents entirely.
             * @type {boolean}
             * @default
             */
            append: true,
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
             * A selector for a message saying which pages or items are being displayed.
             * @type {string}
             */
            pageMessageContainer: null,
            /**
             * A Mustache template for the pagination message.
             * @type {string}
             * @example 'Showing items {{startItem}} to {{lastItem}} of {{itemCount}}.'
             * @example 'Showing page {{page}} of {{pageCount}}.'
             * @default
             */
            pageMessageTemplate: '',
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

        $items: null,
        pages: [],
        currentPage: null,

        /**
         * Set the current page displayed on the pager.
         * @param {(number|string)} page    The page number or label to go to.
         * @param {Event}           [event] The event that triggered this change.
         */
        changePage: function (page, e) {
            var o = this.options,
                data = {
                    page: page,
                    prevPage: this.currentPage
                };

            // fire before callback
            this._trigger('beforeChange', e, data);

            // set the actual page
            this._setPage(page);

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

            // get jQuery object if possible
            if (typeof o.content == 'string') this.$items = $(o.content);
            else if (o.content instanceof jQuery) this.$items = o.content;

            this.pages = [];
            if ($.isArray(o.pages) && o.pages.length) {
                // initialize pages from a fixed list
                this.pages = o.pages;
                pageCount = this.pages.length;
                if (o.startPage && $.inArray(o.startPage, this.pages) > -1) startPage = o.startPage;
            }
            else if (this.$items || o.count) {
                // initialize pages by number of elements, or count option
                pageCount = Math.ceil((this.$items ? this.$items.length : o.count) / (o.perPage || 1));

                for (var page = 1; page <= pageCount; page++) {
                    this.pages.push(page);
                };
                if (o.startPage) startPage = Math.max(1, Math.min(pageCount + 1, o.startPage));
            }

            if (!o.append) $e.empty();

            // draw pager
            if (o.showFirstLast) $(Mustache.render(o.template, {page: o.labels.first})).addClass('pager-first').data('page', 1).appendTo($e);
            if (o.showPrevNext) $(Mustache.render(o.template, {page: o.labels.prev})).addClass('pager-prev pager-disabled').appendTo($e);
            if (o.showPages) {
                $.each(this.pages, function (index, page) {
                    $(Mustache.render(o.template, {page: page})).addClass('pager-page').data('page', page).appendTo($e);
                });
            }
            if (o.showPrevNext) $(Mustache.render(o.template, {page: o.labels.next})).addClass('pager-next pager-disabled').appendTo($e);
            if (o.showFirstLast) $(Mustache.render(o.template, {page: o.labels.last})).addClass('pager-last').data('page', pageCount).appendTo($e);

            // disable page trigger if there is only one page
            if (pageCount == 1) $('.pager-page', $e).addClass('pager-disabled');

            // go to start page if possible
            if (startPage !== null) this.changePage(startPage);
        },

        _setPage: function (page) {
            var $e = this.element,
                o = this.options;

            var index = $.inArray(page, this.pages),
                last = this.pages.length - 1;

            // abort if page doesn't exist
            if (index == -1) return;

            // update first/last/prev/next triggers
            $('.pager-first, .pager-prev', $e).toggleClass('pager-disabled', index == 0);
            $('.pager-last, .pager-next', $e).toggleClass('pager-disabled', index == last);
            $('.pager-prev', $e).data('page', index > 0 ? this.pages[index - 1] : '');
            $('.pager-next', $e).data('page', index < last ? this.pages[index + 1] : '');

            // update active trigger
            $('.pager-page', $e).removeClass('pager-active').filter(function () {
                return $(this).data('page') == page;
            }).addClass('pager-active');

            // show/hide content pages if applicable
            if (this.$items) {
                var skip = index * o.perPage;
                this.$items.hide().slice(skip, skip + o.perPage).show();
            }

            // render pagination message if applicable
            if (o.pageMessageContainer && o.pageMessageTemplate) {
                var itemCount = this.$items ? this.$items.length : o.count;
                $(o.pageMessageContainer).html(Mustache.render(o.pageMessageTemplate, {
                    page: page,
                    pageCount: this.pages.length,
                    firstItem: index * o.perPage + 1,
                    lastItem: Math.min(itemCount, (index + 1) * o.perPage),
                    itemCount: itemCount
                }));
            }

            // store current page
            this.currentPage = page;
        }
    });
})(jQuery);
