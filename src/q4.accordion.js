(function($) {
    /**
     * Creates an expanding and collapsing accordion from sections of content.
     * @class q4.accordion
     * @version 1.0.1
     * @requires [Mustache.js](lib/mustache.min.js)
     */
    $.widget('q4.accordion', /** @lends q4.accordion */ {
        options: {
            /**
             * Whether opening an accordion section will close the others.
             * @type {boolean}
             * @default
             */
            openMultipleSections: false,
            /**
             * Whether the first accordion item should be open at init.
             * @type {boolean}
             * @default
             */
            openFirstItem: true,
            /**
             * A selector for the trigger to open/close a section.
             * @type {string}
             * @default
             */
            trigger: '.accordionTrigger',
            /**
             * A selector for the expand/collapse message.
             * @type {string}
             * @default
             */
            indicator: '.accordionTriggerText',
            /**
             * A selector for the container to show/hide.
             * @type {string}
             * @default
             */
            container: '.accordionContent',
            /**
             * The indicator text for a closed section.
             * @type {string}
             * @default
             */
            expandText: 'EXPAND [ + ]',
            /**
             * The indicator text for an open section.
             * @type {string}
             * @default
             */
            collapseText: 'CLOSE [ – ]',
            /**
             * A class to add to an open section.
             * @type {string}
             * @default
             */
            activeClass: 'active',
            /**
             * A class to add to each section.
             * @type {string}
             * @default
             */
            sectionClass: 'accordion-item',
            /**
             * A Mustache template for each section.
             * @type {string}
             * @example
             * '<div class="accordionItem">' +
             *     '<h3 class="accordionTrigger">' +
             *         '<span class="accordionTriggerText"></span>' +
             *         '{{{title}}}' +
             *     '</h3>' +
             *     '<div class="accordionContent">{{{content}}}</div>' +
             * '</div>'
             */
            template: '',
            /**
             * A list of objects representing sections.
             * @type {Array<Object>}
             * @prop {string}  title   The title to display in the header.
             * @prop {string}  content The content to display in the body.
             * @prop {boolean} open    Whether to show or hide the section initially.
             */
            content: [
                {
                    title: 'Title 1',
                    content: 'Content 1',
                    open: false
                }
            ]
        },

        _create: function () {
            this._drawAccordion();
            this._bindEvents();
        },

        _drawAccordion: function () {
            var o = this.options,
                $e = this.element;

            $.each(o.content, function (i, section) {
                // if content is a jQuery object, store it
                var $cont = null;
                if (section.content instanceof jQuery) {
                    $cont = section.content;
                    section.content = '<div class="accordion-placeholder"></div>';
                }

                // render section
                var $section = $(Mustache.render(o.template, section)).addClass(o.sectionClass).appendTo($e);

                // if content is a jQuery object, add it to the section
                if ($cont) {
                    $('.accordion-placeholder', $section).replaceWith($cont);
                }

                // show/hide section container
                var open = (i == 0 && o.openFirstItem) || section.open;
                $(o.container, $section).toggle(open);
                $(o.indicator, $section).html(open ? o.collapseText : o.expandText);
            });
        },

        _bindEvents: function () {
            var o = this.options,
                $e = this.element;

            this._on($(o.trigger, $e), {
                click: function (e) {
                    e.preventDefault();

                    var $trigger = $(e.currentTarget),
                        $section = $trigger.closest('.' + o.sectionClass);

                    if ($section.hasClass(o.activeClass)) {
                        // close this accordion item
                        $section.removeClass(o.activeClass)
                            .find(o.indicator).html(o.expandText).end()
                            .find(o.container).stop(true, true).slideUp();

                    } else {
                        if (!o.openMultipleSections) {
                            // close other accordion items
                            $('.' + o.sectionClass, $e).not($section).removeClass(o.activeClass)
                                .find(o.indicator).html(o.expandText).end()
                                .find(o.container).stop(true, true).slideUp();
                        }
                        // open this accordion item
                        $section.addClass(o.activeClass)
                            .find(o.indicator).html(o.collapseText).end()
                            .find(o.container).stop(true, true).slideDown();
                    }
                }
            });
        }
    });
})(jQuery);
