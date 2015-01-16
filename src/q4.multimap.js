(function ($) {
    /**
     * An interactive map with multiple datasets, that you can toggle between.
     * @class q4.multiMap
     * @version 1.0.0
     * @author marcusk@q4websystems.com
     * @requires jVectorMap
     * @requires Mustache.js
     */
    $.widget('q4.multiMap', /** @lends q4.multiMap */ {
        options: {
            /**
             * The name of the map to use from jVectorMap.
             * The corresponding JS file must be included.
             * @type {string}
             * @default
             */
            map: 'us_lcc_en',
            /**
             * The background colour of the map.
             * @type {string}
             * @default
             */
            backgroundColour: 'transparent',
            /**
             * The colour of map elements that aren't in any category.
             * @type {string}
             * @default
             */
            defaultColour: '#ffffff',
            /**
             * An optional prefix to add to all element codes.
             * @type {string}
             */
            elementPrefix: '',
            /**
             * An array of views. Each view is made up of geographic elements
             * (e.g. countries or states), which are grouped into categories.
             * Each category has a colour, and an entry in that view's legend.
             * View objects have these properties:
             * - label: The name of the view.
             * - cssClass: An optional class to add to the trigger.
             * - legend: Whether to display a legend. Defaults to true.
             * - text: Some optional text to display.
             * - categories: An array of category objects with these properties:
             *     - label: The name of the category.
             *     - colour: The CSS colour to use for elements in this category.
             *     - elements: An array of map elements that are in this category.
             *     - cssClass: An optional class to add to the legend item.
             * @type {Array<Object>}
             */
            views: [],
            /**
             * A selector for the container for view triggers.
             * @type {string}
             * @default
             */
            viewContainer: '.views',
            /**
             * A selector for each view trigger in the view container.
             * @type {string}
             * @default
             */
            viewTrigger: '> li',
            /**
             * A template for a single view trigger, corresponding to the
             * `viewTrigger` selector. All the properties of the view
             * in the `views` array are available as tags.
             * @type {string}
             * @default
             */
            viewTemplate: '<li class="{{cssClass}}"><span></span>{{label}}</li>',
            /**
             * A selector for the container for legend categories.
             * @type {string}
             * @default
             */
            legendContainer: '.legend',
            /**
             * A template for a single legend category, corresponding to the
             * `legendContainer` selector.. All the properties of the category
             * in the `views` array are available as tags.
             * @type {string}
             * @default
             */
            legendTemplate: '<li class="{{cssClass}}"><span style="background-color: {{colour}}"></span>{{label}}</li>',
            /**
             * A selector for the container for category text.
             * @type {string}
             * @default
             */
            textContainer: '.text',
            /**
             * A selector for the vector map.
             * @type {string}
             * @default
             */
            mapContainer: '#map',
            /**
             * An overall template for the widget. This should contain elements
             * corresponding to `viewContainer`, `legendContainer`,
             * `textContainer` and `mapContainer`.
             * @type {string}
             */
            template: (
                '<ul class="views"></ul>' +
                '<ul class="legend"></ul>' +
                '<div class="text"></div>' +
                '<div id="map"></div>'
            )
        },

        _init: function () {
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
                    $legend = $(o.legendContainer, $e).empty(),
                    $text = $(o.textContainer, $e);

                // activate this view
                $triggers.removeClass('active');
                $trigger.addClass('active');

                // redraw legend and text
                var view = o.views[$triggers.index($trigger)];
                if (view.legend || !('legend' in view)) {
                    $.each(view.categories, function (i, cat) {
                        $legend.append(Mustache.render(o.legendTemplate, cat));
                    });
                }
                $text.html(view.text || '');

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
