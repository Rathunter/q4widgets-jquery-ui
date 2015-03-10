# q4.mashfeed

### Grab a number of content feeds and mix them together into a single
chronological list.

*Source file: `q4.mashfeed.js`, line 2*  
*Author(s): marcusk@q4websystems.com *  
*Requires:*
- Moment.js
- Mustache.js


## Options
- **limit** - *number*  
The global maximum number of items, or zero for unlimited.  
*Default:* `0`  

- **dateFormat** - *string*  
A Moment.js format for dates.  
*Default:* `"MMM D, YYYY h:mm A"`  

- **fromNow** - *boolean*  
Whether to display dates using Moment's fromNow function.  
*Default:* `false`  

- **titleLength** - *number*  
The maximum character length of a title, or zero for unlimited.  
*Default:* `80`  

- **summaryLength** - *number*  
The maximum character length of a summary, or zero for unlimited.  
*Default:* `500`  

- **feeds** - *Array&lt;Object&gt;*  
An array of feeds to fetch. Each feed is an object of options
for that feed. Some feed options override global options.
Valid options for all feed types are:
- name: The name of the feed.
- type: The type, as listed in `feedTypes` (e.g. `rss`, `youtube`).
- template: A Mustache template for a single feed item
    (overrides the default template).
- limit: The maximum number of items from this feed.
- titleLength: The maximum character length of a title.
- summaryLength: The maximum character length of a summary.
- fetch: A function overriding the feed type's `fetch` method.
- getItems: A function overriding the feed type's `getItems` method.
- parseItem: A function overriding the feed type's `parseItem` method.

See `feedTypes` for type-specific options.  
*Default:* `0`  

- **filter** - *Array&lt;string&gt;*  
A list of feed names. If this list is not empty,
only the feeds named in the list will be parsed.  
*Default:* `0`  

- **template** - *string*  
A default Mustache template for a single feed item.
Can be overridden for individual feed types.  
*Default:* `0`  
*Example:*
```
'<li>' + 
    '<h2><a href="{{url}}">{{title}}</a></h2>' + 
    '<p>{{date}}</p>' + 
    '{{summary}}' +
'</li>'
```

- **complete** - *function*  
A callback that fires after rendering is finished.  
*Parameters:*
    - **event** - *Object*  
    The event object.
*Default:* `0`  


## Methods
- **updateFilter**  
Update the `filter` option.  
*Parameters:*
    - **filter** - *Array&lt;string&gt;*  
    An array of feed names to display,
  or an empty array to display all feeds.
