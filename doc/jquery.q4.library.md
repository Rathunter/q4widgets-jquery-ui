# q4.library

### A colletion of many different document types in the same widget.
Documents can be filtered by title, tag, or date.

*Source file: `q4.library.js`, line 2*  
*Author(s): marcusk@q4websystems.com *  
*Requires:*
- Moment.js
- Mustache.js
- q4.pager


## Options
- **feedUrl** - *string*  
The base URL for the Q4 website.  

- **perPage** - *number*  
The number of items to display per page, or 0 for unlimited.  
*Default:* `0`  

- **sortByYear** - *boolean*  
Whether to divide the documents by year, or show all at once.  
*Default:* `true`  

- **allowAllYears** - *boolean*  
If using a years filter, whether to show an "all years" option.  
*Default:* `true`  

- **allYearsText** - *string*  
The label for the "all years" option.  
*Default:* `"All"`  

- **startYear** - *number*  
The year to display first. Default is "all", or most recent.  
*Default:* `null`  
*Example:* ` `new Date().getFullYear()``  

- **dateFormat** - *string*  
A Moment.js date format string.  
*Default:* `"MM/DD/YYYY"`  

- **template** - *string*  
An overall template for the timeline.  

- **loadingTemplate** - *string*  
An HTML string to display while loading.  
*Default:* `"Loading..."`  

- **docsFoundContainer** - *string*  
A selector for a message about the number of documents found.  
*Default:* `".docsfound"`  

- **docsFoundTemplate** - *string*  
A Mustache template to display the number of documents found.
- {{docCount}}  The number of documents on this page.
- {{docTotal}}  The total number of documents.
- {{docFirst}}  The index of the first document displayed.
- {{docLast}}   The index of the last document displayed.
- {{page}}      The page number.
- {{pageCount}} The total number of pages.  
*Default:* `"Showing {{docFirst}}–{{docLast}} of {{docTotal}} documents."`  

- **noDocsMessage** - *string*  
An HTML string to display when no documents are found.  
*Default:* `"No documents found. Please try broadening your search."`  

- **docContainer** - *string*  
A selector for the document list.  
*Default:* `".documents"`  

- **singleDocTemplate** - *string*  
A template for a list of single documents.  

- **multiDocTemplate** - *string*  
A template for a list of documents with sub-documents.  

- **accordionContainer** - *string*  
A selector for the overall container for multiple-document items.
Used to add an accordion effect.  
*Default:* `".multi"`  

- **accordionTrigger** - *string*  
A selector for the trigger for the multi-doc accordion effect.  
*Default:* `".trigger"`  

- **accordionDocContainer** - *string*  
A selector for the list of documents that will be shown/hidden
by the multi-doc accordion.  
*Default:* `".docs"`  

- **pagerContainer** - *string*  
A selector for the pager.  
*Default:* `".pager"`  

- **pagerTrigger** - *string*  
A selector for each pager link.  
*Default:* `"> *"`  

- **pagerTemplate** - *string*  
A template for individual pager links.  
*Default:* `"<li>{{page}}</li>"`  

- **pagerLabels** - *Object*  
An object with labels for pager navigation items.  

- **perPageOptions** - *Object*  
Options for the "documents per page" control.  
*Default:* `{container: '.perpage', input: 'select', template: '<option>{{number}}</option>', trigger: '> *', allowMulti: false, allowNone: false}`  

- **searchSelector** - *string*  
A selector for the search box.  
*Default:* `".search"`  

- **categories** - *string*  
An array of categories to display.
These can be either contentType strings,
or objects with these properties:
  name: The display name.
  contentType: One of the types defined in this.contentTypes.
  cssClass: An optional class to apply to the widget.
  options: An optional object of parameters to pass to the API:
    tag: Tag(s) to filter by. Can be a string or an array.
    year: Year(s) to filter by. String or array.
    type: For contentAssets only, the download list(s) to use.  

- **catOptions** - *Object*  
Options for the category control.  
*Default:* `{container: '.content-types', input: 'trigger', template: '<li>{{name}}</li>', trigger: '> *', allowMulti: false, allowNone: false}`  

- **tags** - *Array.&lt;string&gt;&#x2F;Array.&lt;object&gt;*  
If `tagOptions.input` is `trigger` or `select`, an array of
preset tags to offer as filter options.
Tags can be either strings or {name, value} objects.  

- **tagOptions** - *Object*  
Options for the tag filter control.  
*Default:* `{container: '.tags', input: 'trigger', template: '<li>{{name}}</li>', trigger: '> *', allowMulti: true, allowNone: true}`  

- **yearOptions** - *Object*  
Options for the year filter control.  
*Default:* `{container: '.years', input: 'select', template: '<option value="{{value}}">{{year}}</option>', trigger: '> *', allowMulti: false, allowNone: false}`  

- **onFilterUpdate** - *function*  
A callback fired after a filter control is updated,
but before matching documents are loaded.
Use event.preventDefault() to cancel loading documents.  
*Parameters:*
    - **event** - *Event*  
    The triggering event.

- **pageComplete** - *function*  
A callback fired after loading a new page of documents.  
*Parameters:*
    - **event** - *Event*  
    The triggering event.


## Methods
- **setFilter**  
Set the value of one of the filters.  
*Parameters:*
    - **filter** - *string*  
    The filter to update.
    - **value** - *number&#x2F;string*  
    The value to assign to the filter.
    - **reload** - *boolean*  
    Whether to fetch fresh documents.
