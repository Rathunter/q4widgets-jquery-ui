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

- **menuItemTemplate** - *string*  
A recursive Mustache template for each menu item.  
*Default:* `false`  

- **bodyItemTemplate** - *string*  
A Mustache template for each item's body content.  
*Default:* `false`  

- **content** - *boolean*  
A nested array of menu item objects, each with these properties:
- `title`   The title to display in the menu.
- `content` The body content to display when an item is clicked.
- `items`   An optional array of child menu items.  
*Default:* `false`  


