(function($) {
    $.widget('q4.treemenu', {
        options: {
            openMultipleItems: false,
            menuContainer: '.menu',
            bodyContainer: '.body',
            submenu: '.submenu',
            trigger: '.itemLink',
            expandTrigger: '.itemExpand',
            expandText: '[ + ]',
            collapseText: '[ - ]',
            itemClass: 'treemenu-item',
            activeClass: 'treemenu-active',
            expandedClass: 'treemenu-expanded',
            template: (
                '<ul class="menu"></ul>' +
                '<div class="body"></div>'
            ),
            menuItemTemplate: (
                '<li>' +
                    '<span class="itemExpand"></span>' +
                    '<a class="itemLink" href="#">{{title}}</a>' +
                    '<ul class="submenu"></ul>' +
                '</li>'
            ),
            bodyItemTemplate: (
                '<div>' +
                    '<h4>{{title}}</h4>' +
                    '<div class="itemContent">{{{content}}}</div>' +
                '</div>'
            ),
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
