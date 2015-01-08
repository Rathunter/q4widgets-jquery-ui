(function($) {
    $.widget('q4.treemenu', {
        options: {
            /* Whether opening a menu item will close its sibling items. */
            openMultipleItems: false,
            /* A selector in the main template for the menu. */
            menuContainer: '.menu',
            /* A selector in the main template the body content. */
            bodyContainer: '.body',
            /* A selector in the menu item template for child menu items. */
            submenu: '.submenu',
            /* A selector in the menu item template to display the content. */
            trigger: '.itemLink',
            /* A selector in the menu item template to toggle child items. */
            expandTrigger: '.itemExpand',
            /* The text to display in a collapsed menu item's trigger. */
            expandText: '[ + ]',
            /* The text to display in an expanded menu item's trigger. */
            collapseText: '[ - ]',
            /* A class to add to each menu item. */
            itemClass: 'treemenu-item',
            /* A class to add to each menu item. */
            activeClass: 'treemenu-active',
            /* A class to add to an expanded menu item. */
            expandedClass: 'treemenu-expanded',
            /* A Mustache template for the overall widget. */
            template: (
                '<ul class="menu"></ul>' +
                '<div class="body"></div>'
            ),
            /* A recursive Mustache template for each menu item. */
            menuItemTemplate: (
                '<li>' +
                    '<span class="itemExpand"></span>' +
                    '<a class="itemLink" href="#">{{title}}</a>' +
                    '<ul class="submenu"></ul>' +
                '</li>'
            ),
            /* A Mustache template for each item's body content. */
            bodyItemTemplate: (
                '<div>' +
                    '<h4>{{title}}</h4>' +
                    '<div class="itemContent">{{{content}}}</div>' +
                '</div>'
            ),
            /* A nested array of menu item objects, each with these properties:
             *   title: The title to display in the menu.
             *   content: The body content to display when an item is clicked.
             *   items: An optional array of child menu items.
             */
            content: [
                {
                    title: 'Item 1',
                    content: 'Item 1 content',
                    items: [
                        {
                            title: 'Item 1.1',
                            content: 'Item 1.1 content'
                        }
                    ]
                }
            ]
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
