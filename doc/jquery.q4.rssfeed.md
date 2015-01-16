# q4.rssfeed

### Fetch, format and display an RSS feed.

*Source file: `q4.rssfeed.js`, line 2*  
*Author(s): marcusk@q4websystems.com *  
*Requires:*
- Moment.js
- Mustache.js


## Options
- **url** - *string*  
The URL of the RSS feed.  

- **limit** - *number*  
The maximum number of items to display, or zero for unlimited.  
*Default:* `0`  

- **dateFormat** - *string*  
A Moment.js date format string to use when rendering.  
*Default:* `"MMM D, YYYY h:mm A"`  

- **summaryLength** - *number*  
The maximum length for each item's summary, or zero for unlimited.  
*Default:* `500`  

- **template** - *string*  
A Mustache template for the widget, with these tags:
- {{title}} The title of the feed.
- {{url}}   The URL of the feed.
- {{date}}  The last updated date of the feed.
- {{items}} An array of items with these tags:
    - {{title}}     The item's title.
    - {{url}}       The item's URL.
    - {{date}}      The item's publication date.
    - {{body}}      The item's body content.
    - {{summary}}   The plaintext body content, truncated to `summaryLength`.
    - {{firstLine}} The plaintext body content, up to the first line break.  
*Example:*
```
'<header>' +
    '<h1><a href="{{url}}" target="_blank">{{title}}</a></h1>' +
    '<p>Last updated: {{date}}</p>' +
'</header>' +
'{{#items}}' +
'<article>' +
    '<header>' +
        '<h2><a href="{{url}}" target="_blank">{{{title}}}</a></h2>' +
        '<p>{{date}}</p>' +
    '</header>' +
    '{{{body}}}' +
'</article>' +
'{{/items}}'
```

- **complete** - *function*  
A callback fired after rendering is complete.  
*Parameters:*
    - **event** - *Event*  
    The triggering event.


