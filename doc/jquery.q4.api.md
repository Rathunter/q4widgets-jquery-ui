# q4.api

### Base widget for accessing Q4 private API data.

*Source file: `jquery.q4.api.js`, line 2*  
*Author(s): marcusk@q4websystems.com *  
*Requires:*
- Mustache.js


## Options
- **url** - *string*  
The base URL to use for API calls.  

- **limit** - *number*  
The maximum number of results to fetch from the server.  
*Default:* `0`  

- **skip** - *number*  
The number of results to skip. Used for pagination.  
*Default:* `0`  

- **fetchAllYears** - *boolean*  
Whether to fetch data from all years, or just the most recent.
If `showAllYears` is true, this is assumed to be true also.  
*Default:* `false`  

- **showAllYears** - *boolean*  
Whether to include an "all years" option in template data
and year selectors. If true, the widget will display
all year data by default on first load; otherwise it will
start with data from the most recent year.  
*Default:* `false`  

- **allYearsText** - *string*  
The text to use for the "all years" option.  
*Default:* `"All"`  

- **startYear** - *number*  
The year to display first. Default is to display all years if
that option is enabled, otherwise the most recent year.
A useful value to pass is `(new Date()).getFullYear()`.  

- **showFuture** - *boolean*  
Whether to fetch items dated in the future.  
*Default:* `true`  

- **showPast** - *boolean*  
Whether to fetch items dated in the past.  
*Default:* `true`  

- **tags** - *Array&lt;string&gt;*  
A list of tags to filter by.  

- **titleLength** - *number*  
The maximum length of an item's title. Zero for no limit.  
*Default:* `0`  

- **dateFormat** - *string*  
A datepicker format string, which can be used in the template
as `{{date}}`. Can alternately be an object of format strings,
which can be accessed with `{{date.key}}` (where key is the
object key corresponding to the string you want to use).  
*Default:* `"mm/dd/yy"`  

- **years** - *Array&lt;number&gt;*  
An array of years to filter by. If passed, no items will
be displayed unless they are dated to a year in this list.  

- **maxYear** - *number*  
The latest year to display items from.  

- **minYear** - *number*  
The earliest year to display items from.  

- **defaultThumb** - *string*  
A URL to a default thumbnail, in case an item has none.  

- **append** - *boolean*  
Whether to append the widget to the container, or replace its
contents entirely.  
*Default:* `true`  

- **template** - *string*  
A Mustache.js template for the overall widget.  
*Example:*
```
'<ul class="years">' +
    '{{#years}}<li>{{year}}</li>{{/years}}' +
'</ul>' +
'<h1>{{title}}</h1>' +
'<ul class="items">' +
    '{{#items}}<li><a target="_blank" href="{{url}}">{{title}}</a></li>{{/items}}' +
    '{{^items}}No items found.{{/items}}' +
'</ul>'
```

- **loadingMessage** - *string&#x2F;boolean*  
A message or HTML string to display while loading the widget.
Set to `false` to disable this feature.  
*Default:* `"Loading..."`  

- **yearTrigger** - *string*  
An optional selector for year trigger links in the main template.
If passed, click events will be bound here.  

- **yearSelect** - *string*  
An optional selector for a year selectbox in the main template.
If passed, change events will be bound here.  

- **activeClass** - *string*  
The CSS class to use for a selected year trigger.  
*Default:* `"active"`  

- **itemContainer** - *string*  
An optional selector for the items container. You must also 
pass `itemTemplate` for this to have any effect.  

- **itemTemplate** - *string*  
An optional template for the items container. If `itemContainer`
is also passed, this will be used to render the items list.
Also, when the year is changed, only the items list will be
rerendered, instead of the entire widget.  

- **itemLoadingMessage** - *string*  
A message or HTML string to display while loading items.
By default it is the same as `loadingMessage`.
Set to `false` to disable this feature.  

- **itemNotFoundMessage** - *string*  
A message or HTML string to display in the items container
if no items are found.  
*Default:* `"No items found."`  

- **onYearChange** - *function*  
A callback that fires when a year trigger or selectbox changes.  
*Parameters:*
    - **event** - *Event*  
    The triggering event object.

- **beforeRender** - *function*  
A callback that fires before the full widget is rendered.  
*Parameters:*
    - **event** - *Event*  
    The event object.
    - **templateData** - *Object*  
    The complete template data.

- **beforeRenderItems** - *function*  
A callback that fires before the items are rendered.  
*Parameters:*
    - **event** - *Event*  
    The event object.
    - **templateData** - *Object*  
    Template data for the items list.

- **itemsComplete** - *function*  
A callback that fires after the item list is rendered.  
*Parameters:*
    - **event** - *Event*  
    The event object.

- **complete** - *function*  
A callback that fires after the entire widget is rendered.  
*Parameters:*
    - **event** - *Event*  
    The event object.


