# q4.calendar

### 

*Source file: `jquery.q4.calendar.js`, line 2*  
*Author: jasonm@q4websystems.com*  
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
- **publicFeed** - **  
This allows the widget to be placed on a site not hosted by Q4.
Requires url and apiKey to be set in the configuration.  
*Example:*
```
    $("#clndr").calendar({
        news: true,
        presentations: true,
        eventSize: 50,
        slideshare: "Q4WebSystems"
    });
```

- **url** - **  
A URL to a Q4 hosted website.
This is only requied if publicFeed is set to true.  
*Example:*
```
    $("#clndr").calendar({
        news: true,
        presentations: true,
        eventSize: 50,
        slideshare: "Q4WebSystems"
    });
```

- **apiKey** - **  
The API Key can be found under System Admin > Site List > Public Site
in the admin of any Q4 Website.
This is only requied if publicFeed is set to true.  
*Example:*
```
    $("#clndr").calendar({
        news: true,
        presentations: true,
        eventSize: 50,
        slideshare: "Q4WebSystems"
    });
```

- **news** - **  
Set to true to include all related Press Releases  
*Example:*
```
    $("#clndr").calendar({
        news: true,
        presentations: true,
        eventSize: 50,
        slideshare: "Q4WebSystems"
    });
```

- **presentations** - **  
Set to true to include all related presentations.  
*Example:*
```
    $("#clndr").calendar({
        news: true,
        presentations: true,
        eventSize: 50,
        slideshare: "Q4WebSystems"
    });
```

- **slideshare** - **  
Can be set to a SlideShare username.
This will add a SlideShare presentations as an event.  
*Example:*
```
    $("#clndr").calendar({
        news: true,
        presentations: true,
        eventSize: 50,
        slideshare: "Q4WebSystems"
    });
```

- **onEventsLoad** - **  
This allows the widget to be placed on a site not hosted by Q4.
Requires url and apiKey to be set in the configuration.  
*Parameters:*
    - **calendar** - *Object*  
    DOM element, can be used with methods such as .addEvents()
    - **events** - *Array*  
    An array containing all events
Callback is fired after events are loaded
*Example:*
```
    $("#clndr").calendar({
        news: true,
        presentations: true,
        eventSize: 50,
        slideshare: "Q4WebSystems"
    });
```

- **onSlideShareLoad** - **  
This allows the widget to be placed on a site not hosted by Q4.
Requires url and apiKey to be set in the configuration.  
*Parameters:*
    - **calendar** - *Object*  
    DOM element, can be used with methods such as .addEvents()
    - **events** - *Array*  
    An array containing slideshare data
Callback is fired after SlideShare has loaded
*Example:*
```
    $("#clndr").calendar({
        news: true,
        presentations: true,
        eventSize: 50,
        slideshare: "Q4WebSystems"
    });
```

- **eventSize** - **  
The number of events to add to the calendar  
*Example:*
```
    $("#clndr").calendar({
        news: true,
        presentations: true,
        eventSize: 50,
        slideshare: "Q4WebSystems"
    });
```

- **tags** - **  
Filter Events by Tag.  
*Example:*
```
    $("#clndr").calendar({
        news: true,
        presentations: true,
        eventSize: 50,
        slideshare: "Q4WebSystems"
    });
```

- **calendar** - **  
This allows the widget to be placed on a site not hosted by Q4.
Requires url and apiKey to be set in the configuration.  
*Example:*
```
    $("#clndr").calendar({
        news: true,
        presentations: true,
        eventSize: 50,
        slideshare: "Q4WebSystems"
    });
```


