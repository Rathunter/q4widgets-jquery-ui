# q4.treemenu

### An expanding tree-style table of contents for a set of content.

*Source file: `q4.treemenu.js`, line 2*  
*Author(s): marcusk@q4websystems.com *  
*Requires:*
- Mustache.js


## Options
- **openMultipleItems** - *boolean*  
Whether opening a menu item will close its sibling items.  
*Default:* `false`  

- **menuContainer** - *string*  
A selector in the main template for the menu.  
*Default:* `".menu"`  

- **bodyContainer** - *string*  
A selector in the main template the body content.  
*Default:* `".body"`  

- **submenu** - *string*  
A selector in the menu item template for child menu items.  
*Default:* `".submenu"`  

- **trigger** - *string*  
A selector in the menu item template to display the content.  
*Default:* `".itemLink"`  

- **expandTrigger** - *string*  
A selector in the menu item template to toggle child items.  
*Default:* `".itemExpand"`  

- **expandText** - *string*  
The text to display in a collapsed menu item's trigger.  
*Default:* `"[ + ]"`  

- **collapseText** - *string*  
The text to display in an expanded menu item's trigger.  
*Default:* `"[ - ]"`  

- **itemClass** - *string*  
A class to add to each menu item.  
*Default:* `"treemenu-item"`  

- **activeClass** - *string*  
A class to add to each menu item.  
*Default:* `"treemenu-active"`  

- **expandedClass** - *string*  
A class to add to an expanded menu item.  
*Default:* `"treemenu-expanded"`  

- **template** - *string*  
A Mustache template for the overall widget.  
*Default:* `false`  
*Example:*
```
'<ul class="menu"></ul>' +
'<div class="body"></div>'
```

- **menuItemTemplate** - *string*  
A recursive Mustache template for each menu item.  
*Default:* `false`  
*Example:*
```
'<li>' +
    '<span class="itemExpand"></span>' +
    '<a class="itemLink" href="#">{{title}}</a>' +
    '<ul class="submenu"></ul>' +
'</li>'
```

- **bodyItemTemplate** - *string*  
A Mustache template for each item's body content.  
*Default:* `false`  
*Example:*
```
'<div>' +
    '<h4>{{title}}</h4>' +
    '<div class="itemContent">{{{content}}}</div>' +
'</div>'
```

- **content** - *boolean*  
A nested array of menu item objects, each with these properties:
- `title`   The title to display in the menu.
- `content` The body content to display when an item is clicked.
- `items`   An optional array of child menu items.  
*Default:* `false`  
*Example:*
```
[
    {
        title: 'Item 1',
        content: 'Item 1 content',
        items: [
            {
                title: 'Item 1.1',
                content: 'Item 1.1 content'
            }
        ]
    }
]
```


