# q4.pager

### A navigator for any kind of paginated content.

*Source file: `jquery.q4.pager.js`, line 2*  
*Author(s): marcusk@q4websystems.com *  
*Requires:*
- Mustache.js


## Options
- **count** - *number*  
The number of items to page through.  

- **perPage** - *number*  
The number of items per page.  

- **pages** - *Array.&lt;string&gt;&#x2F;Array.&lt;number&gt;*  
A list of page numbers or labels. If this is empty, page numbers
will be generated from `count` and `perPage`.  

- **startPage** - *number*  
The active page on initialization.  
*Default:* `1`  

- **showFirstLast** - *boolean*  
Whether to show first/last page triggers.  
*Default:* `true`  

- **showPrevNext** - *boolean*  
Whether to show previous/next page triggers.  
*Default:* `true`  

- **trigger** - *string*  
A selector for each trigger.  
*Default:* `"> *"`  

- **template** - *string*  
A template for each trigger. Use {{page}} for the page number or label.  
*Default:* `"<span>{{page}}</span>"`  

- **labels** - *Object*  
The text to display for first/last/previous/next page triggers.  

- **beforeChange** - *function*  
A callback fired after a trigger is clicked.  
*Parameters:*
    - **event** - *Event*  
    The triggering event.
    - **data** - *Object*  
    A data object with these properties:
- `page`     The page we are changing to.
- `prevPage` The page we are changing from.

- **afterChange** - *function*  
A callback fired after updating the pager.  
*Parameters:*
    - **event** - *Event*  
    The triggering event.
    - **data** - *Object*  
    A data object with these properties:
- `page`     The page we are changing to.
- `prevPage` The page we are changing from.


## Methods
- **changePage**  
Set the current page displayed on the pager.  
*Parameters:*
    - **page** - *number&#x2F;string*  
    The page number or label to go to.
    - **event** - *Event*  
    The event that triggered this change.
