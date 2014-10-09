(function ($) {
    $.widget('q4.pager', {
        options: {
            /* The number of items to page through. */
            count: 95,
            /* The number of items per page. */
            perPage: 1,
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
            template: '<span>{{label}}</span>',
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

        changePage: function (page) {
            var $e = this.element,
                o = this.options;

            if (typeof o.beforeChange == 'function') o.beforeChange(this, page);

            var pages = Math.ceil(o.count / o.perPage);
            if (page < 1 || page > pages) return;

            $('.pager-first, .pager-prev', $e).toggleClass('pager-disabled', page == 1);
            $('.pager-last, .pager-next', $e).toggleClass('pager-disabled', page == pages);
            $('.pager-prev', $e).data('page', page > 1 ? page - 1 : '');
            $('.pager-next', $e).data('page', page < pages ? page + 1 : '');

            $('.pager-page', $e).removeClass('pager-active').filter(function () {
                return $(this).data('page') == page;
            }).addClass('pager-active');

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
                pages = Math.ceil(o.count / o.perPage ? o.perPage : 1);

            if (o.startPage < 1) o.startPage = 1;
            if (o.startPage > pages) o.startPage = pages;
            
            if (o.showFirstLast) $(Mustache.render(o.template, {label: o.labels.first})).addClass('pager-first').data('page', 1).appendTo($e);
            if (o.showPrevNext) $(Mustache.render(o.template, {label: o.labels.prev})).addClass('pager-prev pager-disabled').appendTo($e);
            for (var i = 1; i <= pages; i++) {
                $(Mustache.render(o.template, {label: i})).addClass('pager-page').data('page', i).appendTo($e);
            }
            if (o.showPrevNext) $(Mustache.render(o.template, {label: o.labels.next})).addClass('pager-next pager-disabled').appendTo($e);
            if (o.showFirstLast) $(Mustache.render(o.template, {label: o.labels.last})).addClass('pager-last').data('page', pages).appendTo($e);

            if (pages == 1) $('.pager-page', $e).addClass('pager-disabled');

            if (o.startPage) this.changePage(o.startPage);
        },

        _init: function () {
            this._drawPager();
        },

        _create: function () {
            this._bindEvents();
        }
    });
})(jQuery);
