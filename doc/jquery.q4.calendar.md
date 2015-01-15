# q4.calendar

### An interactive calendar with links to events.

*Source file: `jquery.q4.calendar.js`, line 2*  
*Author(s): jasonm@q4websystems.com *  
*Requires:*
- CLNDR.js
- Moment.js
- Underscore.js

Example:
```
$("#clndr").calendar({
    news: true,
    presentations: true,
    eventSize: 50,
    slideshare: "Q4WebSystems"
});
```

## Options
- **publicFeed** - *boolean*  
This allows the widget to be placed on a site not hosted by Q4.
Requires url and apiKey to be set in the configuration.  
*Default:* `false`  
*Example:*
```
$("#clndr").calendar({
    news: true,
    presentations: true,
    eventSize: 50,
    slideshare: "Q4WebSystems"
});
```

- **url** - *string*  
A URL to a Q4 hosted website.
This is only required if `publicFeed` is true.  
*Default:* `false`  
*Example:*
```
$("#clndr").calendar({
    news: true,
    presentations: true,
    eventSize: 50,
    slideshare: "Q4WebSystems"
});
```

- **apiKey** - *string*  
The API Key can be found under System Admin > Site List > Public Site
in the admin of any Q4 website.
This is only required if `publicFeed` is true.  
*Default:* `false`  
*Example:*
```
$("#clndr").calendar({
    news: true,
    presentations: true,
    eventSize: 50,
    slideshare: "Q4WebSystems"
});
```

- **news** - *boolean*  
Whether to include all related press releases.  
*Default:* `false`  
*Example:*
```
$("#clndr").calendar({
    news: true,
    presentations: true,
    eventSize: 50,
    slideshare: "Q4WebSystems"
});
```

- **presentations** - *boolean*  
Whether to include all related presentations.  
*Default:* `false`  
*Example:*
```
$("#clndr").calendar({
    news: true,
    presentations: true,
    eventSize: 50,
    slideshare: "Q4WebSystems"
});
```

- **slideshare** - *string*  
Can be set to a SlideShare username.
This will add SlideShare presentations as events.  
*Default:* `false`  
*Example:*
```
$("#clndr").calendar({
    news: true,
    presentations: true,
    eventSize: 50,
    slideshare: "Q4WebSystems"
});
```

- **onEventsLoad** - *function*  
A callback fired after events are loaded.  
*Parameters:*
    - **calendar** - *Object*  
    DOM element, can be used with methods such as .addEvents()
    - **events** - *Array*  
    An array containing all events
*Default:* `false`  
*Example:*
```
$("#clndr").calendar({
    news: true,
    presentations: true,
    eventSize: 50,
    slideshare: "Q4WebSystems"
});
```

- **onSlideShareLoad** - *function*  
A callback fired after SlideShare has loaded.  
*Parameters:*
    - **calendar** - *Object*  
    DOM element, can be used with methods such as .addEvents()
    - **events** - *Array*  
    An array containing slideshare data
*Default:* `false`  
*Example:*
```
$("#clndr").calendar({
    news: true,
    presentations: true,
    eventSize: 50,
    slideshare: "Q4WebSystems"
});
```

- **eventSize** - *number*  
The maximum number of events to add to the calendar.  
*Default:* `25`  
*Example:*
```
$("#clndr").calendar({
    news: true,
    presentations: true,
    eventSize: 50,
    slideshare: "Q4WebSystems"
});
```

- **tags** - *Array&lt;string&gt;*  
An array of tags used to filter events.  
*Default:* `false`  
*Example:*
```
$("#clndr").calendar({
    news: true,
    presentations: true,
    eventSize: 50,
    slideshare: "Q4WebSystems"
});
```

- **calendar** - *boolean*  
An options object to pass directly to the CLNDR.js instance.
See that module's documentation for details.  
*Default:* `false`  
*Example:*
```
{
    adjacentDaysChangeMonth: true,
    daysOfTheWeek: ['Su','Mo','Tu','We','Th','Fi','Sa'],
    showAdjacentMonths: false,
    weekOffset: 1,
    doneRendering: function () {
        console.log('done rendering')
    },
    ready: function () {
        console.log('calendar is ready')
    }
}
```


