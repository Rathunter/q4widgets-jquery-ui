(function ($) {
    /**
     * A carousel of events on a timeline, with groups and navigation.
     * @class q4.timeline
     * @version 1.0.0
     * @author marcusk@q4websystems.com
     * @requires Mustache.js
     * @requires slick
     */
    $.widget('q4.timeline', /** @lends q4.timeline */ {
        options: {
            /**
             * An array of event groups. Each group has these properties:
             * - `heading` The heading for the category.
             * - `text`    Text to display for the category.
             * - `items`   An array of items with these properties:
             *     - `heading`  The heading for the event.
             *     - `cssClass` An optional CSS class to use in the template.
             *     - `text`     Text to display for the event.
             * @type {Object}
             */
            content: [
                {
                    heading: '1980s',
                    text: 'Many things happened in the 1980s.',
                    items: [
                        {
                            heading: 1981,
                            cssClass: 'green',
                            text: 'This is the first thing.'
                        },
                        {
                            heading: 1985,
                            cssClass: 'blue',
                            text: 'This is the second thing.'
                        }
                    ]
                },
                {
                    heading: '2000s',
                    cssClass: 'red',
                    items: [
                        {
                            heading: 'January 1, 2000',
                            text: 'In the year 2000, everything changed.'
                        }
                    ]
                }
            ],
            /**
             * Whether to render a navigation carousel.
             * This is generally used to display the groups.
             * @type {boolean}
             * @default
             */
            navCarousel: false,
            /**
             * A selector for the navigation carousel.
             * @type {string}
             * @default
             */
            navContainer: '.timeline-nav',
            /**
             * A Mustache template to use for the navigation carousel.
             * All properties from `content` are available as tags.
             * @type {string}
             */
            navTemplate: (
                '{{#groups}}' +
                '<li class="{{cssClass}}">' +
                    '<h3>{{heading}}</h3>' +
                    '{{{text}}}' +
                '</li>' +
                '{{/groups}}'
            ),
            /**
             * A selector for each group's slide in the navigation carousel.
             * When clicked, this will move the main carousel to that group.
             * @type {string}
             * @default
             */
            navSelector: 'li',
            /**
             * Options to pass directly to the nav carousel's Slick object.
             * See Slick's documentation for details.
             * @type {Object}
             */
            navOptions: {
                infinite: false,
                slidesToShow: 10
            },
            /**
             * Whether to render a main carousel.
             * This is generally used to display the individual timeline items.
             * @type {boolean}
             * @default
             */
            mainCarousel: true,
            /**
             * A selector for the main carousel.
             * @type {string}
             * @default
             */
            mainContainer: '.timeline-main',
            /**
             * A Mustache template to use for the main carousel.
             * All properties from `content` are available as tags.
             * Items also have a {{group}} tag with the index # of their
             * containing group.
             * @type {string}
             */
            mainTemplate: (
                '{{#items}}' +
                '<li class="{{cssClass}}" data-group="{{group}}">' +
                    '<h3>{{heading}}</h3>' +
                    '<div class="itemtext">{{{text}}}</div>' +
                '</li>' +
                '{{/items}}'
            ),
            /**
             * A selector for each item's slide in the main carousel.
             * When clicked, this will move the nav carousel to this item's group.
             * @type {string}
             * @default
             */
            mainSelector: 'li',
            /**
             * Options to pass directly to the main carousel's Slick object.
             * See Slick's documentation for details.
             * @type {Object}
             */
            mainOptions: {
                infinite: false,
                slidesToShow: 3
            },
            /**
             * A callback fired after a change in the nav carousel.
             * @type {function}
             * @param {Event}  [event] The triggering event.
             * @param {Object} [data]  A data object with these properties:
             * - `element` The nav carousel's jQuery element.
             * - `target`  The index of the target group.
             */
            afterNavChange: function (e, data) {},
            /**
             * A callback fired after a change in the main carousel.
             * @type {function}
             * @param {Event} [event] The triggering event.
             * @param {Object} [data]  A data object with these properties:
             * - `element` The main carousel's jQuery element.
             * - `target`  The index of the target timeline item.
             */
            afterMainChange: function (e, data) {},
            /**
             * A callback fired after rendering is complete.
             * @type {function}
             * @param {Event} [event] The triggering event.
             */
            complete: function (e) {}
        },

        drawTimeline: function () {
            var o = this.options,
                groups = [],
                items = [],
                $nav = $(o.navContainer, this.element),
                $main = $(o.mainContainer, this.element);

            // assign a group id
            $.each(o.content, function (i, group) {
                groups.push(group);
                $.each(group.items, function (ii, item) {
                    item.group = i;
                    items.push(item);
                });
            });

            // render mustache.js templates
            $nav.html(Mustache.render(o.navTemplate, {groups: groups}));
            $main.html(Mustache.render(o.mainTemplate, {items: items}));
        },

        initCarousels: function () {
            var _ = this,
                o = _.options,
                $nav = $(o.navContainer, _.element),
                $main = $(o.mainContainer, _.element),
                $groups = $(o.navSelector, $nav),
                $items = $(o.mainSelector, $main);

            if (o.navCarousel) {
                // initialize nav carousel
                var navDefaults = {
                    slide: o.navSelector
                };
                $nav.slick($.extend({}, navDefaults, o.navOptions));
            }

            if (o.mainCarousel) {
                // initialize main carousel
                var mainDefaults = {
                    slide: o.mainSelector,
                    onAfterChange: function (slick, currentItem) {
                        var currentGroup = $groups.index($groups.filter('.active')),
                            targetGroup = $items.eq(currentItem).data('group');

                        if (currentGroup != targetGroup) {
                            _.setActiveGroup(targetGroup);
                        }

                        // fire main callback
                        _._trigger('afterMainChange', null, {
                            element: $main,
                            target: currentItem
                        });
                    }
                };
                $main.slick($.extend({}, mainDefaults, o.mainOptions));

                // init navbar
                $groups.click(function () {
                    if ($(this).hasClass('active')) return;

                    _.setActiveGroup($groups.index($(this)));

                    var targetSlide = $items.filter('[data-group=' + $groups.index($(this)) + ']').first().index(),
                        lastSlide = $items.length - $main.slickGetOption('slidesToShow');
                    $main.slickGoTo(Math.min(targetSlide, lastSlide));
                });
            }

            _.setActiveGroup(0);
        },

        setActiveGroup: function (targetGroup) {
            var o = this.options,
                $nav = $(o.navContainer, this.element),
                $groups = $(o.navSelector, $nav).removeClass('active'),
                $targetGroup = $groups.eq(targetGroup).addClass('active');

            if (o.navCarousel) {
                // if the new group is not currently visible,
                // scroll the nav either left or right
                if (targetGroup < $('.slick-active', $nav).first().index()) {
                    $nav.slickGoTo(targetGroup);
                } else if (targetGroup > $('.slick-active', $nav).last().index()) {
                    $nav.slickGoTo(targetGroup - $nav.slickGetOption('slidesToShow') + 1);
                }
            }

            // fire nav callback
            this._trigger('afterNavChange', null, {
                element: $nav,
                target: targetGroup
            });
        },

        _create: function () {
            var o = this.options;

            $.ajaxSetup({cache: true});

            this.drawTimeline();
            this.initCarousels();

            // fire complete callbask
            this._trigger('complete');
        }
    });
})(jQuery);
