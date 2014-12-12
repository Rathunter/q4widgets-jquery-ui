(function($) {
    $.widget('q4.accordion', {
        options: {
            openMultipleSections: false,
            openFirstItem: true,
            trigger: '.accordionTrigger',
            indicator: '.accordionTriggerText',
            container: '.accordionContent',
            expandText: 'EXPAND [ + ]',
            collapseText: 'CLOSE [ – ]',
            activeClass: 'active',
            sectionClass: 'accordion-item',
            template: (
                '<div class="accordionItem">' +
                    '<h3 class="accordionTrigger">' +
                        '<span class="accordionTriggerText"></span>' +
                        '{{{title}}}' +
                    '</h3>' +
                    '<div class="accordionContent">{{{content}}}</div>' +
                '</div>'
            ),
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
                $(o.indicator, $section).html(o.expandText);

                // if content is a jQuery object, add it to the section
                if ($cont) {
                    $('.accordion-placeholder', $section).replaceWith($cont);
                }
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
