(function ($) {
    /**
     * An expanding tree-style table of contents for a set of content.
     * @class q4.treemenu
     * @version 1.0.1
     * @author marcusk@q4websystems.com
     * @requires Mustache.js
     */
    $.widget('q4.treemenu', /** @lends q4.treemenu */ {
        options: {
            /**
             * Whether opening a menu item will close its sibling items.
             * @type {boolean}
             * @default
             */
            openMultipleItems: false,
            /**
             * A selector in the main template for the menu.
             * @type {string}
             * @default
             */
            menuContainer: '.menu',
            /**
             * A selector in the main template the body content.
             * @type {string}
             * @default
             */
            bodyContainer: '.body',
            /**
             * A selector in the menu item template for child menu items.
             * @type {string}
             * @default
             */
            submenu: '.submenu',
            /**
             * A selector in the menu item template to display the content.
             * @type {string}
             * @default
             */
            trigger: '.itemLink',
            /**
             * A selector in the menu item template to toggle child items.
             * @type {string}
             * @default
             */
            expandTrigger: '.itemExpand',
            /**
             * The text to display in a collapsed menu item's trigger.
             * @type {string}
             * @default
             */
            expandText: '[ + ]',
            /**
             * The text to display in an expanded menu item's trigger.
             * @type {string}
             * @default
             */
            collapseText: '[ - ]',
            /**
             * A class to add to each menu item.
             * @type {string}
             * @default
             */
            itemClass: 'treemenu-item',
            /**
             * A class to add to each menu item.
             * @type {string}
             * @default
             */
            activeClass: 'treemenu-active',
            /**
             * A class to add to an expanded menu item.
             * @type {string}
             * @default
             */
            expandedClass: 'treemenu-expanded',
            /**
             * A Mustache template for the overall widget.
             * @type {string}
             * @example
             * '<ul class="menu"></ul>' +
             * '<div class="body"></div>'
             */
            template: '',
            /**
             * A recursive Mustache template for each menu item.
             * @type {string}
             * @example
             * '<li>' +
             *     '<span class="itemExpand"></span>' +
             *     '<a class="itemLink" href="#">{{title}}</a>' +
             *     '<ul class="submenu"></ul>' +
             * '</li>'
             */
            menuItemTemplate: '',
            /**
             * A Mustache template for each item's body content.
             * @type {string}
             * @example
             * '<div>' +
             *     '<h4>{{title}}</h4>' +
             *     '<div class="itemContent">{{{content}}}</div>' +
             * '</div>'
             */
            bodyItemTemplate: '',
            /**
             * A nested array of menu item objects, each with these properties:
             *
             * - `title`   The title to display in the menu.
             * - `content` The body content to display when an item is clicked.
             * - `items`   An optional array of child menu items.
             * @example
             * [
             *     {
             *         title: 'Item 1',
             *         content: 'Item 1 content',
             *         items: [
             *             {
             *                 title: 'Item 1.1',
             *                 content: 'Item 1.1 content'
             *             }
             *         ]
             *     }
             * ]
             */
            content: []
        },

        _create: function () {
            this._drawMenu();
            this._bindEvents();
        },

        _drawMenu: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            function toggleMenuItem($item, expanded) {
                if (typeof expanded == 'undefined') {
                    expanded = !$item.hasClass(o.expandClass);
                }

                $item.toggleClass(o.expandClass, expanded);
                $(o.expandTrigger, $item).html()
            }

            $e.append(o.template);

            $.each(o.content, function (i, item) {
                $(o.menuContainer, $e).append(_._renderItem(item));
            });
        },

        _renderItem: function (item) {
            var _ = this,
                o = this.options;

            var $item = $(Mustache.render(o.menuItemTemplate, item)).addClass(o.itemClass),
                $submenu = $(o.submenu, $item).hide(),
                $expand = $(o.expandTrigger, $item).hide();

            $item.data('tplData', {
                title: item.title,
                content: item.content
            });

            if ($.isArray(item.items) && item.items.length) {
                // render child items and append them to the submenu
                $.each(item.items, function (i, subitem) {
                    $submenu.append(_._renderItem(subitem));
                });

                // show expand trigger
                $expand.show().html(o.expandText);
            }

            return $item;
        },

        _bindEvents: function () {
            var o = this.options,
                $e = this.element;

            this._on($(o.trigger, $e), {
                click: function (e) {
                    e.preventDefault();
                    var $item = $(e.target).closest('.' + o.itemClass);

                    // add active class to menu item
                    $('.' + o.itemClass, $e).removeClass(o.activeClass);
                    $item.addClass(o.activeClass);

                    // show content in body container
                    $(o.bodyContainer, $e).html(Mustache.render(o.bodyItemTemplate, $item.data('tplData')));
                }
            });

            this._on($(o.expandTrigger, $e), {
                click: function (e) {
                    e.preventDefault();
                    var $item = $(e.target).closest('.' + o.itemClass);

                    // toggle expanded class on menu item
                    $item.toggleClass(o.expandedClass);
                    var expanded = $item.hasClass(o.expandedClass);

                    // set text of expand/collapse trigger
                    $(e.target).html(expanded ? o.collapseText : o.expandText);

                    function getSubmenu($item) {
                        return $(o.submenu, $item).filter(function () {
                            return $(this).closest('.' + o.itemClass).is($item);
                        });
                    }

                    // expand/collapse submenu
                    getSubmenu($item).slideToggle(expanded);

                    if (!o.openMultipleItems && expanded) {
                        // collapse submenus of sibling menu items
                        $item.siblings().each(function () {
                            getSubmenu($(this)).slideUp();
                        });
                    }
                }
            });
        }
    });
})(jQuery);
