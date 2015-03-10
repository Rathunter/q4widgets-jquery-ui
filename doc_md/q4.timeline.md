# q4.timeline

### A carousel of events on a timeline, with groups and navigation.

*Source file: `q4.timeline.js`, line 2*  
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
*Example:*
```
[
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
]
```

- **navCarousel** - *boolean*  
Whether to render a navigation carousel.
This is generally used to display the groups.  
*Default:* `false`  
*Example:*
```
[
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
]
```

- **navContainer** - *string*  
A selector for the navigation carousel.  
*Default:* `".timeline-nav"`  
*Example:*
```
[
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
]
```

- **navTemplate** - *string*  
A Mustache template to use for the navigation carousel.
All properties from `content` are available as tags.  
*Example:*
```
'{{#groups}}' +
'<li class="{{cssClass}}">' +
    '<h3>{{heading}}</h3>' +
    '{{{text}}}' +
'</li>' +
'{{/groups}}'
```

- **navSelector** - *string*  
A selector for each group's slide in the navigation carousel.
When clicked, this will move the main carousel to that group.  
*Default:* `"li"`  
*Example:*
```
[
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
]
```

- **navOptions** - *Object*  
Options to pass directly to the nav carousel's Slick object.
See Slick's documentation for details.  
*Example:*
```
[
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
]
```

- **mainCarousel** - *boolean*  
Whether to render a main carousel.
This is generally used to display the individual timeline items.  
*Default:* `true`  
*Example:*
```
[
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
]
```

- **mainContainer** - *string*  
A selector for the main carousel.  
*Default:* `".timeline-main"`  
*Example:*
```
[
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
]
```

- **mainTemplate** - *string*  
A Mustache template to use for the main carousel.
All properties from `content` are available as tags.
Items also have a {{group}} tag with the index # of their
containing group.  
*Example:*
```
'{{#items}}' +
'<li class="{{cssClass}}" data-group="{{group}}">' +
    '<h3>{{heading}}</h3>' +
    '<div class="itemtext">{{{text}}}</div>' +
'</li>' +
'{{/items}}'
```

- **mainSelector** - *string*  
A selector for each item's slide in the main carousel.
When clicked, this will move the nav carousel to this item's group.  
*Default:* `"li"`  
*Example:*
```
[
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
]
```

- **mainOptions** - *Object*  
Options to pass directly to the main carousel's Slick object.
See Slick's documentation for details.  
*Example:*
```
[
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
]
```

- **afterNavChange** - *function*  
A callback fired after a change in the nav carousel.  
*Parameters:*
    - **event** - *Event*  
    The triggering event.
    - **data** - *Object*  
    A data object with these properties:
- `element` The nav carousel's jQuery element.
- `target`  The index of the target group.
*Example:*
```
[
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
]
```

- **afterMainChange** - *function*  
A callback fired after a change in the main carousel.  
*Parameters:*
    - **event** - *Event*  
    The triggering event.
    - **data** - *Object*  
    A data object with these properties:
- `element` The main carousel's jQuery element.
- `target`  The index of the target timeline item.
*Example:*
```
[
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
]
```

- **complete** - *function*  
A callback fired after rendering is complete.  
*Parameters:*
    - **event** - *Event*  
    The triggering event.
*Example:*
```
[
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
]
```


