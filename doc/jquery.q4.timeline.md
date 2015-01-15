# q4.timeline

### A carousel of events on a timeline, with groups and navigation.

*Source file: `jquery.q4.timeline.js`, line 2*  
*Author(s): marcusk@q4websystems.com *  
*Requires:*
- Mustache.js
- slick


## Options
- **content** - *Object*  
An array of event groups. Each group has these properties:
- `heading` The heading for the category.
- `text`    Text to display for the category.
- `items`   An array of items with these properties:
    - `heading`  The heading for the event.
    - `cssClass` An optional CSS class to use in the template.
    - `text`     Text to display for the event.  

- **navCarousel** - *boolean*  
Whether to render a navigation carousel.
This is generally used to display the groups.  
*Default:* `false`  

- **navContainer** - *string*  
A selector for the navigation carousel.  
*Default:* `".timeline-nav"`  

- **navTemplate** - *string*  
A Mustache template to use for the navigation carousel.
All properties from `content` are available as tags.  

- **navSelector** - *string*  
A selector for each group's slide in the navigation carousel.
When clicked, this will move the main carousel to that group.  
*Default:* `"li"`  

- **navOptions** - *Object*  
Options to pass directly to the nav carousel's Slick object.
See Slick's documentation for details.  

- **mainCarousel** - *boolean*  
Whether to render a main carousel.
This is generally used to display the individual timeline items.  
*Default:* `true`  

- **mainContainer** - *string*  
A selector for the main carousel.  
*Default:* `".timeline-main"`  

- **mainTemplate** - *string*  
A Mustache template to use for the main carousel.
All properties from `content` are available as tags.
Items also have a {{group}} tag with the index # of their
containing group.  

- **mainSelector** - *string*  
A selector for each item's slide in the main carousel.
When clicked, this will move the nav carousel to this item's group.  
*Default:* `"li"`  

- **mainOptions** - *Object*  
Options to pass directly to the main carousel's Slick object.
See Slick's documentation for details.  

- **afterNavChange** - *function*  
A callback fired after a change in the nav carousel.  
*Parameters:*
    - **event** - *Event*  
    The triggering event.
    - **data** - *Object*  
    A data object with these properties:
- `element` The nav carousel's jQuery element.
- `target`  The index of the target group.

- **afterMainChange** - *function*  
A callback fired after a change in the main carousel.  
*Parameters:*
    - **event** - *Event*  
    The triggering event.
    - **data** - *Object*  
    A data object with these properties:
- `element` The main carousel's jQuery element.
- `target`  The index of the target timeline item.

- **complete** - *function*  
A callback fired after rendering is complete.  
*Parameters:*
    - **event** - *Event*  
    The triggering event.


