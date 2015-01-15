# q4.multiMap

### An interactive map with multiple datasets, that you can toggle between.

*Source file: `jquery.q4.multimap.js`, line 2*  
*Author(s): marcusk@q4websystems.com *  
*Requires:*
- jVectorMap
- Mustache.js


## Options
- **map** - *string*  
The name of the map to use from jVectorMap.
The corresponding JS file must be included.  
*Default:* `"us_lcc_en"`  

- **backgroundColour** - *string*  
The background colour of the map.  
*Default:* `"transparent"`  

- **defaultColour** - *string*  
The colour of map elements that aren't in any category.  
*Default:* `"#ffffff"`  

- **elementPrefix** - *string*  
An optional prefix to add to all element codes.  
*Default:* `"us_lcc_en"`  

- **views** - *Array&lt;Object&gt;*  
An array of views. Each view is made up of geographic elements
(e.g. countries or states), which are grouped into categories.
Each category has a colour, and an entry in that view's legend.
View objects have these properties:
- label: The name of the view.
- cssClass: An optional class to add to the trigger.
- legend: Whether to display a legend. Defaults to true.
- text: Some optional text to display.
- categories: An array of category objects with these properties:
    - label: The name of the category.
    - colour: The CSS colour to use for elements in this category.
    - elements: An array of map elements that are in this category.
    - cssClass: An optional class to add to the legend item.  
*Default:* `"us_lcc_en"`  

- **viewContainer** - *string*  
A selector for the container for view triggers.  
*Default:* `".views"`  

- **viewTrigger** - *string*  
A selector for each view trigger in the view container.  
*Default:* `"> li"`  

- **viewTemplate** - *string*  
A template for a single view trigger, corresponding to the
`viewTrigger` selector. All the properties of the view
in the `views` array are available as tags.  
*Default:* `"<li class=\"{{cssClass}}\"><span></span>{{label}}</li>"`  

- **legendContainer** - *string*  
A selector for the container for legend categories.  
*Default:* `".legend"`  

- **legendTemplate** - *string*  
A template for a single legend category, corresponding to the
`legendContainer` selector.. All the properties of the category
in the `views` array are available as tags.  
*Default:* `"<li class=\"{{cssClass}}\"><span style=\"background-color: {{colour}}\"></span>{{label}}</li>"`  

- **textContainer** - *string*  
A selector for the container for category text.  
*Default:* `".text"`  

- **mapContainer** - *string*  
A selector for the vector map.  
*Default:* `"#map"`  

- **template** - *string*  
An overall template for the widget. This should contain elements
corresponding to `viewContainer`, `legendContainer`,
`textContainer` and `mapContainer`.  
*Default:* `"us_lcc_en"`  


