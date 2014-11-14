(function ($) {
    $.widget('q4.multiMap', {
        options: {
            /* The name of the map to use from jVectorMap.
             * The corresponding JS file must be included. */
            map: 'us_lcc_en',
            /* The background colour of the map. */
            backgroundColour: 'transparent',
            /* The colour of map elements that aren't in any category. */
            defaultColour: '#ffffff',
            /* An optional prefix to add to all element codes. */
            elementPrefix: '',
            /* An array of view objects, each with these properties:
             *   label: The name of the view.
             *   cssClass: An optional class to add to the trigger.
             *   categories: An array of category objects with these properties:
             *     label: The name of the category.
             *     colour: The CSS colour to use for elements in this category.
             *     elements: An array of map elements that are in this category.
             *     cssClass: An optional class to add to the legend item.
             */
            views: [],
            /* A selector for the container for view triggers. */
            viewContainer: '.views',
            /* A selector for each view trigger in the view container. */
            viewTrigger: '> li',
            /* A template for a single view trigger. */
            viewTemplate: '<li class="{{cssClass}}"><span></span>{{label}}</li>',
            /* A selector for the container for legend categories. */
            legendContainer: '.legend',
            /* A template for a single legend category. */
            legendTemplate: '<li class="{{cssClass}}"><span style="background-color: {{colour}}"></span>{{label}}</li>',
            /* A selector for the vector map. */
            mapContainer: '#map',
            /* An overall template for the widget. */
            template: (
                '<ul class="views"></ul>' +
                '<ul class="legend"></ul>' +
                '<div id="map"></div>'
            )
        },

        _create: function () {
            this.drawMap();
        },

        drawMap: function () {
            var _ = this,
                o = this.options,
                $e = this.element;

            // draw widget and views
            $e.append(Mustache.render(o.template, {views: o.views}));
            $.each(o.views, function (i, view) {
                $(o.viewContainer, $e).append(Mustache.render(o.viewTemplate, view));
            });

            // initialize map and store the object
            $(o.mapContainer, $e).vectorMap({
                map: o.map,
                backgroundColor: o.backgroundColour,
                zoomMax: 1,
                series: {
                    regions: [{
                        attribute: 'fill'
                    }]
                }
            });
            this.map = $(o.mapContainer, $e).vectorMap('get', 'mapObject');

            this._bindEvents();

            // activate first view
            $(o.viewContainer + ' ' + o.viewTrigger, $e).first().click();
        },

        _bindEvents: function () {
            var _ = this,
                o = this.options,
                $e = this.element,
                handlers = {};

            handlers['click ' + o.viewContainer + ' ' + o.viewTrigger] = function (e) {
                var $triggers = $(o.viewContainer + ' ' + o.viewTrigger, $e),
                    $trigger = $(e.currentTarget),
                    $legend = $(o.legendContainer, $e).empty();

                // activate this view
                $triggers.removeClass('active');
                $trigger.addClass('active');

                // redraw legend
                var view = o.views[$triggers.index($trigger)];
                $.each(view.categories, function (i, cat) {
                    $legend.append(Mustache.render(o.legendTemplate, cat));
                });

                // reset all map element values
                var values = {};
                $.each(_.map.series.regions[0].elements, function (id, element) {
                    values[id] = o.defaultColour;
                });
                // read colour values for each element in thie view
                $.each(view.categories, function (i, cat) {
                    $.each(cat.elements, function (j, element) {
                        values[o.elementPrefix + element] = cat.colour;
                    });
                });
                _.map.series.regions[0].setValues(values);
            };
            this._on(handlers);
        }
    });
})(jQuery);
