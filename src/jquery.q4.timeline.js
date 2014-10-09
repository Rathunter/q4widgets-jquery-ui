(function ($) {
    $.widget('q4.timeline', {
        options: {
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

            navContainer: '.timeline-nav',
            navTemplate: (
                '{{#groups}}' +
                '<li class="{{cssClass}}">' +
                    '<h3>{{heading}}</h3>' +
                    '{{{text}}}' +
                '</li>' +
                '{{/groups}}'
            ),
            navSelector: 'li',
            navCarousel: false,
            navOptions: {
                infinite: false,
                slidesToShow: 10
            },

            mainContainer: '.timeline-main',
            mainTemplate: (
                '{{#items}}' +
                '<li class="{{cssClass}}" data-group="{{group}}">' +
                    '<h3>{{heading}}</h3>' +
                    '<div class="itemtext">{{{text}}}</div>' +
                '</li>' +
                '{{/items}}'
            ),
            mainSelector: 'li',
            mainCarousel: true,
            mainOptions: {
                infinite: false,
                slidesToShow: 3
            },

            afterNavChange: null,
            afterMainChange: null,
            complete: null
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
                        if (typeof o.afterMainChange === 'function') {
                            o.afterMainChange.call(this, $main, currentItem);
                        }
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
            if (typeof o.afterNavChange === 'function') {
                o.afterNavChange.call(this, $nav, targetGroup);
            }
        },

        _create: function () {
            var o = this.options;

            $.ajaxSetup({cache: true});

            this.drawTimeline();
            this.initCarousels();

            // fire complete callbask
            if (typeof o.complete === 'function') {
                o.complete.call(this);
            }
        }
    });
})(jQuery);
