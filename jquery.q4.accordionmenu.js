/**
 * @class q4.accordionMenu
 *
 * @docauthor marcusk@q4websystems.com
 *
 * requires: Mustache.js
 */
(function($) {
    $.widget('q4.accordionMenu', {
        options: {
            /**
             * @cfg
             * If false, opening one accordion section will close the others.
             */
            openMultipleSections: false,

            /**
             * @cfg
             * If false, opening one menu item will close the others at the same level.
             */
            openMultipleItems: true,

            /**
             * @cfg
             * A template for a closed accordion section's trigger.
             */
            sectionExpandTrigger: 'EXPAND [ + ]',

            /**
             * @cfg
             * A template for an open accordion section's trigger.
             */
            sectionCollapseTrigger: 'CLOSE [ – ]',

            /**
             * @cfg
             * A template for a closed menu item's trigger.
             */
            itemExpandTrigger: '[ + ]',

            /**
             * @cfg
             * A template for an open menu item's trigger.
             */
            itemCollapseTrigger: '[ – ]',

            /**
             * @cfg
             * A template for the overall accordion. Take care in modifying.
             */
            template: (
                '{{#sections}}' +
                '<div class="accordionItem">' +
                    '<h3 class="accordionTrigger">' +
                        '<span class="accordionTriggerText">{{> sectionTrigger}}</span>' +
                        '{{title}}' +
                    '</h3>' +
                    '<div class="accordionContent">' +
                        '<ul class="accordionMenu">' +
                            '{{> menuItems}}' +
                        '</ul>' +
                        '<div class="accordionBody">' +
                            '{{> bodyItems}}' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '{{/sections}}'
            ),

            /**
             * @cfg
             * A recursive template for each item in the menu.
             */
            menuItemTemplate: (
                '{{#items}}' +
                '<li>' +
                    '<span class="itemTrigger">{{> itemTrigger}}</span>' +
                    '<a class="itemLink" href="#" data-target="{{id}}">{{title}}</a>' +
                    '<ul>' +
                        '{{> menuItems}}' +
                    '</ul>' +
                '</li>' +
                '{{/items}}'
            ),

            /**
             * @cfg
             * A recursive template for each menu item's body content.
             */
            bodyItemTemplate: (
                '{{#items}}' +
                '<div data-id="{{id}}">' +
                    '<h4>{{title}}</h4>' +
                    '<div class="itemContent">{{{content}}}</div>' +
                '</div>' +
                '{{> bodyItems}}' +
                '{{/items}}'
            ),

            /**
             * @cfg
             * The content. The top level must be "sections".
             * Each section contains a "title" string, and an "items" array.
             * Each item contains a "title", an optional "content" string,
             * and an optional items array.
             * Item arrays can be nested as deeply as necessary.
             */
            content: {
                sections: [
                    {
                        title: 'Section 1',
                        items: [
                            {
                                title: 'Item 1.1',
                                content: 'This is the content for item 1.1, which should open automatically when clicking section 1.',
                                items: [
                                    {
                                        title: 'Item 1.1.1',
                                        content: 'This is the content for item 1.1.1.'
                                    }
                                ],
                            },
                            {
                                title: 'Item 1.2',
                                content: 'Some content for item 1.2, which has no sub-items.'
                            }
                        ]
                    },
                    {
                        title: 'Section 2',
                        items: [
                            {
                                title: 'Item 2.1',
                                items: [
                                    {
                                        title: 'Item 2.1.1',
                                        items: [
                                            {
                                                title: 'Item 2.1.1.1',
                                                content: 'This is item 2.1.1.1. Its parent items have no content, so this is the first thing to show up in this section.'
                                            }
                                        ]
                                    },
                                    {
                                        title: 'Item 2.1.2',
                                        content: 'Item 2.1.2',
                                        items: [
                                            {
                                                title: 'Item 2.1.2.1'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                title: 'Item 2.2',
                                content: 'This is the content for item 2.2.',
                                items: [
                                    {
                                        title: 'Item 2.2.1',
                                        content: 'Item 2.2.1'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },

        drawAccordion: function () {
            var _ = this,
                o = _.options,
                $e = this.element;

            // add a unique id to each item
            // make sure it has its own items array, otherwise the template may recurse infinitely
            var itemCount = 0;
            function formatItems(i, item) {
                item.id = itemCount;
                itemCount++;
                if (!item.hasOwnProperty('items')) {
                    item.items = [];
                }
                $.each(item.items, formatItems);
            }
            $.each(o.content.sections, function (i, section) {
                $.each(section.items, formatItems);
            });

            // render template
            $e.html(Mustache.render(o.template, o.content, {
                menuItems: o.menuItemTemplate,
                bodyItems: o.bodyItemTemplate,
                sectionTrigger: o.sectionExpandTrigger,
                itemTrigger: o.itemExpandTrigger
            }));

            // remove empty submenus and their expand links
            $('.accordionMenu ul:empty', $e).siblings('.itemTrigger').addBack().remove();

            // remove empty content sections, and unlink their menu items
            $('.itemContent:empty', $e).parent().each(function () {
                $('.itemLink[data-target="' + $(this).data('id') + '"]', $e).contents().unwrap();
                $(this).remove();
            });
        },

        setupEvents: function () {
            var _ = this,
                o = _.options,
                $e = _.element;

            _._on($('.accordionTrigger', $e), {
                click: function (e) {
                    e.preventDefault();

                    var $trigger = $(e.delegateTarget);

                    if ($trigger.parent().hasClass('active')) {
                        // close this accordion item
                        $trigger.parent().removeClass('active')
                            .find('.accordionTriggerText').text(o.sectionExpandTrigger).end()
                            .find('.accordionContent').stop(true, true).slideUp();

                    } else {
                        if (!o.openMultipleSections) {
                            // close other accordion items
                            $trigger.parent().siblings().removeClass('active')
                                .find('.accordionTriggerText').text(o.sectionExpandTrigger).end()
                                .find('.accordionContent').stop(true, true).slideUp();
                        }
                        // open this accordion item
                        $trigger.parent().addClass('active')
                            .find('.accordionTriggerText').text(o.sectionCollapseTrigger).end()
                            .find('.accordionContent').stop(true, true).slideDown();
                    }
                }
            });

            _._on($('.itemTrigger', $e), {
                click: function (e) {
                    e.preventDefault();

                    var $trigger = $(e.delegateTarget);

                    $trigger.toggleClass('expanded')
                        .html($trigger.hasClass('expanded') ? o.itemCollapseTrigger : o.itemExpandTrigger)
                        .siblings('ul').slideToggle();

                    if (!o.openMultipleItems) {
                        // close sibling menu items
                        $trigger.parent().siblings().children('.itemTrigger.expanded')
                            .removeClass('expanded').html(o.itemExpandTrigger).siblings('ul').slideUp();
                    }
                }
            });

            _._on($('.itemLink', $e), {
                click: function (e) {
                    e.preventDefault();

                    var $link = $(e.delegateTarget);

                    // disable other menu items within this accordion menu
                    $link.closest('.accordionMenu').find('.itemLink').removeClass('active');
                    $link.addClass('active');

                    // replace body content
                    $link.closest('.accordionContent').find('.accordionBody > div').hide()
                        .filter('[data-id="' + $link.data('target') + '"]').show();
                }
            });
        },

        openFirstItem: function () {
            // show the first menu item in each accordion, in the body and the menu
            this.element.find('.accordionMenu').find('.itemLink:first').click()
                .parent().parents('li').children('.itemTrigger').click();
        },

        _create: function () {
            this.drawAccordion();
            this.setupEvents();
            this.openFirstItem();
        }
    });
})(jQuery);
